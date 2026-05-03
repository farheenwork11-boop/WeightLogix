import csv
from datetime import timedelta  # ✅ FIX: use datetime.timedelta

from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Max
from django.db.models.functions import TruncDate

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .permissions import CanViewReports, CanExportReports
from .serializers import (
    DashboardSerializer,
    DailySummarySerializer,
    CustomerReportRowSerializer,
    VehicleReportRowSerializer,
    ProductSummaryRowSerializer,
    FinancialSummarySerializer,
)
from .services import (
    build_simple_pdf,
    date_range_from_period,
    to_float,
)

from slips.models import Slip
from api.utils import current_branch_id


# -------------------------
# Branch scope helper (Header branch support)
# -------------------------
def get_scoped_slips_qs(request):
    """
    Company + Branch scope based on role + optional header branch.

    Rules:
    - Always enforce company_id
    - Admin/Manager:
        - if X-Branch-Id (or ?branch_id=) provided => filter to that branch (still same company)
        - else => all branches of company
    """
    user = request.user

    if getattr(user, "is_superuser", False):
        # superuser: no restriction (optional: you can still restrict if you want)
        return Slip.objects.all()

    company_name = (getattr(user, "company", "") or "").strip()
    if not company_name:
        return Slip.objects.none()

    from companies.models import Company
    company = Company.objects.filter(name=company_name).first()
    if not company:
        return Slip.objects.none()

    company_id = company.id

    role = (getattr(user, "role", "") or "").strip()
    qs = Slip.objects.filter(company_id=company_id)

    if role in {"Admin", "Manager"}:
        bid = current_branch_id(request, user=user)
        if bid:
            qs = qs.filter(branch_id=bid)
        return qs

    # Reports are Admin/Manager only, but safe fallback:
    raise PermissionDenied("Not allowed.")


class ReportsDashboardView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        period = request.query_params.get("period", "last30")
        start_date, end_date = date_range_from_period(period)

        qs = get_scoped_slips_qs(request)
        qs = qs.filter(in_at__date__gte=start_date, in_at__date__lte=end_date)

        total_slips = qs.count()
        total_weight = to_float(qs.aggregate(v=Sum("net_weight"))["v"])
        revenue_est = to_float(qs.aggregate(v=Sum("amount"))["v"])

        # Trend (last 7 days) based on in_at
        trend_qs = get_scoped_slips_qs(request)
        trend_qs = trend_qs.filter(
            in_at__date__gte=end_date - timedelta(days=6),  # ✅ FIX
            in_at__date__lte=end_date,
        )

        trend = (
            trend_qs.annotate(day=TruncDate("in_at"))
            .values("day")
            .annotate(total=Sum("net_weight"))
            .order_by("day")
        )
        weight_trend = [{"date": r["day"], "total_weight": to_float(r["total"])} for r in trend]

        # Top customers
        top_cust = (
            qs.values("customer_id", "customer__name")
            .annotate(slips=Count("id"), total_weight=Sum("net_weight"))
            .order_by("-total_weight")[:5]
        )
        top_customers = [
            {
                "customer_id": r["customer_id"],
                "name": r["customer__name"] or "Walk-in",
                "slips": r["slips"],
                "total_weight": to_float(r["total_weight"]),
            }
            for r in top_cust
        ]

        payload = {
            "total_weight": total_weight,
            "total_slips": total_slips,
            "revenue_est": revenue_est,
            "weight_trend_last_7_days": weight_trend,
            "top_customers": top_customers,
        }
        return Response(DashboardSerializer(payload).data)


class DailySummaryView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        # date=YYYY-MM-DD (optional)
        date_str = request.query_params.get("date")
        if date_str:
            day = timezone.datetime.fromisoformat(date_str).date()
        else:
            day = timezone.localdate()

        qs = get_scoped_slips_qs(request).filter(in_at__date=day)

        total_slips = qs.count()
        total_weight = to_float(qs.aggregate(v=Sum("net_weight"))["v"])
        avg_weight = to_float(qs.aggregate(v=Avg("net_weight"))["v"])

        # Active hours: min(in_at) to max(out_at) (fallback: max(in_at))
        min_in = qs.order_by("in_at").values_list("in_at", flat=True).first()
        max_out = qs.order_by("-out_at").values_list("out_at", flat=True).first()
        if not max_out:
            max_out = qs.order_by("-in_at").values_list("in_at", flat=True).first()

        if min_in and max_out:
            active_hours = max((max_out - min_in).total_seconds() / 3600.0, 0)
        else:
            active_hours = 0.0

        tx = qs.select_related("customer", "vehicle", "material").order_by("-in_at")[:200]
        transactions = []
        for s in tx:
            in_time = timezone.localtime(s.in_at).strftime("%I:%M %p") if s.in_at else ""
            transactions.append(
                {
                    "id": s.id,
                    "serial_no": s.serial_no,
                    "time": in_time,
                    "customer": (s.customer.name if s.customer else (s.party_name or "Walk-in")),
                    "vehicle": (s.vehicle.reg if s.vehicle else ""),
                    "material": (s.material.name if s.material else ""),
                    "net_weight": to_float(s.net_weight),
                    "status": s.status,
                }
            )

        payload = {
            "date": day,
            "total_slips": total_slips,
            "total_weight": total_weight,
            "avg_weight_per_slip": avg_weight,
            "active_hours": float(active_hours),
            "transactions": transactions,
        }
        return Response(DailySummarySerializer(payload).data)


class CustomerReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        period = request.query_params.get("period", "this_month")
        start_date, end_date = date_range_from_period(period)

        qs = get_scoped_slips_qs(request)
        qs = qs.filter(in_at__date__gte=start_date, in_at__date__lte=end_date)

        rows = (
            qs.values("customer_id", "customer__name")
            .annotate(
                total_slips=Count("id"),
                total_weight=Sum("net_weight"),
                last_active=Max("in_at"),
            )
            .order_by("-total_weight")
        )

        data = []
        for r in rows:
            data.append(
                {
                    "customer_id": r["customer_id"],
                    "customer_name": r["customer__name"] or "Walk-in",
                    "total_slips": r["total_slips"],
                    "total_weight": to_float(r["total_weight"]),
                    "last_active": r["last_active"],
                }
            )

        return Response(CustomerReportRowSerializer(data, many=True).data)


class VehicleReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        period = request.query_params.get("period", "last30")
        start_date, end_date = date_range_from_period(period)

        qs = get_scoped_slips_qs(request)
        qs = qs.filter(in_at__date__gte=start_date, in_at__date__lte=end_date)

        if q:
            qs = qs.filter(vehicle__reg__icontains=q)

        rows = (
            qs.values("vehicle_id", "vehicle__reg", "vehicle__type")
            .annotate(
                trips=Count("id"),
                avg_weight=Avg("net_weight"),
                total_weight=Sum("net_weight"),
                last_visit=Max("in_at"),
            )
            .order_by("-total_weight")
        )

        data = []
        for r in rows:
            data.append(
                {
                    "vehicle_id": r["vehicle_id"],
                    "reg": r["vehicle__reg"] or "",
                    "vehicle_type": r.get("vehicle__type") or "",
                    "trips": r["trips"],
                    "avg_weight": to_float(r["avg_weight"]),
                    "total_weight": to_float(r["total_weight"]),
                    "last_visit": r["last_visit"],
                }
            )

        return Response(VehicleReportRowSerializer(data, many=True).data)


class ProductSummaryView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        period = request.query_params.get("period", "last30")
        start_date, end_date = date_range_from_period(period)

        qs = get_scoped_slips_qs(request)
        qs = qs.filter(in_at__date__gte=start_date, in_at__date__lte=end_date)

        total_weight = to_float(qs.aggregate(v=Sum("net_weight"))["v"]) or 1.0

        rows = (
            qs.values("material_id", "material__name")
            .annotate(
                slips=Count("id"),
                total_weight=Sum("net_weight"),
            )
            .order_by("-total_weight")
        )

        data = []
        for r in rows:
            w = to_float(r["total_weight"])
            data.append(
                {
                    "material_id": r["material_id"],
                    "material_name": r["material__name"] or "",
                    "slips": r["slips"],
                    "total_weight": w,
                    "percentage": round((w / total_weight) * 100.0, 2),
                }
            )

        return Response(ProductSummaryRowSerializer(data, many=True).data)


class FinancialReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        period = request.query_params.get("period", "this_month")
        start_date, end_date = date_range_from_period(period)

        qs = get_scoped_slips_qs(request)
        qs = qs.filter(in_at__date__gte=start_date, in_at__date__lte=end_date)

        total_revenue = to_float(qs.aggregate(v=Sum("amount"))["v"])
        avg_ticket = to_float(qs.aggregate(v=Avg("amount"))["v"])

        # outstanding = sum(amount where paid == "No"
        outstanding = to_float(qs.filter(paid=Slip.PAID_NO).aggregate(v=Sum("amount"))["v"])

        tx = qs.select_related("customer").order_by("-in_at")[:50]
        recent = []
        for s in tx:
            recent.append(
                {
                    "date": s.in_at,
                    "description": f"Weighing Charge - SL-{s.serial_no}",
                    "customer": (s.customer.name if s.customer else (s.party_name or "Walk-in")),
                    "method": ("Cash" if s.paid == Slip.PAID_YES else "Credit"),
                    "amount": to_float(s.amount),
                    "paid": s.paid,
                }
            )

        payload = {
            "total_revenue": total_revenue,
            "avg_ticket": avg_ticket,
            "outstanding": outstanding,
            "recent_transactions": recent,
        }
        return Response(FinancialSummarySerializer(payload).data)


# -------------------------
# Exports
# -------------------------

class ExportDailyPDFView(APIView):
    permission_classes = [CanExportReports]

    def get(self, request):
        date_str = request.query_params.get("date")
        day = timezone.localdate()
        if date_str:
            day = timezone.datetime.fromisoformat(date_str).date()

        qs = get_scoped_slips_qs(request).filter(in_at__date=day)

        total_slips = qs.count()
        total_weight = to_float(qs.aggregate(v=Sum("net_weight"))["v"])
        total_rev = to_float(qs.aggregate(v=Sum("amount"))["v"])

        lines = [
            f"Date: {day}",
            f"Total Slips: {total_slips}",
            f"Total Net Weight: {total_weight}",
            f"Total Revenue: {total_rev}",
            "",
            "Recent Transactions:",
        ]

        for s in qs.select_related("customer", "vehicle", "material").order_by("-in_at")[:30]:
            lines.append(
                f"SN {s.serial_no} | {s.vehicle.reg if s.vehicle else ''} | "
                f"{(s.customer.name if s.customer else (s.party_name or 'Walk-in'))} | "
                f"{(s.material.name if s.material else '')} | "
                f"net={to_float(s.net_weight)} | amt={to_float(s.amount)} | paid={s.paid}"
            )

        pdf_bytes = build_simple_pdf("Daily Summary Report", lines)
        resp = HttpResponse(pdf_bytes, content_type="application/pdf")
        resp["Content-Disposition"] = f'attachment; filename="daily-summary-{day}.pdf"'
        return resp


class ExportCustomersCSVView(APIView):
    permission_classes = [CanExportReports]

    def get(self, request):
        period = request.query_params.get("period", "this_month")
        start_date, end_date = date_range_from_period(period)

        qs = get_scoped_slips_qs(request)
        qs = qs.filter(in_at__date__gte=start_date, in_at__date__lte=end_date)

        rows = (
            qs.values("customer__name")
            .annotate(slips=Count("id"), total_weight=Sum("net_weight"), total_amount=Sum("amount"))
            .order_by("-total_weight")
        )

        resp = HttpResponse(content_type="text/csv")
        resp["Content-Disposition"] = f'attachment; filename="customers-report-{period}.csv"'
        writer = csv.writer(resp)
        writer.writerow(["Customer", "Slips", "Total Weight", "Total Amount"])

        for r in rows:
            writer.writerow(
                [
                    r["customer__name"] or "Walk-in",
                    r["slips"],
                    to_float(r["total_weight"]),
                    to_float(r["total_amount"]),
                ]
            )

        return resp

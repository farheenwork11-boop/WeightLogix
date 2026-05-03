from datetime import timedelta

from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDate
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from slips.models import Slip


# -------------------------
# Permissions
# -------------------------
class IsAdminOrManager(BasePermission):
    """
    Allow only Admin / Manager roles.
    Assumes request.user.role exists (e.g. 'Admin', 'Manager', 'Operator', 'Viewer')
    """
    allowed = {"Admin", "Manager"}

    def has_permission(self, request, view):
        role = getattr(request.user, "role", None) or ""
        return role in self.allowed


# -------------------------
# Helpers
# -------------------------
def _get_company_id(user):
    return getattr(user, "company_id", None)


# dashboard/views.py

from api.utils import current_branch_id

def _get_branch_id_for_scope(request):
    """
    Branch-wise dashboard:
      - Admin: branch header/query se choose kar sakta
      - Manager/Operator: forced to their own branch_id
    """
    return current_branch_id(request, user=request.user)


def _slip_base_qs(request):
    user = request.user
    company_id = _get_company_id(user)
    branch_id = _get_branch_id_for_scope(request)

    qs = Slip.objects.all()

    # Always enforce company scope
    if company_id:
        qs = qs.filter(company_id=company_id)

    # Enforce branch scope
    if branch_id:
        qs = qs.filter(branch_id=branch_id)

    return qs


def _pct_change(current, previous):
    try:
        current = float(current or 0)
        previous = float(previous or 0)
        if previous == 0:
            return 0
        return round(((current - previous) / previous) * 100, 2)
    except Exception:
        return 0


# -------------------------
# API Endpoints
# -------------------------
class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get(self, request):
        qs = _slip_base_qs(request)

        now = timezone.now()
        start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_yesterday = start_today - timedelta(days=1)

        last24 = now - timedelta(hours=24)
        prev24_start = last24 - timedelta(hours=24)

        # Today slips count (created today OR in_at today)
        weigh_ins_today = qs.filter(
            Q(created_at__gte=start_today) | Q(in_at__gte=start_today)
        ).count()

        # Yesterday comparison for trend
        weigh_ins_yesterday = qs.filter(
            Q(created_at__gte=start_yesterday, created_at__lt=start_today)
            | Q(in_at__gte=start_yesterday, in_at__lt=start_today)
        ).count()

        # Pending slips
        pending_slips = qs.filter(status=Slip.STATUS_PENDING).count()

        # Total weight (24h) => sum net_weight for completed slips in last 24 hours
        total_weight_24h_kg = (
            qs.filter(status=Slip.STATUS_COMPLETED, out_at__gte=last24)
            .aggregate(s=Sum("net_weight"))
            .get("s")
            or 0
        )

        # Previous 24h for trend
        prev_weight_24h_kg = (
            qs.filter(status=Slip.STATUS_COMPLETED, out_at__gte=prev24_start, out_at__lt=last24)
            .aggregate(s=Sum("net_weight"))
            .get("s")
            or 0
        )

        # Scales info (devices/scales app optional)
        active_scales = 0
        total_scales = 0
        scales_status = "Online"

        try:
            from devices.models import Device  # if your model name differs, tell me
            dev_qs = Device.objects.all()
            company_id = _get_company_id(request.user)
            branch_id = _get_branch_id_for_scope(request)

            if company_id and hasattr(Device, "company_id"):
                dev_qs = dev_qs.filter(company_id=company_id)
            if branch_id and hasattr(Device, "branch_id"):
                dev_qs = dev_qs.filter(branch_id=branch_id)

            total_scales = dev_qs.count()
            # consider Online/Active same
            active_scales = dev_qs.filter(status__in=["Online", "Active"]).count()
            scales_status = "Online" if active_scales > 0 else "Offline"
        except Exception:
            # if devices app not ready, keep zeros
            pass

        data = {
            "weigh_ins_today": weigh_ins_today,
            "pending_slips": pending_slips,
            "total_weight_24h_kg": int(total_weight_24h_kg or 0),

            "active_scales": active_scales,
            "total_scales": total_scales,
            "scales_status": scales_status,

            "pending_label": "Needs Review" if pending_slips else "OK",

            "weighins_trend_pct": _pct_change(weigh_ins_today, weigh_ins_yesterday),
            "weight_trend_pct": _pct_change(total_weight_24h_kg, prev_weight_24h_kg),
        }
        return Response(data, status=status.HTTP_200_OK)


class WeeklyActivityView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get(self, request):
        qs = _slip_base_qs(request)

        days = request.query_params.get("days", "7")
        try:
            days = int(days)
        except ValueError:
            days = 7
        days = max(1, min(days, 365))

        now = timezone.now()
        start = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)

        # Group by date => count slips
        grouped = (
            qs.filter(created_at__gte=start)
            .annotate(d=TruncDate("created_at"))
            .values("d")
            .annotate(count=Count("id"))
            .order_by("d")
        )

        # Fill missing days with 0
        by_date = {row["d"]: row["count"] for row in grouped}
        series = []
        for i in range(days):
            day = (start + timedelta(days=i)).date()
            series.append({
                "label": day.strftime("%b %d"),  # e.g. Feb 01
                "date": str(day),
                "count": int(by_date.get(day, 0)),
            })

        return Response({"days": days, "series": series}, status=status.HTTP_200_OK)


class RecentSlipsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get(self, request):
        qs = _slip_base_qs(request)

        limit = request.query_params.get("limit", "5")
        try:
            limit = int(limit)
        except ValueError:
            limit = 5
        limit = max(1, min(limit, 50))

        slips = qs.select_related("vehicle", "customer", "material").order_by("-id")[:limit]

        results = []
        for s in slips:
            results.append({
                "id": s.id,
                "serial_no": s.serial_no,
                "display_id": f"#SL-{s.serial_no}",

                "status": s.status,

                "net_weight": int(s.net_weight or 0),

                # vehicle: prefer reg if your Vehicle model has 'reg'
                "vehicle_reg": getattr(getattr(s, "vehicle", None), "reg", None)
                               or getattr(getattr(s, "vehicle", None), "registration", None)
                               or getattr(getattr(s, "vehicle", None), "name", None),

                "customer_name": getattr(getattr(s, "customer", None), "name", None),
                "party_name": s.party_name,

                "material_name": getattr(getattr(s, "material", None), "name", None),

                "in_at": s.in_at,
                "out_at": s.out_at,
                "created_at": s.created_at,
            })

        return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)


class ScalesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get(self, request):
        """
        Returns list of scales/devices for the branch.
        Expected fields in frontend: {id, name, status, weight_kg}
        """
        company_id = _get_company_id(request.user)
        branch_id = _get_branch_id_for_scope(request)

        results = []

        try:
            from devices.models import Device  # adjust if your model name differs
            qs = Device.objects.all()

            if company_id and hasattr(Device, "company_id"):
                qs = qs.filter(company_id=company_id)
            if branch_id and hasattr(Device, "branch_id"):
                qs = qs.filter(branch_id=branch_id)

            qs = qs.order_by("id")[:50]

            for d in qs:
                results.append({
                    "id": d.id,
                    "name": getattr(d, "name", f"Scale #{d.id}"),
                    "status": getattr(d, "status", "Offline"),
                    "weight_kg": getattr(d, "last_weight_kg", None) or getattr(d, "weight_kg", None),
                })
        except Exception:
            # If devices not ready, return empty list (frontend handles)
            results = []

        return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)

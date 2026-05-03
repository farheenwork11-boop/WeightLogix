from __future__ import annotations

import io
from datetime import date, timedelta

from django.utils import timezone
from django.db.models import QuerySet

# PDF (simple)
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def to_float(v) -> float:
    """
    Safe convert Decimal/None/int to float
    """
    if v is None:
        return 0.0
    try:
        return float(v)
    except Exception:
        return 0.0


def date_range_from_period(period: str) -> tuple[date, date]:
    """
    Returns (start_date, end_date) inclusive.
    Used by reports views.

    Supported:
    - last30
    - this_month
    - last_month
    - this_year
    - last7
    """
    today = timezone.localdate()

    period = (period or "").strip().lower()

    if period in ("last7", "last_7", "week", "last_week"):
        return today - timedelta(days=6), today

    if period in ("last30", "last_30", "30days", "last_30_days"):
        return today - timedelta(days=29), today

    if period in ("this_month", "month", "current_month"):
        start = today.replace(day=1)
        return start, today

    if period in ("last_month", "prev_month", "previous_month"):
        first_this = today.replace(day=1)
        last_prev = first_this - timedelta(days=1)
        start_prev = last_prev.replace(day=1)
        return start_prev, last_prev

    if period in ("this_year", "year", "current_year"):
        start = today.replace(month=1, day=1)
        return start, today

    # default fallback
    return today - timedelta(days=29), today


# reports/services.py
from api.utils import current_branch_id

def get_branch_filtered_queryset(qs, user, request=None):
    if getattr(user, "is_superuser", False):
        return qs

    company_id = getattr(user, "company_id", None)
    role = (getattr(user, "role", "") or "").strip()

    if company_id:
        qs = qs.filter(company_id=company_id)

    # header selected branch (Admin only) OR forced branch (Manager/Operator)
    branch_id = None
    if request is not None:
        branch_id = current_branch_id(request, user=user)
    else:
        branch_id = getattr(user, "branch_id", None)

    # Branch rule:
    # - Admin: if header has branch -> filter, else all company
    # - Manager: always branch
    if role == "Admin":
        if branch_id:
            qs = qs.filter(branch_id=branch_id)
        return qs

    if role == "Manager":
        if branch_id:
            qs = qs.filter(branch_id=branch_id)
        return qs

    return qs.none()


def build_simple_pdf(title: str, lines: list[str]) -> bytes:
    """
    Minimal PDF builder (ReportLab) used for exports.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Title
    y = height - 60
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, y, title)

    # Body
    y -= 30
    c.setFont("Helvetica", 10)

    for line in lines:
        # New page if needed
        if y < 40:
            c.showPage()
            y = height - 60
            c.setFont("Helvetica", 10)
        c.drawString(40, y, str(line)[:160])
        y -= 14

    c.showPage()
    c.save()
    pdf = buffer.getvalue()
    buffer.close()
    return pdf

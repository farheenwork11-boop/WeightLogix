# slips/filters.py
import django_filters
from .models import Slip

class SlipFilter(django_filters.FilterSet):
    in_date = django_filters.DateFilter(field_name="in_at", lookup_expr="date")
    start_date = django_filters.DateFilter(field_name="in_at", lookup_expr="date__gte")
    end_date = django_filters.DateFilter(field_name="in_at", lookup_expr="date__lte")
    
    class Meta:
        model = Slip
        fields = ["status", "branch", "in_date", "start_date", "end_date"]
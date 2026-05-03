from django.contrib import admin
from .models import Slip

@admin.register(Slip)
class SlipAdmin(admin.ModelAdmin):
    list_display = ("id", "serial_no", "company", "branch", "status", "weight1", "weight2", "net_weight", "in_at", "out_at")
    list_filter = ("status", "company", "branch")
    search_fields = ("serial_no", "party_name", "supplier_name", "phone")

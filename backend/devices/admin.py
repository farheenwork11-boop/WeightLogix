from django.contrib import admin
from .models import Device

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = (
        "code", "name", "branch", "status", "ip", "port",
        "calibration_due", "last_sync_at", "is_active"
    )
    list_filter = ("branch", "status", "is_active")
    search_fields = ("code", "name", "ip")

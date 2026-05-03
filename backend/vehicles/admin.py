from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("id", "reg", "type", "driver", "capacity", "status", "company", "branch")
    list_filter = ("status", "type", "company", "branch")
    search_fields = ("reg", "driver", "type")
    ordering = ("-id",)

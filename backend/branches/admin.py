# branches/admin.py
from django.contrib import admin
from .models import Branch


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "company", "manager_display", "status", "created_at")
    list_filter = ("status", "company")
    search_fields = ("name", "location", "company", "manager__email", "manager__first_name", "manager__last_name")
    autocomplete_fields = ("manager",)
    ordering = ("-id",)

    @admin.display(description="Manager")
    def manager_display(self, obj):
        m = obj.manager
        if not m:
            return "-"
        full = (m.get_full_name() or "").strip()
        return full or (getattr(m, "email", "") or f"User#{m.id}")

from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "phone", "customer_type", "status", "balance", "company", "branch")
    list_filter = ("status", "customer_type", "company", "branch")
    search_fields = ("code", "name", "phone", "contact", "email")
    ordering = ("-id",)

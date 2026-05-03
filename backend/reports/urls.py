from django.urls import path

from .views import (
    ReportsDashboardView,
    DailySummaryView,
    CustomerReportView,
    VehicleReportView,
    ProductSummaryView,
    FinancialReportView,
    ExportDailyPDFView,
    ExportCustomersCSVView,
)

app_name = "reports"

urlpatterns = [
    # main dashboard cards + trend + top customers
    path("dashboard/", ReportsDashboardView.as_view(), name="reports-dashboard"),

    # report pages data
    path("daily/", DailySummaryView.as_view(), name="reports-daily"),
    path("customers/", CustomerReportView.as_view(), name="reports-customers"),
    path("vehicles/", VehicleReportView.as_view(), name="reports-vehicles"),
    path("products/", ProductSummaryView.as_view(), name="reports-products"),
    path("financial/", FinancialReportView.as_view(), name="reports-financial"),

    # exports
    path("export/daily.pdf", ExportDailyPDFView.as_view(), name="export-daily-pdf"),
    path("export/customers.csv", ExportCustomersCSVView.as_view(), name="export-customers-csv"),
]

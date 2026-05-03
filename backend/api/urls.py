from django.urls import path, include
from .views import health

app_name = "api"

urlpatterns = [
    path("health/", health, name="api-health"),

    path("accounts/", include("accounts.urls")),
    path("branches/", include("branches.urls")),

    path("customers/", include("customers.urls")),
    path("vehicles/", include("vehicles.urls")),
    path("materials/", include("materials.urls")),
    path("slips/", include("slips.urls")),
    path("devices/", include("devices.urls")),
    path("reports/", include("reports.urls")),
    path("companies/", include("companies.urls")),
]

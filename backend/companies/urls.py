from django.urls import path

from .views import my_company_profile

app_name = "companies"

urlpatterns = [
    path("me/", my_company_profile, name="my_company_profile"),
]

from django.urls import path
from .views import branches_list_create, branches_detail, manage_summary

urlpatterns = [
    # branch dashboard
    path("manage/summary/", manage_summary),

    path("", branches_list_create),
    path("<int:pk>/", branches_detail),
]

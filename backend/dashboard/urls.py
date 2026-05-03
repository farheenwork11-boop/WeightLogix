from django.urls import path
from .views import DashboardSummaryView, WeeklyActivityView, RecentSlipsView, ScalesView

urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("weekly-activity/", WeeklyActivityView.as_view(), name="dashboard-weekly-activity"),
    path("recent-slips/", RecentSlipsView.as_view(), name="dashboard-recent-slips"),
    path("scales/", ScalesView.as_view(), name="dashboard-scales"),
]

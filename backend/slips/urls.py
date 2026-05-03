from rest_framework.routers import DefaultRouter
from .views import SlipViewSet

app_name = "slips"

router = DefaultRouter(trailing_slash=True)
router.register(r"", SlipViewSet, basename="slips")

urlpatterns = router.urls

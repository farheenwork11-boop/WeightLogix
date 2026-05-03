from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet

app_name = "vehicles"

router = DefaultRouter(trailing_slash=True)

# ✅ IMPORTANT: empty prefix so final URL becomes /api/vehicles/
router.register(r"", VehicleViewSet, basename="vehicles")

urlpatterns = router.urls

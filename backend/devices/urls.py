from rest_framework.routers import DefaultRouter
from .iot_views import DeviceViewSet

router = DefaultRouter()
router.register(r"", DeviceViewSet, basename="devices")

urlpatterns = router.urls

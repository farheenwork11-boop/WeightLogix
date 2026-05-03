from rest_framework.routers import DefaultRouter
from .views import MaterialViewSet

app_name = "materials"

router = DefaultRouter(trailing_slash=True)
router.register(r"", MaterialViewSet, basename="materials")

urlpatterns = router.urls

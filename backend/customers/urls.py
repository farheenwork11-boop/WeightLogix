from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet

app_name = "customers"

router = DefaultRouter(trailing_slash=True)

# empty prefix => /api/customers/
router.register(r"", CustomerViewSet, basename="customers")

urlpatterns = router.urls

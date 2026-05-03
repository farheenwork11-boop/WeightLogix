from django.utils import timezone
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Device
from .serializers import DeviceSerializer
from .permissions import DeviceRolePermission
from api.utils import current_branch_id


def generate_device_code():
    return f"DEV-{int(timezone.now().timestamp())}"


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.select_related("branch").filter(is_active=True)
    serializer_class = DeviceSerializer
    permission_classes = [IsAuthenticated, DeviceRolePermission]

    lookup_field = "code"
    lookup_url_kwarg = "code"

    filter_backends = [SearchFilter]
    search_fields = ["code", "name", "ip"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        role = (getattr(user, "role", "") or "").strip()

        bid = current_branch_id(self.request, user=user)

        if role == "Admin":
            return qs.filter(branch_id=bid) if bid else qs

        ub = getattr(user, "branch_id", None)
        if not ub:
            return qs.none()
        return qs.filter(branch_id=ub)

    def perform_create(self, serializer):
        user = self.request.user
        role = (getattr(user, "role", "") or "").strip()

        bid = current_branch_id(self.request, user=user)

        if role == "Admin":
            if not bid:
                raise PermissionDenied("Branch not selected. Send X-Branch-Id.")
        else:
            if not bid:
                raise PermissionDenied("User branch is not set.")

        serializer.save(
            code=generate_device_code(),
            branch_id=bid,
            last_sync_at=timezone.now(),
        )

    def perform_update(self, serializer):
        user = self.request.user
        role = (getattr(user, "role", "") or "").strip()
        instance = self.get_object()

        bid = current_branch_id(self.request, user=user)

        if role != "Admin":
            if not bid or instance.branch_id != bid:
                raise PermissionDenied("Not allowed.")
            serializer.save(branch_id=bid)
            return

        if bid and instance.branch_id != bid:
            raise PermissionDenied("You can only update devices of selected branch.")
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])

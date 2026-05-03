from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from .models import Material
from .serializers import MaterialSerializer
from .permissions import MaterialRolePermission

from api.utils import current_branch_id
from branches.models import Branch


class MaterialViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialSerializer
    permission_classes = [MaterialRolePermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "material_type", "branch"]
    search_fields = ["name", "code"]
    ordering_fields = ["id", "name", "created_at"]

    # -------------------------
    # helpers
    # -------------------------
    def _resolve_branch(self, user, require_for_admin=False):
        """
        Uses current_branch_id():
          - Admin: header/query branch OR None
          - Non-admin: forced to user.branch_id
        If require_for_admin=True => Admin must provide X-Branch-Id.
        """
        role = getattr(user, "role", "Operator")
        bid = current_branch_id(self.request, user=user)

        if role == "Admin" and require_for_admin and not bid:
            return None

        if not bid:
            return None

        branch = Branch.objects.filter(id=bid).first()
        if not branch:
            raise PermissionDenied("Selected branch not found.")
        return branch

    # -------------------------
    # queryset
    # -------------------------
    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", "Operator")

        branch = self._resolve_branch(user, require_for_admin=False)

        # ✅ branch selected/forced => show that branch only
        if branch:
            return Material.objects.filter(branch_id=branch.id)

        # ✅ Admin without branch => all materials of his company via branch.company_id
        if role == "Admin":
            company_id = getattr(user, "company_id", None)
            if not company_id:
                return Material.objects.none()
            return Material.objects.filter(branch__company_id=company_id)

        return Material.objects.none()

    # -------------------------
    # create
    # -------------------------
    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, "role", "Operator")

        branch = self._resolve_branch(user, require_for_admin=True)
        if role == "Admin" and not branch:
            raise PermissionDenied("Branch not selected. Send X-Branch-Id.")

        if not branch:
            raise PermissionDenied("User branch is not set.")

        serializer.save(branch_id=branch.id)

    # -------------------------
    # update
    # -------------------------
    def perform_update(self, serializer):
        user = self.request.user
        role = getattr(user, "role", "Operator")
        instance = self.get_object()

        branch = self._resolve_branch(user, require_for_admin=False)

        # ✅ Non-admin: must be same branch
        if role != "Admin":
            if not branch:
                raise PermissionDenied("User branch is not set.")
            if instance.branch_id != branch.id:
                raise PermissionDenied("Not allowed.")
            serializer.save(branch_id=branch.id)
            return

        # ✅ Admin:
        # If header branch provided => move to that branch (same company check if user.company_id exists)
        if branch:
            user_company_id = getattr(user, "company_id", None)
            if user_company_id and getattr(branch, "company_id", None) != user_company_id:
                raise PermissionDenied("Branch does not belong to your company.")
            serializer.save(branch_id=branch.id)
        else:
            serializer.save(branch_id=instance.branch_id)

    # -------------------------
    # toggle status
    # -------------------------
    @action(detail=True, methods=["post"])
    def toggle_status(self, request, pk=None):
        role = getattr(request.user, "role", "Operator")
        if role not in ["Admin", "Manager"]:
            raise PermissionDenied("Not allowed.")

        mat = self.get_object()
        mat.status = "Inactive" if mat.status == "Active" else "Active"
        mat.save(update_fields=["status", "updated_at"])
        return Response(MaterialSerializer(mat).data)

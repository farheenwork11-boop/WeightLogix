# vehicles/views.py
from rest_framework import viewsets, filters
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from .models import Vehicle
from .serializers import VehicleSerializer
from .permissions import VehicleRolePermission

from api.utils import current_branch_id
from branches.models import Branch
from companies.models import Company


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [VehicleRolePermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "branch", "type"]
    search_fields = ["reg", "driver", "type"]
    ordering_fields = ["id", "reg", "created_at"]

    # -------------------------
    # helpers
    # -------------------------
    def _get_branch_and_company(self, user, require_branch_for_admin=False):
        """
        Return (branch_obj_or_none, company_obj_or_none)

        ✅ Branch is taken from current_branch_id():
           - Admin: via header X-Branch-Id
           - Manager/Operator: forced to own branch (if helper does that)

        ✅ Company derived from Branch.company (string) using Company.get_or_create()
        """
        role = getattr(user, "role", "Operator")

        bid = current_branch_id(self.request, user=user)  # Admin: header based, others forced
        branch = None

        if bid:
            branch = Branch.objects.filter(id=bid).first()
            if not branch:
                raise PermissionDenied("Selected branch not found.")

            cname = (getattr(branch, "company", "") or "").strip()
            if not cname:
                raise PermissionDenied("Branch company is not set.")

            company, _ = Company.objects.get_or_create(name=cname)
            return branch, company

        # ---- no branch selected
        if role == "Admin" and not require_branch_for_admin:
            # Admin can view all vehicles of his company if user.company_id exists
            # (optional fallback - agar user.company set hai)
            cid = getattr(user, "company_id", None)
            if not cid:
                return None, None
            company = Company.objects.filter(id=cid).first()
            return None, company

        # for Admin when require_branch_for_admin=True OR non-admin without branch
        return None, None

    # -------------------------
    # queryset
    # -------------------------
    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", "Operator")

        branch, company = self._get_branch_and_company(user, require_branch_for_admin=False)

        if not company:
            return Vehicle.objects.none()

        qs = Vehicle.objects.filter(company_id=company.id)

        # If branch selected => only that branch
        if branch:
            return qs.filter(branch_id=branch.id)

        # Admin without branch => all company vehicles
        if role == "Admin":
            return qs

        return Vehicle.objects.none()

    # -------------------------
    # create
    # -------------------------
    def perform_create(self, serializer):
        user = self.request.user

        # ✅ creation MUST be under a branch (admin too)
        branch, company = self._get_branch_and_company(user, require_branch_for_admin=True)
        if not branch or not company:
            raise PermissionDenied("Branch not selected. Send X-Branch-Id.")

        serializer.save(company_id=company.id, branch_id=branch.id)

    # -------------------------
    # update
    # -------------------------
    def perform_update(self, serializer):
        user = self.request.user
        role = getattr(user, "role", "Operator")
        instance = self.get_object()

        branch, company = self._get_branch_and_company(user, require_branch_for_admin=False)

        # ✅ Must stay within resolved company (when available)
        if company and instance.company_id != company.id:
            raise PermissionDenied("Not allowed.")

        # Non-admin must be in same forced branch
        if role != "Admin":
            if not branch:
                raise PermissionDenied("User branch is not set.")
            if instance.branch_id != branch.id:
                raise PermissionDenied("Not allowed.")

            # ✅ Non-admin cannot move branch, always keep same
            serializer.save(company_id=company.id, branch_id=branch.id)
            return

        # Admin:
        if branch and company:
            # if admin sent branch header, allow move within that branch/company scope
            serializer.save(company_id=company.id, branch_id=branch.id)
        else:
            # no branch header => keep existing branch/company, only update fields
            serializer.save(company_id=instance.company_id, branch_id=instance.branch_id)

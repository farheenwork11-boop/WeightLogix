# customers/views.py
from rest_framework import viewsets, filters
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from .models import Customer
from .serializers import CustomerSerializer
from .permissions import CustomerRolePermission

from api.utils import current_branch_id
from branches.models import Branch
from companies.models import Company


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [CustomerRolePermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer_type", "branch"]
    search_fields = ["name", "contact", "phone", "email"]
    ordering_fields = ["id", "name", "created_at"]

    # -------------------------
    # helpers
    # -------------------------
    def _resolve_branch_and_company(self, user, require_branch=False):
        """
        ✅ Always resolve company via selected branch (header X-Branch-Id)
        - Admin: must send branch for CREATE (require_branch=True)
        - Manager/Operator: branch forced by current_branch_id()
        """
        role = getattr(user, "role", "Operator")

        bid = current_branch_id(self.request, user=user)
        if not bid:
            if require_branch:
                raise PermissionDenied("Branch not selected. Send X-Branch-Id.")
            return None, None

        branch = Branch.objects.filter(id=bid).first()
        if not branch:
            raise PermissionDenied("Selected branch not found.")

        cname = (getattr(branch, "company", "") or "").strip()
        if not cname:
            raise PermissionDenied("Branch company is not set.")

        company, _ = Company.objects.get_or_create(name=cname)
        return branch, company

    # -------------------------
    # queryset
    # -------------------------
    def get_queryset(self):
        """
        ✅ Customers always branch-scoped
        Admin also MUST select a branch to view customers
        """
        user = self.request.user
        role = getattr(user, "role", "Operator")

        # ✅ force branch for all roles (UI is branch-based)
        branch, company = self._resolve_branch_and_company(user, require_branch=True)

        qs = Customer.objects.filter(company_id=company.id, branch_id=branch.id)
        return qs

    # -------------------------
    # create
    # -------------------------
    def perform_create(self, serializer):
        """
        ✅ customer always created under selected branch
        ✅ company auto derived from branch
        """
        user = self.request.user
        role = getattr(user, "role", "Operator")

        branch, company = self._resolve_branch_and_company(user, require_branch=True)
        serializer.save(company_id=company.id, branch_id=branch.id)

    # -------------------------
    # update
    # -------------------------
    def perform_update(self, serializer):
        """
        ✅ update only within selected branch scope
        - Admin: must have branch header selected (same UX as create)
        - Manager: forced to own branch
        """
        user = self.request.user
        role = getattr(user, "role", "Operator")

        instance = self.get_object()
        branch, company = self._resolve_branch_and_company(user, require_branch=True)

        # ✅ Do not allow updating customer outside selected branch
        if instance.branch_id != branch.id:
            raise PermissionDenied("Not allowed: customer is not in selected branch.")

        # ✅ keep company + branch consistent
        serializer.save(company_id=company.id, branch_id=branch.id)

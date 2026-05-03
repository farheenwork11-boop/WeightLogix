from rest_framework.permissions import BasePermission, SAFE_METHODS
from .utils import is_manager, is_operator, current_branch_id, assert_branch_allowed


class BranchScopePermission(BasePermission):
    """
    Ensures Manager/Operator can access only their own branch.
    Admin can access all branches.
    """
    message = "Branch access denied."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        bid = current_branch_id(request, user=user)

        try:
            assert_branch_allowed(user, bid)
        except PermissionError:
            return False

        # Operator MUST have branch assigned
        if is_operator(user) and not getattr(user, "branch_id", None):
            self.message = "User has no branch assigned."
            return False

        return True


class RoleActionPermission(BasePermission):
    """
    Role rules:
      - Manager: full CRUD in own branch
      - Operator: Create + Read only in own branch (no update/delete)
    """
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Branch check
        bid = current_branch_id(request, user=user)
        try:
            assert_branch_allowed(user, bid)
        except PermissionError:
            return False

        # Manager allowed all (branch already enforced)
        if is_manager(user):
            return True

        # Operator: only read + create
        if is_operator(user):
            if request.method in SAFE_METHODS:
                return True
            if request.method == "POST":
                return True
            return False

        return False


class BranchManagePermission(BasePermission):
    """
    Only Manager can create/update/delete branches.
    Operator can read only (safe methods).
    """
    message = "Only manager can manage branches."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return is_manager(user)

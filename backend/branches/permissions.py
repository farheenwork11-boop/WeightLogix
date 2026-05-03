from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.permissions import is_manager, is_operator


class IsManagerForBranchCrud(BasePermission):
    """
    Manager and Operator can read branches.
    Only Manager can create/update/delete branches.
    """
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            # Allow read access to Manager and Operator
            return is_manager(u) or is_operator(u)

        # Only Manager can create/update/delete
        return is_manager(u)

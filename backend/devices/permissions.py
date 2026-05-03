from rest_framework.permissions import BasePermission, SAFE_METHODS

class DeviceRolePermission(BasePermission):
    """
    Manager:       full CRUD only on own branch
    Operator:      READ + CREATE only (no update/delete) on own branch
    """

    def _role(self, user):
        return getattr(user, "role", "Operator")

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        role = self._role(user)

        # Read allowed for all these
        if request.method in SAFE_METHODS:
            return role in ["Owner", "Admin", "Manager", "Operator"]

        # Create allowed
        if request.method == "POST":
            return role in ["Owner", "Admin", "Manager", "Operator"]

        # Update/Delete allowed only Owner/Admin/Manager
        if request.method in ["PUT", "PATCH", "DELETE"]:
            return role in ["Owner", "Admin", "Manager"]

        return False

    def has_object_permission(self, request, view, obj):
        role = self._role(request.user)

        # Owner/Admin can do anything on any object
        if role in ["Owner", "Admin"]:
            return True

        # Manager/Operator only on own branch objects
        user_branch = getattr(request.user, "branch", None)
        if not user_branch:
            return False

        return obj.branch_id == user_branch.id

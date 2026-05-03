from rest_framework.permissions import BasePermission, SAFE_METHODS


class SlipRolePermission(BasePermission):
    """
    Admin/Manager: full
    Operator: read + create first weight + complete second weight
    Viewer: read only
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        role = getattr(user, "role", "Operator")

        if request.method in SAFE_METHODS:
            return True

        if view.action in ["create_first", "complete_second"]:
            return role in ["Admin", "Manager", "Operator"]

        if request.method == "POST":
            return role in ["Admin", "Manager", "Operator"]

        if request.method in ["PUT", "PATCH"]:
            return role in ["Admin", "Manager"]

        if request.method == "DELETE":
            return role in ["Admin", "Manager"]

        return False

from rest_framework.permissions import BasePermission, SAFE_METHODS


class VehicleRolePermission(BasePermission):
    """
    Admin:   full CRUD (all branches in same company)
    Manager: full CRUD (only own branch)
    Operator: Read + Create (only own branch)
    Viewer:  Read only
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        role = getattr(user, "role", "Operator")

        if request.method in SAFE_METHODS:
            return True

        if request.method == "POST":
            return role in ["Admin", "Manager", "Operator"]

        if request.method in ["PUT", "PATCH", "DELETE"]:
            return role in ["Admin", "Manager"]

        return False

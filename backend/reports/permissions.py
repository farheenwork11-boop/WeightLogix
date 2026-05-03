from rest_framework.permissions import BasePermission


class CanViewReports(BasePermission):
    """
    Only Admin/Manager can view reports (branch-wise scope handled in services).
    """
    allowed_roles = {"Admin", "Manager"}

    def has_permission(self, request, view):
        user = request.user
        role = getattr(user, "role", None) or ""
        return bool(user and user.is_authenticated and role in self.allowed_roles)


class CanExportReports(BasePermission):
    """
    Export also restricted (same as view for now).
    Later you can make it stricter (e.g. Admin only).
    """
    allowed_roles = {"Admin", "Manager"}

    def has_permission(self, request, view):
        user = request.user
        role = getattr(user, "role", None) or ""
        return bool(user and user.is_authenticated and role in self.allowed_roles)

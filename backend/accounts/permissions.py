from rest_framework.permissions import BasePermission


def role_of(user):
    return getattr(user, "role", "Operator")


def is_manager(user):
    return role_of(user) == "Manager"


def is_operator(user):
    return role_of(user) == "Operator"


class IsManagerOrOperator(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (is_manager(u) or is_operator(u)))


class CanAccessBranches(BasePermission):
    """
    Manager: can access branches
    Operator: can access branches
    """
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        return is_manager(u) or is_operator(u)




class CanManageUsers(BasePermission):
    """
    Manager: can view users list
    Operator: can view users list
    """
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        return is_manager(u) or is_operator(u)


class CanCreateUsers(BasePermission):
    """
    Manager: can create users
    Operator: cannot create users
    """
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        return is_manager(u)


class CanManageUsersForCreation(BasePermission):
    """
    Manager: can manage users across all branches
    Operator: cannot manage users
    """
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        return is_manager(u)

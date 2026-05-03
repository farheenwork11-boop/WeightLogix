# accounts/views.py
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import (
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UserListSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
)
from .permissions import CanManageUsers, CanManageUsersForCreation, CanAccessBranches
from branches.models import Branch

User = get_user_model()


def _company_from_user(user) -> str:
    return (getattr(user, "company", "") or "").strip()


# ---------------- BASIC ----------------
@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"ok": True, "message": "Accounts working"})


# ---------------- JWT ----------------
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    pass


# ---------------- AUTH ----------------
@api_view(["POST", "OPTIONS"])
@permission_classes([AllowAny])
def register(request):
    """
    React sends preflight OPTIONS.
    """
    if request.method == "OPTIONS":
        return Response(status=status.HTTP_200_OK)

    s = RegisterSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    user = s.save()
    return Response(s.to_representation(user), status=status.HTTP_201_CREATED)


# ---------------- PROFILE ----------------
@api_view(["GET"])
@authentication_classes([JWTAuthentication])  # ✅ force JWT
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response(
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": getattr(u, "role", "Operator"),
            "branch_id": getattr(u, "branch_id", None),
            "phone": getattr(u, "phone", ""),
            "company": getattr(u, "company", ""),
            "is_active": u.is_active,
        }
    )


@api_view(["PATCH"])
@authentication_classes([JWTAuthentication])  # ✅ force JWT
@permission_classes([IsAuthenticated])
def me_update(request):
    u = request.user
    data = request.data or {}

    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    email = (data.get("email") or "").lower().strip()
    phone = (data.get("phone") or "").strip()

    if email:
        if User.objects.exclude(id=u.id).filter(email=email).exists():
            return Response({"email": ["Email already exists."]}, status=400)
        u.email = email
        u.username = email

    if first_name:
        u.first_name = first_name
    if last_name is not None:
        u.last_name = last_name

    if hasattr(u, "phone"):
        u.phone = phone

    u.save()

    return Response(
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": getattr(u, "role", "Operator"),
            "branch_id": getattr(u, "branch_id", None),
            "phone": getattr(u, "phone", ""),
            "company": getattr(u, "company", ""),
            "is_active": u.is_active,
        }
    )


# ---------------- MANAGERS (for Branch dropdown) ----------------
@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, CanAccessBranches])
def managers_list(request):
    """
    ✅ For Branch manager dropdown
    Returns only SAME COMPANY managers
    """
    u = request.user
    my_company = _company_from_user(u)
    if not my_company:
        return Response({"results": []})

    qs = User.objects.filter(company=my_company, role="Manager").order_by("id")
    return Response({"results": UserListSerializer(qs, many=True).data})


# ---------------- USERS & ROLES ----------------
# Custom permission class for method-specific permissions
class CanListOrCreateUsers(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            print(f"DEBUG: User not authenticated")
            return False
            
        # Both managers and operators can list users
        if request.method == "GET":
            from .permissions import CanManageUsers
            result = CanManageUsers().has_permission(request, view)
            print(f"DEBUG: GET request, CanManageUsers result: {result}")
            return result
        # Only managers can create users
        elif request.method == "POST":
            from .permissions import CanCreateUsers
            result = CanCreateUsers().has_permission(request, view)
            print(f"DEBUG: POST request, CanCreateUsers result: {result}")
            return result
        else:
            from .permissions import CanManageUsers
            result = CanManageUsers().has_permission(request, view)
            print(f"DEBUG: Other request, CanManageUsers result: {result}")
            return result

@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication])  # ✅ force JWT
@permission_classes([IsAuthenticated, CanListOrCreateUsers])
def users_list_create(request):
    u = request.user
    role = getattr(u, "role", "Operator")
    
    # Debug logging
    print(f"DEBUG: User {u.username} with role {role} accessing users_list_create")
    print(f"DEBUG: Request method: {request.method}")

    my_company = _company_from_user(u)
    if not my_company:
        return Response({"detail": "Your account has no company set."}, status=400)

    # -------- LIST --------
    if request.method == "GET":
        qs = User.objects.filter(company=my_company).order_by("-id")

        if role == "Manager":
            # Managers can see all users in their company
            pass
        elif role == "Operator":
            # Operators can see all users in their company (for user management interface)
            pass

        return Response({"results": UserListSerializer(qs, many=True).data})

    # -------- CREATE --------
    try:
        s = UserCreateSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

        payload = dict(s.validated_data)

        # ✅ FORCE company
        payload["company"] = my_company

        if role == "Operator":
            return Response({"detail": "Operators cannot create users."}, status=403)

        if role == "Manager" and payload.get("role") != "Operator":
            return Response({"detail": "Manager can only create Operator users."}, status=403)

        # Create user with all required attributes
        user_obj = s.create(payload)
        
        # Handle branch assignment safely - update and save the user object
        requested_branch_id = payload.get("branch_id")
        if requested_branch_id:
            # Verify that the requested branch exists and belongs to the same company
            from branches.models import Branch
            try:
                branch_obj = Branch.objects.get(id=requested_branch_id, company=my_company)
                user_obj.branch = branch_obj  # Use the branch object, not just the ID
                user_obj.save()
            except Branch.DoesNotExist:
                return Response({"detail": "Requested branch does not exist or does not belong to your company."}, status=400)
        elif role == "Manager" and getattr(u, 'branch_id', None):
            # Only assign manager's branch if manager has one and it's valid
            from branches.models import Branch
            try:
                branch_obj = Branch.objects.get(id=u.branch_id, company=my_company)
                user_obj.branch = branch_obj
                user_obj.save()
            except Branch.DoesNotExist:
                # Don't assign a branch if manager's branch is invalid
                pass
        # No need to manually assign company as it's already handled in the serializer

        return Response(UserListSerializer(user_obj).data, status=201)
    except Exception as e:
        # Log the error for debugging with more context
        print(f"Error creating user: {str(e)}")
        print(f"Request data: {request.data}")
        print(f"User role: {role}")
        print(f"User company: {my_company}")
        import traceback
        traceback.print_exc()
        return Response({"detail": f"Error creating user: {str(e)}"}, status=500)


@api_view(["PUT", "DELETE"])
@authentication_classes([JWTAuthentication])  # ✅ force JWT
@permission_classes([IsAuthenticated, CanManageUsersForCreation])
def users_update_delete(request, pk: int):
    u = request.user
    role = getattr(u, "role", "Operator")

    my_company = _company_from_user(u)
    if not my_company:
        return Response({"detail": "Your account has no company set."}, status=400)

    target = User.objects.filter(id=pk, company=my_company).first()
    if not target:
        return Response({"detail": "User not found."}, status=404)

    if role == "Manager":
        # Managers can manage users in their company
        pass
    elif role == "Operator":
        # Operators cannot manage other users
        return Response({"detail": "Operators cannot manage other users."}, status=403)

    if request.method == "DELETE":
        target.delete()
        return Response(status=204)

    s = UserUpdateSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    payload = dict(s.validated_data)

    # ✅ FORCE company
    payload["company"] = my_company

    if role == "Operator":
        return Response({"detail": "Operators cannot update users."}, status=403)

    if role == "Manager" and payload.get("role") != "Operator":
        return Response({"detail": "Manager can only assign Operator role."}, status=403)

    s.update(target, payload)

    target.company = my_company
    target.save()

    return Response(UserListSerializer(target).data)

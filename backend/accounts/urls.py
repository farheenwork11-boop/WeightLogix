# accounts/urls.py
from django.urls import path
from .views import (
    health,
    register,
    me,
    me_update,
    EmailTokenObtainPairView,
    RefreshView,
    users_list_create,
    users_update_delete,
    managers_list,   # ✅ add
)

app_name = "accounts"

urlpatterns = [
    # Health
    path("health/", health, name="health"),

    # Auth
    path("register/", register, name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", RefreshView.as_view(), name="token_refresh"),

    # Profile
    path("me/", me, name="me"),
    path("me/update/", me_update, name="me_update"),

    # ✅ Managers (for Branch dropdown)
    path("managers/", managers_list, name="managers_list"),

    # Users & Roles
    path("users/", users_list_create, name="users_list_create"),
    path("users/<int:pk>/", users_update_delete, name="users_update_delete"),
]

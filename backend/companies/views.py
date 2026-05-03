from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.permissions import role_of
from .models import Company


def _get_or_create_company_for_user(user):
    name = (getattr(user, "company", "") or "").strip()
    if not name:
        return None
    company, _ = Company.objects.get_or_create(name=name)
    return company


@api_view(["GET", "PATCH"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_company_profile(request):
    company = _get_or_create_company_for_user(request.user)
    if not company:
        return Response({"detail": "User company is not set."}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        return Response(
            {
                "name": company.name,
                "address": company.address,
                "contact_number": company.contact_number,
            }
        )

    role = role_of(request.user)
    if role not in ["Manager", "Admin"]:
        return Response({"detail": "Only Manager/Admin can update company profile."}, status=403)

    data = request.data or {}
    new_name = (data.get("name") or "").strip()
    if not new_name:
        return Response({"name": ["Company name is required."]}, status=400)

    if Company.objects.exclude(id=company.id).filter(name__iexact=new_name).exists():
        return Response({"name": ["This company name already exists."]}, status=400)

    company.name = new_name
    company.address = (data.get("address") or "").strip()
    company.contact_number = (data.get("contact_number") or "").strip()
    company.save()

    # Keep all users in this company string namespace aligned with renamed company.
    old_name = (getattr(request.user, "company", "") or "").strip()
    if old_name and old_name != new_name:
        from django.contrib.auth import get_user_model

        User = get_user_model()
        User.objects.filter(company=old_name).update(company=new_name)

    return Response(
        {
            "name": company.name,
            "address": company.address,
            "contact_number": company.contact_number,
        }
    )

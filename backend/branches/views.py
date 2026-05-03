# branches/views.py
from django.db.models import Count

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Branch
from .serializers import BranchSerializer
from .permissions import IsManagerForBranchCrud

from api.utils import current_branch_id
from api.permissions import BranchScopePermission, RoleActionPermission


def _company_from_user(user) -> str:
    return (getattr(user, "company", "") or "").strip()


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsManagerForBranchCrud])
def branches_list_create(request):
    """
    GET:
      - Manager: own company branches (devices_count)
      - Operator: only own branch
    POST:
      - Manager only (company auto + manager optional)
    """
    u = request.user
    role = getattr(u, "role", "Operator")
    my_company = _company_from_user(u)

    if not my_company:
        return Response({"detail": "Your account has no company set."}, status=400)

    if request.method == "GET":
        qs = (
            Branch.objects.filter(company=my_company)
            .annotate(devices_count=Count("devices"))
            .order_by("-id")
        )

        # Manager can see all branches in their company
        if role == "Manager":
            return Response({"results": BranchSerializer(qs, many=True, context={"request": request}).data})

        # Operator -> only own branch
        if not getattr(u, "branch_id", None):
            return Response({"detail": "User has no branch assigned."}, status=400)

        qs = qs.filter(id=u.branch_id)
        return Response({"results": BranchSerializer(qs, many=True, context={"request": request}).data})

    # POST (Manager only)
    s = BranchSerializer(data=request.data, context={"request": request})
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    b = s.save(company=my_company)

    b = Branch.objects.filter(id=b.id).annotate(devices_count=Count("devices")).first()
    return Response(BranchSerializer(b, context={"request": request}).data, status=201)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsManagerForBranchCrud])
def branches_detail(request, pk: int):
    """
    GET:
      - Manager: own company branch
      - Operator: only own branch
    PUT/DELETE: Manager only
    """
    u = request.user
    role = getattr(u, "role", "Operator")
    my_company = _company_from_user(u)

    if not my_company:
        return Response({"detail": "Your account has no company set."}, status=400)

    b = (
        Branch.objects.filter(id=pk, company=my_company)
        .annotate(devices_count=Count("devices"))
        .first()
    )
    if not b:
        return Response({"detail": "Branch not found."}, status=404)

    if request.method == "GET":
        if role == "Manager":
            # Manager can access any branch in their company
            pass
        else:  # Operator
            # Operator can only access their own branch
            if not getattr(u, "branch_id", None):
                return Response({"detail": "User has no branch assigned."}, status=400)
            if int(pk) != int(u.branch_id):
                return Response({"detail": "Branch access denied."}, status=403)

        return Response(BranchSerializer(b, context={"request": request}).data)

    if request.method == "DELETE":
        Branch.objects.filter(id=pk, company=my_company).delete()
        return Response(status=204)

    # PUT (Manager only)
    s = BranchSerializer(b, data=request.data, context={"request": request})
    if not s.is_valid():
        return Response(s.errors, status=400)

    saved = s.save(company=my_company)  # ✅ company forced

    saved = Branch.objects.filter(id=saved.id).annotate(devices_count=Count("devices")).first()
    return Response(BranchSerializer(saved, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, BranchScopePermission, RoleActionPermission])
def manage_summary(request):
    bid = current_branch_id(request, request.user)
    if not bid:
        return Response({"detail": "Branch not selected. Send X-Branch-Id."}, status=400)

    branch = Branch.objects.filter(id=bid).annotate(devices_count=Count("devices")).first()
    if not branch:
        return Response({"detail": "Branch not found."}, status=404)

    from customers.models import Customer
    from vehicles.models import Vehicle
    from materials.models import Material
    from slips.models import Slip
    from devices.models import Device

    return Response({
        "branch": BranchSerializer(branch, context={"request": request}).data,
        "counts": {
            "customers": Customer.objects.filter(branch_id=bid).count(),
            "vehicles": Vehicle.objects.filter(branch_id=bid).count(),
            "materials": Material.objects.filter(branch_id=bid).count(),
            "slips": Slip.objects.filter(branch_id=bid).count(),
            "devices": Device.objects.filter(branch_id=bid).count(),
        },
    })

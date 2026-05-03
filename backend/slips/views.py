# slips/views.py
import csv

from django.http import HttpResponse
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from branches.models import Branch
from companies.models import Company

from .filters import SlipFilter
from .models import Slip
from .permissions import SlipRolePermission
from .serializers import SlipListSerializer, SlipCreateFirstSerializer, SlipSecondWeightSerializer
from .utils import current_branch_id


class SlipViewSet(viewsets.ModelViewSet):
    """
    ✅ Branch scope: always from header/query (X-Branch-Id)
    ✅ Company scope: resolved from request.user.company (string) -> companies.Company (FK)

    Because:
    - User.company is CharField (string)
    - Slip.company is ForeignKey("companies.Company")
    """

    permission_classes = [SlipRolePermission]
    queryset = Slip.objects.none()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SlipFilter
    search_fields = ["serial_no", "party_name", "supplier_name", "phone"]
    ordering_fields = ["id", "serial_no", "in_at", "out_at"]

    # -------------------------
    # Helpers
    # -------------------------
    def _get_selected_branch(self) -> Branch:
        """
        Resolve branch from header/query.
        Operator: must match assigned user.branch_id.
        """
        user = self.request.user
        role = (getattr(user, "role", "Operator") or "").strip()

        bid = current_branch_id(self.request, user=None)  # header/query only
        if not bid and role == "Operator":
            # operator fallback to assigned branch for smoother UX
            bid = getattr(user, "branch_id", None)
        if not bid:
            raise PermissionDenied("Branch not selected. Send X-Branch-Id in header.")

        try:
            branch = Branch.objects.select_related("manager").get(id=bid)
        except Branch.DoesNotExist:
            raise PermissionDenied("Selected branch does not exist.")

        # only operator forced to their own branch
        if role == "Operator":
            user_branch_id = getattr(user, "branch_id", None)
            if not user_branch_id:
                raise PermissionDenied("User branch is not set.")
            if int(user_branch_id) != int(branch.id):
                raise PermissionDenied("You are not allowed for this branch.")

        return branch

    def _get_company_from_user(self) -> Company:
        user = self.request.user
        company_name = (getattr(user, "company", "") or "").strip()

        if not company_name:
            raise PermissionDenied("User is not linked to any company.")

        company = Company.objects.filter(name=company_name).first()
        if not company:
            raise PermissionDenied("Company record not found. Create company first.")
        return company

    def _assert_scope(self, slip: Slip):
        branch = self._get_selected_branch()
        company = self._get_company_from_user()

        if slip.branch_id != branch.id or slip.company_id != company.id:
            raise PermissionDenied("Not allowed for this branch/company.")

    # -------------------------
    # Queryset (company + branch scope)
    # -------------------------
    def get_queryset(self):
        try:
            branch = self._get_selected_branch()
            company = self._get_company_from_user()
        except PermissionDenied:
            return Slip.objects.none()

        return (
            Slip.objects.select_related("vehicle", "material", "customer")
            .filter(branch_id=branch.id, company_id=company.id)
        )

    def get_serializer_class(self):
        if self.action == "create_first":
            return SlipCreateFirstSerializer
        if self.action == "complete_second":
            return SlipSecondWeightSerializer
        return SlipListSerializer

    # -------------------------
    # Lists
    # -------------------------
    @action(detail=False, methods=["get"])
    def recent(self, request):
        qs = self.get_queryset().order_by("-id")[:20]
        return Response(SlipListSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        qs = (
            self.get_queryset()
            .filter(status=Slip.STATUS_PENDING)
            .select_related("vehicle", "material", "customer")
            .order_by("-id")[:200]
        )

        out = []
        for s in qs:
            out.append(
                {
                    "id": s.id,
                    "serialNo": s.serial_no,
                    "voucherNo": s.voucher_no,
                    "customerType": s.customer_type,

                    "vehicleId": s.vehicle_id,
                    "vehicleReg": s.vehicle.reg if s.vehicle_id else "",
                    "driver": (s.vehicle.driver if s.vehicle_id else s.driver_name),

                    "materialId": s.material_id,
                    "materialName": s.material.name if s.material_id else "",

                    "customerId": s.customer_id,
                    "customerName": s.customer.name if s.customer_id else "",

                    "partyName": s.party_name,
                    "supplierName": s.supplier_name,
                    "phone": s.phone,
                    "amount": str(s.amount),
                    "paid": s.paid,
                    "packing": s.packing,
                    "remarks": s.remarks,

                    "weight1": s.weight1,
                    "inDate": s.in_at.date().isoformat() if s.in_at else "",
                    "inTime": s.in_at.strftime("%H:%M") if s.in_at else "",
                }
            )
        return Response(out)

    @action(detail=False, methods=["get"])
    def lookup(self, request):
        serial_no = request.query_params.get("serial_no")
        if not serial_no:
            raise ValidationError({"serial_no": ["serial_no is required"]})

        try:
            serial_no = int(serial_no)
        except Exception:
            raise ValidationError({"serial_no": ["serial_no must be integer"]})

        slip = self.get_queryset().filter(serial_no=serial_no).first()
        if not slip:
            return Response({"detail": "Slip not found"}, status=404)

        return Response(SlipListSerializer(slip).data)

    @action(detail=False, methods=["get"], url_path="next_serial")
    def next_serial(self, request):
        """
        Return the next available serial number for the selected branch/company
        """
        try:
            branch = self._get_selected_branch()
            company = self._get_company_from_user()
            
            next_serial = Slip.next_serial(company.id)
            return Response({"serial_no": next_serial})
        except Exception as e:
            raise ValidationError({"detail": str(e)})

    # -------------------------
    # Create First Weight
    # POST /api/slips/first_weight/
    # -------------------------
    @action(detail=False, methods=["post"], url_path="first_weight")
    def create_first(self, request):
        user = request.user

        branch = self._get_selected_branch()
        company = self._get_company_from_user()

        ser = SlipCreateFirstSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # branch in payload not allowed (header controls branch)
        data.pop("branch", None)

        obj: Slip = Slip.objects.create(
            company_id=company.id,
            branch_id=branch.id,
            serial_no=Slip.next_serial(company.id),
            status=Slip.STATUS_PENDING,
            created_by=user,
            updated_by=user,
            **data,
        )

        # auto-fill driver/phone if missing
        if obj.vehicle_id and not obj.driver_name:
            obj.driver_name = getattr(obj.vehicle, "driver", "") or ""

        if obj.customer_id and not obj.phone:
            obj.phone = getattr(obj.customer, "phone", "") or ""

        obj.save()
        return Response(SlipListSerializer(obj).data, status=201)

    # -------------------------
    # Complete Second Weight
    # POST /api/slips/<id>/second_weight/
    # -------------------------
    @action(detail=True, methods=["post"], url_path="second_weight")
    def complete_second(self, request, pk=None):
        user = request.user
        slip: Slip = self.get_object()
        self._assert_scope(slip)

        if slip.status != Slip.STATUS_PENDING:
            raise ValidationError({"detail": "Only pending slips can be completed."})

        ser = SlipSecondWeightSerializer(instance=slip, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)

        slip.weight2 = ser.validated_data.get("weight2", slip.weight2)
        slip.out_at = ser.validated_data.get("out_at") or timezone.now()
        slip.remarks = ser.validated_data.get("remarks", slip.remarks)
        slip.amount = ser.validated_data.get("amount", slip.amount)

        slip.compute_net()
        slip.status = Slip.STATUS_COMPLETED
        slip.updated_by = user
        slip.save()

        return Response(SlipListSerializer(slip).data)

    # -------------------------
    # Export CSV
    # GET /api/slips/export_csv/
    # -------------------------
    @action(detail=False, methods=["get"], url_path="export_csv")
    def export_csv(self, request):
        qs = self.filter_queryset(self.get_queryset()).order_by("-id")[:5000]

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="slips.csv"'

        w = csv.writer(response)
        w.writerow(["Serial", "Status", "IN", "OUT", "Vehicle", "Driver", "Customer", "Material", "W1", "W2", "Net"])

        for s in qs:
            w.writerow(
                [
                    s.serial_no,
                    s.status,
                    s.in_at.strftime("%Y-%m-%d %H:%M") if s.in_at else "",
                    s.out_at.strftime("%Y-%m-%d %H:%M") if s.out_at else "",
                    s.vehicle.reg if s.vehicle_id else "",
                    s.driver_name,
                    s.party_name or (s.customer.name if s.customer_id else ""),
                    s.material.name if s.material_id else "",
                    s.weight1,
                    s.weight2,
                    s.net_weight,
                ]
            )
        return response

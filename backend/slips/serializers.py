# slips/serializers.py
from rest_framework import serializers
from .models import Slip

from branches.models import Branch
from vehicles.models import Vehicle
from materials.models import Material
from customers.models import Customer


class SlipListSerializer(serializers.ModelSerializer):
    serialNo = serializers.IntegerField(source="serial_no", read_only=True)
    voucherNo = serializers.CharField(source="voucher_no", read_only=True)
    customerType = serializers.CharField(source="customer_type", read_only=True)

    vehicleReg = serializers.SerializerMethodField()
    materialName = serializers.SerializerMethodField()
    customerName = serializers.SerializerMethodField()

    partyName = serializers.CharField(source="party_name", read_only=True)
    supplierName = serializers.CharField(source="supplier_name", read_only=True)
    driver = serializers.CharField(source="driver_name", read_only=True)

    inDate = serializers.SerializerMethodField()
    inTime = serializers.SerializerMethodField()
    outDate = serializers.SerializerMethodField()
    outTime = serializers.SerializerMethodField()

    netWeight = serializers.IntegerField(source="net_weight", read_only=True)
    printType = serializers.CharField(source="print_type", read_only=True)

    class Meta:
        model = Slip
        fields = [
            "id",
            "serialNo",
            "voucherNo",
            "customerType",

            "vehicle",
            "vehicleReg",
            "material",
            "materialName",
            "customer",
            "customerName",

            "partyName",
            "supplierName",
            "driver",
            "phone",
            "amount",
            "paid",
            "packing",
            "remarks",
            "printType",

            "weight1",
            "weight2",
            "netWeight",
            "status",

            "inDate",
            "inTime",
            "outDate",
            "outTime",
        ]

    def get_vehicleReg(self, obj):
        return obj.vehicle.reg if obj.vehicle_id else ""

    def get_materialName(self, obj):
        return obj.material.name if obj.material_id else ""

    def get_customerName(self, obj):
        return obj.customer.name if obj.customer_id else ""

    def get_inDate(self, obj):
        return obj.in_at.date() if obj.in_at else None

    def get_inTime(self, obj):
        return obj.in_at.time().strftime("%H:%M") if obj.in_at else None

    def get_outDate(self, obj):
        return obj.out_at.date() if obj.out_at else None

    def get_outTime(self, obj):
        return obj.out_at.time().strftime("%H:%M") if obj.out_at else None


class SlipCreateFirstSerializer(serializers.ModelSerializer):
    """
    Branch selection policy:
    - Admin: branch optional in payload (but normally header drives it)
    - Manager/Operator: branch not allowed in payload (forced from user.branch)
    """

    # ✅ optional for Admin only (still validated safely)
    branch = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.filter(status=Branch.STATUS_ACTIVE),
        required=False,
        allow_null=True,
        write_only=True,
    )

    # ✅ Make FK fields explicit => clearer validation
    vehicle = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        required=False,
        allow_null=True,
    )
    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        required=True,
        allow_null=False,
    )
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        required=False,
        allow_null=True,
    )

    serialNo = serializers.IntegerField(source="serial_no", read_only=True)
    voucherNo = serializers.CharField(source="voucher_no", required=False, allow_blank=True)
    customerType = serializers.ChoiceField(source="customer_type", choices=Slip.CUSTOMER_TYPE_CHOICES)

    partyName = serializers.CharField(source="party_name", required=False, allow_blank=True)
    supplierName = serializers.CharField(source="supplier_name", required=False, allow_blank=True)
    driver = serializers.CharField(source="driver_name", required=False, allow_blank=True)

    printType = serializers.ChoiceField(
        source="print_type",
        choices=Slip.PRINT_CHOICES,
        required=False,
    )

    in_at = serializers.DateTimeField(required=False)

    class Meta:
        model = Slip
        fields = [
            "id",
            "serialNo",
            "voucherNo",
            "customerType",

            "branch",       # ✅ admin optional
            "vehicle",
            "material",
            "customer",

            "partyName",
            "supplierName",
            "driver",
            "phone",
            "amount",
            "paid",
            "packing",
            "remarks",
            "printType",

            "in_at",
            "weight1",
        ]
        read_only_fields = ["id", "serialNo"]

    def validate_weight1(self, v):
        v = int(v or 0)
        if v <= 0:
            raise serializers.ValidationError("1st weight is required.")
        return v

    def validate(self, attrs):
        """
        ✅ Non-admin ko payload me branch bhejne ki permission nahi.
        """
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            role = getattr(request.user, "role", "Operator")

            if role != "Admin":
                if "branch" in attrs and attrs.get("branch") is not None:
                    raise serializers.ValidationError({"branch": ["You cannot set branch."]})

        return attrs


class SlipSecondWeightSerializer(serializers.ModelSerializer):
    out_at = serializers.DateTimeField(required=False)
    weight2 = serializers.IntegerField()

    netWeight = serializers.IntegerField(source="net_weight", read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Slip
        fields = ["out_at", "weight2", "netWeight", "status", "remarks", "amount"]

    def validate_weight2(self, v):
        v = int(v or 0)
        if v <= 0:
            raise serializers.ValidationError("2nd weight is required.")
        return v

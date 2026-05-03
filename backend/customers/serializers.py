# customers/serializers.py
from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    # ✅ for frontend edit/delete (DRF pk)
    pk = serializers.IntegerField(source="id", read_only=True)

    # ✅ UI compatibility
    id = serializers.CharField(source="code", read_only=True)  # UI shows CUST-001
    type = serializers.CharField(source="customer_type")       # UI uses "type"
    balance = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Customer
        fields = [
            "pk",
            "id",
            "name",
            "contact",
            "phone",
            "email",
            "address",
            "type",
            "balance",
            "status",
            "branch",     # read-only (comes from header)
            "company",    # read-only (derived from branch on backend)
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["company", "branch", "created_at", "updated_at"]

    def validate_name(self, v):
        v = (v or "").strip()
        if not v:
            raise serializers.ValidationError("Customer Name is required.")
        return v

    def validate_phone(self, v):
        v = (v or "").strip()
        if not v:
            raise serializers.ValidationError("Phone is required.")
        return v

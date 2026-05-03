# materials/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    # UI field name -> backend field
    type = serializers.CharField(source="material_type", required=False)

    # ✅ FIX: datetime -> date string safely
    createdDate = serializers.SerializerMethodField()

    # ✅ debug / ui helpers
    branch_id = serializers.IntegerField(read_only=True)
    company_id = serializers.SerializerMethodField()

    # (optional) show branch in response as id (read-only)
    branch = serializers.IntegerField(source="branch_id", read_only=True)

    class Meta:
        model = Material
        fields = [
            "id",
            "name",
            "code",
            "type",
            "description",
            "status",
            "createdDate",
            "branch_id",
            "company_id",
            "branch",
        ]
        read_only_fields = ["id", "createdDate", "branch_id", "company_id", "branch"]

    def get_createdDate(self, obj):
        """
        Return YYYY-MM-DD in Asia/Karachi-safe way (or current tz).
        """
        dt = getattr(obj, "created_at", None)
        if not dt:
            return None
        # ensure aware + convert to current timezone
        dt_local = timezone.localtime(dt) if timezone.is_aware(dt) else dt
        return dt_local.date().isoformat()

    def get_company_id(self, obj):
        """
        Company derived via branch.company_id
        """
        b = getattr(obj, "branch", None)
        return getattr(b, "company_id", None) if b else None

    def validate_name(self, v):
        v = (v or "").strip()
        if not v:
            raise serializers.ValidationError("Material Name is required.")
        return v

    def validate_code(self, v):
        return (v or "").strip().upper()

    def validate(self, attrs):
        mt = attrs.get("material_type")
        if mt:
            allowed = {x[0] for x in Material.TYPE_CHOICES}
            if mt not in allowed:
                raise serializers.ValidationError({"type": "Invalid material type."})
        return attrs

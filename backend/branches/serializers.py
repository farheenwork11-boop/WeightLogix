# branches/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Branch

User = get_user_model()


class BranchSerializer(serializers.ModelSerializer):
    devices_count = serializers.IntegerField(read_only=True)

    # ✅ read-only manager id for edit prefill
    manager = serializers.IntegerField(source="manager_id", read_only=True)

    # ✅ write manager by id (dropdown)
    manager_id = serializers.PrimaryKeyRelatedField(
        source="manager",
        queryset=User.objects.none(),   # will set in __init__
        required=False,
        allow_null=True,
        write_only=True,
    )

    manager_name = serializers.SerializerMethodField(read_only=True)
    company = serializers.CharField(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        request = self.context.get("request")
        if not request or not getattr(request, "user", None):
            return

        u = request.user
        my_company = (getattr(u, "company", "") or "").strip()

        if my_company:
            # ✅ only same-company managers
            self.fields["manager_id"].queryset = User.objects.filter(
                company=my_company,
                role="Manager",
            )

    def get_manager_name(self, obj):
        m = getattr(obj, "manager", None)
        if not m:
            return ""
        # try full name else email
        full = (getattr(m, "get_full_name", lambda: "")() or "").strip()
        return full or getattr(m, "email", "") or ""

    class Meta:
        model = Branch
        fields = [
            "id",
            "name",
            "location",
            "status",
            "company",
            "manager",       # ✅ read-only manager_id
            "manager_id",    # ✅ write
            "manager_name",
            "devices_count",
            "created_at",
        ]

# vehicles/serializers.py
from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            "id",
            "reg",
            "type",
            "driver",
            "capacity",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_reg(self, value: str):
        value = (value or "").strip().upper()
        if not value:
            raise serializers.ValidationError("Registration # is required.")
        return value

    def validate_driver(self, value: str):
        return (value or "").strip()

    def validate_capacity(self, value):
        try:
            v = int(value or 0)
        except Exception:
            raise serializers.ValidationError("Capacity must be a number.")
        if v < 0:
            raise serializers.ValidationError("Capacity must be >= 0.")
        return v

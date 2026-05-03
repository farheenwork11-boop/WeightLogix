from rest_framework import serializers
from .models import Device


class DeviceSerializer(serializers.ModelSerializer):
    # show branch name
    branch = serializers.CharField(source="branch.name", read_only=True)

    # UI mapping
    calibrationDue = serializers.DateField(
        source="calibration_due",
        required=False,
        allow_null=True
    )
    
    lastCalibration = serializers.DateField(
        source="last_calibration_at",
        required=False,
        allow_null=True,
        read_only=True
    )

    lastSync = serializers.SerializerMethodField()
    currentWeight = serializers.DecimalField(
        source="current_weight",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Device
        fields = [
            "id",
            "code",
            "name",
            "device_type",
            "manufacturer",
            "model_number",
            "branch",
            "connection_type",
            "protocol",
            "com_port",
            "baud_rate",
            "data_bits",
            "stop_bits",
            "parity",
            "ip",
            "port",
            "status",
            "currentWeight",
            "weight_unit",
            "printer_model",
            "paper_size",
            "calibrationDue",
            "lastCalibration",
            "lastSync",
            "firmware_version",
            "uptime_hours",
            "error_count",
            "last_error",
            "is_active",
        ]
        read_only_fields = ["id", "code", "branch", "lastSync", "currentWeight", "uptime_hours", "error_count"]
        
    def get_lastSync(self, obj):
        return obj.last_sync_at.isoformat() if obj.last_sync_at else None
    
    def create(self, validated_data):
        # Generate unique device code
        from django.utils import timezone
        import time
        validated_data['code'] = f"DEV-{int(timezone.now().timestamp())}"
        return super().create(validated_data)

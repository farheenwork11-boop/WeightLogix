from django.db import models
from branches.models import Branch  # <-- use existing branches app

class Device(models.Model):
    DEVICE_TYPE_INDICATOR = "Weight Indicator"
    DEVICE_TYPE_PRINTER = "Thermal Printer"
    DEVICE_TYPE_BOTH = "Indicator + Printer"
    
    DEVICE_TYPE_CHOICES = [
        (DEVICE_TYPE_INDICATOR, "Weight Indicator"),
        (DEVICE_TYPE_PRINTER, "Thermal Printer"),
        (DEVICE_TYPE_BOTH, "Indicator + Printer"),
    ]
    
    CONNECTION_TYPE_SERIAL = "Serial (COM Port)"
    CONNECTION_TYPE_TCP = "TCP/IP (Network)"
    CONNECTION_TYPE_USB = "USB"
    CONNECTION_TYPE_BLUETOOTH = "Bluetooth"
    
    CONNECTION_TYPE_CHOICES = [
        (CONNECTION_TYPE_SERIAL, "Serial (COM Port)"),
        (CONNECTION_TYPE_TCP, "TCP/IP (Network)"),
        (CONNECTION_TYPE_USB, "USB"),
        (CONNECTION_TYPE_BLUETOOTH, "Bluetooth"),
    ]
    
    PROTOCOL_MODBUS = "Modbus RTU"
    PROTOCOL_CONTINUOUS = "Continuous Stream"
    PROTOCOL_ESCPOS = "ESC/POS (Printer)"
    PROTOCOL_CUSTOM = "Custom Protocol"
    
    PROTOCOL_CHOICES = [
        (PROTOCOL_MODBUS, "Modbus RTU"),
        (PROTOCOL_CONTINUOUS, "Continuous Stream"),
        (PROTOCOL_ESCPOS, "ESC/POS (Printer)"),
        (PROTOCOL_CUSTOM, "Custom Protocol"),
    ]
    
    STATUS_ONLINE = "Online"
    STATUS_OFFLINE = "Offline"
    STATUS_MAINTENANCE = "Maintenance"
    STATUS_ERROR = "Error"

    STATUS_CHOICES = [
        (STATUS_ONLINE, "Online"),
        (STATUS_OFFLINE, "Offline"),
        (STATUS_MAINTENANCE, "Maintenance"),
        (STATUS_ERROR, "Error"),
    ]

    code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=120)
    device_type = models.CharField(max_length=32, choices=DEVICE_TYPE_CHOICES, default=DEVICE_TYPE_INDICATOR)
    manufacturer = models.CharField(max_length=100, blank=True, default="")
    model_number = models.CharField(max_length=100, blank=True, default="")

    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name="devices")

    # Connection Settings
    connection_type = models.CharField(max_length=32, choices=CONNECTION_TYPE_CHOICES, default=CONNECTION_TYPE_SERIAL)
    protocol = models.CharField(max_length=32, choices=PROTOCOL_CHOICES, default=PROTOCOL_CONTINUOUS)
    
    # Serial Port Settings
    com_port = models.CharField(max_length=20, blank=True, default="", help_text="e.g., COM3, /dev/ttyUSB0")
    baud_rate = models.PositiveIntegerField(default=9600, help_text="Common: 9600, 19200, 38400")
    data_bits = models.PositiveIntegerField(default=8, help_text="7 or 8")
    stop_bits = models.PositiveIntegerField(default=1, help_text="1 or 2")
    parity = models.CharField(max_length=1, default="N", help_text="N=None, E=Even, O=Odd")
    
    # Network Settings
    ip = models.GenericIPAddressField(protocol="both", null=True, blank=True)
    port = models.PositiveIntegerField(default=8080)
    
    # Device Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OFFLINE)
    current_weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Current weight reading in kg")
    weight_unit = models.CharField(max_length=10, default="kg", help_text="kg, lb, g")
    
    # Printer Settings (if applicable)
    printer_model = models.CharField(max_length=100, blank=True, default="")
    paper_size = models.CharField(max_length=20, default="80mm", help_text="80mm or 58mm")
    
    # Maintenance
    last_sync_at = models.DateTimeField(null=True, blank=True)
    calibration_due = models.DateField(null=True, blank=True)
    last_calibration_at = models.DateField(null=True, blank=True)
    firmware_version = models.CharField(max_length=50, blank=True, default="")
    
    # Health Monitoring
    uptime_hours = models.PositiveIntegerField(default=0)
    error_count = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["branch", "status"]),
            models.Index(fields=["device_type", "is_active"]),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code}) - {self.status}"

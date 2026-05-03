from django.db import models
from django.core.validators import MinValueValidator


class Vehicle(models.Model):
    STATUS_ACTIVE = "Active"
    STATUS_MAINTENANCE = "Maintenance"
    STATUS_INACTIVE = "Inactive"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_MAINTENANCE, "Maintenance"),
        (STATUS_INACTIVE, "Inactive"),
    ]

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="vehicles",
    )
    branch = models.ForeignKey(
        "branches.Branch",
        on_delete=models.CASCADE,
        related_name="vehicles",
    )

    reg = models.CharField(max_length=32)
    type = models.CharField(max_length=64, default="Truck 10-Wheeler")
    driver = models.CharField(max_length=128, blank=True, default="")
    capacity = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(fields=["company", "reg"], name="uniq_vehicle_reg_per_company"),
        ]
        indexes = [
            models.Index(fields=["company", "branch", "reg"]),
            models.Index(fields=["company", "branch", "driver"]),
        ]

    def __str__(self):
        return self.reg

# branches/models.py
from django.conf import settings
from django.db import models


class Branch(models.Model):
    STATUS_ACTIVE = "Active"
    STATUS_MAINTENANCE = "Maintenance"
    STATUS_CLOSED = "Closed"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_MAINTENANCE, "Maintenance"),
        (STATUS_CLOSED, "Closed"),
    ]

    name = models.CharField(max_length=150)
    location = models.CharField(max_length=255, blank=True, default="")

    # ✅ optional manager (select later or at creation if exists)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="managed_branches",
    )

    # ✅ company name auto (from signed-in user)
    company = models.CharField(max_length=150, blank=True, default="")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_MANAGER = "Manager"
    ROLE_OPERATOR = "Operator"

    ROLE_CHOICES = [
        (ROLE_MANAGER, "Manager"),
        (ROLE_OPERATOR, "Operator"),
    ]

    # ✅ Signup user = Manager (first time user is manager)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_MANAGER
    )

    # Branch FK
    branch = models.ForeignKey(
        "branches.Branch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    # ✅ NOW REQUIRED FIELDS
    phone = models.CharField(
        max_length=50,
        blank=False,
        null=False,
    )

    company = models.CharField(
        max_length=150,
        blank=False,
        null=False,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

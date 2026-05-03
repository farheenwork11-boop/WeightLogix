# customers/models.py
from django.db import models
from django.db.models import Max
from django.core.validators import RegexValidator


class Customer(models.Model):
    STATUS_ACTIVE = "Active"
    STATUS_OVERDUE = "Overdue"
    STATUS_INACTIVE = "Inactive"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_OVERDUE, "Overdue"),
        (STATUS_INACTIVE, "Inactive"),
    ]

    TYPE_COMMERCIAL = "Commercial"
    TYPE_LOGISTICS = "Logistics"
    TYPE_CONSTRUCTION = "Construction"
    TYPE_AGRICULTURE = "Agriculture"
    TYPE_INDIVIDUAL = "Individual"

    TYPE_CHOICES = [
        (TYPE_COMMERCIAL, "Commercial"),
        (TYPE_LOGISTICS, "Logistics"),
        (TYPE_CONSTRUCTION, "Construction"),
        (TYPE_AGRICULTURE, "Agriculture"),
        (TYPE_INDIVIDUAL, "Individual"),
    ]

    # ✅ Backend will set company via selected branch
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="customers",
    )
    branch = models.ForeignKey(
        "branches.Branch",
        on_delete=models.CASCADE,
        related_name="customers",
    )

    # UI id like CUST-001
    code = models.CharField(max_length=16, editable=False)

    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=200, blank=True, default="")

    phone = models.CharField(
        max_length=32,
        validators=[RegexValidator(r"^[0-9+() \-]{7,32}$", "Enter a valid phone number.")],
    )
    email = models.EmailField(blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")

    customer_type = models.CharField(max_length=32, choices=TYPE_CHOICES, default=TYPE_COMMERCIAL)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(fields=["company", "code"], name="uniq_customer_code_per_company"),
            models.UniqueConstraint(fields=["company", "phone"], name="uniq_customer_phone_per_company"),
        ]
        indexes = [
            models.Index(fields=["company", "branch", "name"]),
            models.Index(fields=["company", "branch", "phone"]),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def _next_code(self):
        """
        ✅ Branch-wise sequence:
        CUST-001, CUST-002 ... per branch
        """
        if not self.branch_id:
            # fallback (should never happen because branch is required)
            last = Customer.objects.aggregate(m=Max("id"))["m"] or 0
            return f"CUST-{last + 1:03d}"

        last = (
            Customer.objects.filter(branch_id=self.branch_id)
            .aggregate(m=Max("id"))["m"]
            or 0
        )
        return f"CUST-{last + 1:03d}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self._next_code()
        super().save(*args, **kwargs)

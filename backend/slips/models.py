from django.db import models
from django.db.models import Max
from django.utils import timezone


class Slip(models.Model):
    STATUS_PENDING = "Pending"
    STATUS_COMPLETED = "Completed"
    STATUS_ERROR = "Error"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_ERROR, "Error"),
    ]

    CUSTOMER_TYPE_COMMERCIAL = "Commercial"
    CUSTOMER_TYPE_COMPANY = "Company"
    CUSTOMER_TYPE_CHOICES = [
        (CUSTOMER_TYPE_COMMERCIAL, "Commercial"),
        (CUSTOMER_TYPE_COMPANY, "Company"),
    ]

    PAID_YES = "Yes"
    PAID_NO = "No"
    PAID_CHOICES = [(PAID_YES, "Yes"), (PAID_NO, "No")]

    PRINT_DOS = "DOS Print"
    PRINT_WIN = "Win Print"
    PRINT_CHOICES = [(PRINT_DOS, "DOS Print"), (PRINT_WIN, "Win Print")]

    company = models.ForeignKey("companies.Company", on_delete=models.CASCADE, related_name="slips")
    branch = models.ForeignKey("branches.Branch", on_delete=models.CASCADE, related_name="slips")

    serial_no = models.PositiveIntegerField()
    voucher_no = models.CharField(max_length=64, blank=True, default="")
    customer_type = models.CharField(max_length=16, choices=CUSTOMER_TYPE_CHOICES, default=CUSTOMER_TYPE_COMMERCIAL)

    # FK references
    vehicle = models.ForeignKey("vehicles.Vehicle", on_delete=models.SET_NULL, null=True, blank=True, related_name="slips")
    material = models.ForeignKey("materials.Material", on_delete=models.SET_NULL, null=True, blank=True, related_name="slips")
    customer = models.ForeignKey("customers.Customer", on_delete=models.SET_NULL, null=True, blank=True, related_name="slips")

    # text fields (fallback + UI fields)
    party_name = models.CharField(max_length=160, blank=True, default="")
    supplier_name = models.CharField(max_length=160, blank=True, default="")
    driver_name = models.CharField(max_length=120, blank=True, default="")
    phone = models.CharField(max_length=32, blank=True, default="")

    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid = models.CharField(max_length=8, choices=PAID_CHOICES, default=PAID_NO)
    packing = models.CharField(max_length=120, blank=True, default="")
    remarks = models.CharField(max_length=255, blank=True, default="")
    print_type = models.CharField(max_length=16, choices=PRINT_CHOICES, default=PRINT_WIN)

    # timestamps + weights
    in_at = models.DateTimeField(default=timezone.now)
    out_at = models.DateTimeField(null=True, blank=True)

    weight1 = models.PositiveIntegerField(default=0)
    weight2 = models.PositiveIntegerField(default=0)
    net_weight = models.PositiveIntegerField(default=0)

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)

    created_by = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="created_slips")
    updated_by = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_slips")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(fields=["company", "serial_no"], name="uniq_serial_per_company_slips")
        ]
        indexes = [
            models.Index(fields=["company", "branch", "status"]),
            models.Index(fields=["company", "serial_no"]),
        ]

    def __str__(self):
        return f"Slip#{self.serial_no} ({self.status})"

    @staticmethod
    def next_serial(company_id: int) -> int:
        last = Slip.objects.filter(company_id=company_id).aggregate(m=Max("serial_no"))["m"] or 1000
        return last + 1

    def compute_net(self):
        self.net_weight = abs(int(self.weight2 or 0) - int(self.weight1 or 0))

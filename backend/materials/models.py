from django.db import models
from django.db.models import Max


class Material(models.Model):
    STATUS_ACTIVE = "Active"
    STATUS_INACTIVE = "Inactive"
    STATUS_CHOICES = [(STATUS_ACTIVE, "Active"), (STATUS_INACTIVE, "Inactive")]

    TYPE_BULK = "Bulk"
    TYPE_SOLID = "Solid"
    TYPE_LIQUID = "Liquid"
    TYPE_CHOICES = [(TYPE_BULK, "Bulk"), (TYPE_SOLID, "Solid"), (TYPE_LIQUID, "Liquid")]

    # ✅ ONLY branch (company derived via branch.company)
    branch = models.ForeignKey(
        "branches.Branch",
        on_delete=models.CASCADE,
        related_name="materials",
    )

    name = models.CharField(max_length=120)
    code = models.CharField(max_length=32, blank=True, default="")
    material_type = models.CharField(max_length=16, choices=TYPE_CHOICES, default=TYPE_BULK)
    description = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        # ✅ branch-wise uniqueness (since company removed)
        constraints = [
            models.UniqueConstraint(fields=["branch", "name"], name="uniq_material_name_per_branch"),
            models.UniqueConstraint(fields=["branch", "code"], name="uniq_material_code_per_branch"),
        ]
        indexes = [
            models.Index(fields=["branch", "name"]),
            models.Index(fields=["branch", "code"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def _next_code(self):
        # ✅ MAT-001 branch-wise
        last_id = Material.objects.filter(branch_id=self.branch_id).aggregate(m=Max("id"))["m"] or 0
        return f"MAT-{last_id + 1:03d}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self._next_code()
        super().save(*args, **kwargs)

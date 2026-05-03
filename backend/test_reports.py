import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scale_dev.settings")
django.setup()

from accounts.models import User
from reports.views import get_scoped_slips_qs
from slips.models import Slip
from api.utils import current_branch_id

class MockReq: pass
req = MockReq()
req.user = User.objects.get(email='manager@example.com')
req.headers = {}
req.META = {}
req.GET = {}

# Test parts of get_scoped_slips_qs:
print("Superuser:", getattr(req.user, "is_superuser", False))
company_name = (getattr(req.user, "company", "") or "").strip()
print("Company Name:", company_name)
from companies.models import Company
company = Company.objects.filter(name=company_name).first()
print("Company ID:", company.id if company else None)

role = (getattr(req.user, "role", "") or "").strip()
print("Role:", role)

qs = Slip.objects.filter(company_id=company.id)
print("Slips for Company:", qs.count())

bid = current_branch_id(req, user=req.user)
print("Branch ID from current_branch_id:", bid)

if bid:
    qs = qs.filter(branch_id=bid)
print("Slips after branch filter:", qs.count())

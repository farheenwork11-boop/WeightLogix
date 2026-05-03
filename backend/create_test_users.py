#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scale_dev.settings')
django.setup()

from accounts.models import User
from branches.models import Branch
from companies.models import Company

# Clean up test users
User.objects.filter(email__in=['test@example.com', 'manager@example.com']).delete()

# Create a company
company = Company.objects.first() or Company.objects.create(
    name="Test Company",
    contact_number="+923001234567",
    address="Test Address"
)

# Create a branch
branch = Branch.objects.first() or Branch.objects.create(
    company=company,
    name="Main Branch",
    manager="Manager"
)

# Create test users
test_user = User.objects.create_user(
    username='test@example.com',
    email='test@example.com',
    password='test123456',
    first_name='Test',
    last_name='User',
    phone='03001234567',
    company='Test Company',
    role='Operator',
    branch=branch
)

manager_user = User.objects.create_user(
    username='manager@example.com',
    email='manager@example.com',
    password='manager123456',
    first_name='Manager',
    last_name='User',
    phone='03009876543',
    company='Test Company',
    role='Manager',
    branch=branch
)

print("✅ Test users created:")
print(f"  1. Email: test@example.com | Password: test123456 | Role: Operator")
print(f"  2. Email: manager@example.com | Password: manager123456 | Role: Manager")

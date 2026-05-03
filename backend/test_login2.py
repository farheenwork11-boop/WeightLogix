#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scale_dev.settings')
django.setup()

from django.contrib.auth import authenticate
from rest_framework.test import APIRequestFactory
from accounts.views import EmailTokenObtainPairView
from accounts.models import User

# Create test user
test_email = 'testuser@example.com'
test_pass = 'testpass123'

# Delete if exists
User.objects.filter(email=test_email).delete()

# Create user
user = User.objects.create_user(
    username=test_email,
    email=test_email,
    password=test_pass,
    phone='1234567890',
    company='Test Company'
)
print(f"Created user: {user.email}")

# Test authenticate
authed = authenticate(username=user.username, password=test_pass)
print(f"Authenticate result: {authed}")

# Test login endpoint
factory = APIRequestFactory()
request = factory.post('/accounts/login/', {'email': test_email, 'password': test_pass}, format='json')
view = EmailTokenObtainPairView.as_view()
response = view(request)

print(f"Login status: {response.status_code}")
if response.status_code == 200:
    print("✅ Login successful!")
    print(f"Access token: {response.data.get('access', '')[:50]}...")
else:
    print(f"❌ Login failed: {response.data}")

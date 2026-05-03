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

# Test with new test user
email = 'test@example.com'
password = 'test123456'

# Test 1: Check user exists
try:
    user = User.objects.get(email=email)
    print(f"✅ User exists: {user.email}, username: {user.username}")
except:
    print(f"❌ User does not exist: {email}")
    exit(1)

# Test 2: Try authenticate directly
authed = authenticate(username=user.username, password=password)
if authed:
    print(f"✅ Direct authenticate successful: {authed}")
else:
    print(f"❌ Direct authenticate failed")

# Test 3: Try login endpoint
factory = APIRequestFactory()
request = factory.post('/accounts/login/', {'email': email, 'password': password}, format='json')
view = EmailTokenObtainPairView.as_view()
response = view(request)

print(f"\nLogin status: {response.status_code}")
if response.status_code == 200:
    print("✅ Login via API successful!")
    print(f"Access token: {response.data.get('access', '')[:50]}...")
else:
    print(f"❌ Login failed:")
    print(json.dumps(dict(response.data), indent=2, default=str))

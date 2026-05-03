# accounts/serializers.py
from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

ROLE_CHOICES = [("Manager", "Manager"), ("Operator", "Operator")]
STATUS_CHOICES = [("Active", "Active"), ("Inactive", "Inactive")]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Login with email + password, returns access/refresh
    """
    email = serializers.EmailField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # remove username field (default)
        self.fields.pop(self.username_field, None)
        self.fields["email"] = serializers.EmailField()

    def validate(self, attrs):
        email = (attrs.get("email") or "").lower().strip()
        password = attrs.get("password") or ""

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        authed = authenticate(username=user.get_username(), password=password)
        if not authed:
            raise serializers.ValidationError({"detail": "Invalid email or password."})

        data = super().validate({"username": user.get_username(), "password": password})
        return data


class RegisterSerializer(serializers.Serializer):
    """
    Signup -> company owner -> Admin
    IMPORTANT: phone & company REQUIRED (because model requires)
    """
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()

    phone = serializers.CharField(max_length=50, required=True, allow_blank=False)
    company = serializers.CharField(max_length=150, required=True, allow_blank=False)

    password = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        v = value.lower().strip()
        if User.objects.filter(email=v).exists():
            raise serializers.ValidationError("Email already exists.")
        return v

    def create(self, validated_data):
        full_name = (validated_data.get("full_name") or "").strip()
        email = validated_data["email"].lower().strip()
        password = validated_data["password"]

        parts = full_name.split() if full_name else []
        first_name = parts[0] if parts else ""
        last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        # ✅ required
        user.phone = (validated_data.get("phone") or "").strip()
        user.company = (validated_data.get("company") or "").strip()

        # ✅ Signup user = Manager (first user becomes manager)
        user.role = "Manager"

        user.save()
        return user

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)
        return {
            "user": {
                "id": instance.id,
                "username": instance.username,
                "email": instance.email,
                "first_name": instance.first_name,
                "last_name": instance.last_name,
                "role": getattr(instance, "role", "Operator"),
                "branch_id": getattr(instance, "branch_id", None),
                "phone": getattr(instance, "phone", ""),
                "company": getattr(instance, "company", ""),
                "is_active": instance.is_active,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class UserListSerializer(serializers.ModelSerializer):
    """
    Used by UsersRoles list
    UI expects: {id, name, email, role, status}
    """
    name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    branch_id = serializers.IntegerField(allow_null=True, required=False)

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "status", "is_active", "branch_id", "phone", "company"]

    def get_name(self, obj):
        full = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return full or obj.username

    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"


class UserCreateSerializer(serializers.Serializer):
    """
    Admin/Manager can create users.
    Manager: only Operator (enforced in views)
    NOTE: phone & company REQUIRED (model requires)
    """
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=ROLE_CHOICES)
    status = serializers.ChoiceField(choices=STATUS_CHOICES)

    phone = serializers.CharField(max_length=50, required=True, allow_blank=False)
    company = serializers.CharField(max_length=150, required=True, allow_blank=False)

    password = serializers.CharField(min_length=6, write_only=True, required=False, allow_blank=True)
    branch_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_email(self, value):
        v = value.lower().strip()
        if User.objects.filter(email=v).exists():
            raise serializers.ValidationError("Email already exists.")
        return v

    def create(self, validated_data):
        name = (validated_data.get("name") or "").strip()
        parts = name.split()
        first_name = parts[0] if parts else ""
        last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        email = validated_data["email"].lower().strip()
        password = (validated_data.get("password") or "").strip() or "123456"
        role = validated_data["role"]
        is_active = validated_data["status"] == "Active"

        # Validate that role is allowed
        allowed_roles = [choice[0] for choice in ROLE_CHOICES]
        if role not in allowed_roles:
            raise serializers.ValidationError({"role": f"Role '{role}' is not allowed."})

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_active=is_active,
        )

        user.role = role
        user.phone = (validated_data.get("phone") or "").strip()
        user.company = (validated_data.get("company") or "").strip()

        # Save the user to persist role, phone, and company changes
        user.save()

        # branch set in views (admin assigns OR manager forced)
        return user


class UserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=ROLE_CHOICES)
    status = serializers.ChoiceField(choices=STATUS_CHOICES)

    phone = serializers.CharField(max_length=50, required=True, allow_blank=False)
    company = serializers.CharField(max_length=150, required=True, allow_blank=False)

    password = serializers.CharField(min_length=6, write_only=True, required=False, allow_blank=True)
    branch_id = serializers.IntegerField(required=False, allow_null=True)

    def update(self, instance, validated_data):
        name = (validated_data.get("name") or "").strip()
        parts = name.split()
        instance.first_name = parts[0] if parts else ""
        instance.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        instance.email = validated_data["email"].lower().strip()
        instance.username = instance.email

        role = validated_data["role"]
        # Validate that role is allowed
        allowed_roles = [choice[0] for choice in ROLE_CHOICES]
        if role not in allowed_roles:
            raise serializers.ValidationError({"role": f"Role '{role}' is not allowed."})
        
        instance.role = role
        instance.is_active = validated_data["status"] == "Active"

        instance.phone = (validated_data.get("phone") or "").strip()
        instance.company = (validated_data.get("company") or "").strip()

        pw = (validated_data.get("password") or "").strip()
        if pw:
            instance.set_password(pw)

        instance.save()
        return instance

# users/serializers.py
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()


def _role_choices():
    # Safely retrieve choices if the custom User model defines the field
    try:
        return User._meta.get_field("role").choices or []
    except Exception:
        return []


class UserSerializer(serializers.ModelSerializer):
    """
    Public/user-facing serializer.
    - Exposes basic profile fields
    - Includes role_display if role choices exist
    - Email uniqueness enforced when updating (ignores instance)
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message=_("This email is already in use."))],
    )
    role_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "is_active",
            # add more read-only admin-ish fields if you want to expose them:
            # "date_joined", "last_login"
        ]
        read_only_fields = ["id", "is_active", "role_display"]

        extra_kwargs = {
            "username": {
                "validators": [UniqueValidator(queryset=User.objects.all(), message=_("This username is already in use."))]
            }
        }

    def get_role_display(self, obj):
        # If model defines choices for role, return the human-readable label
        try:
            return obj.get_role_display()
        except Exception:
            return getattr(obj, "role", None)

    def validate_email(self, value: str) -> str:
        return (value or "").strip().lower()

    def update(self, instance, validated_data):
        # Normalize email to lowercase
        if "email" in validated_data and validated_data["email"]:
            validated_data["email"] = validated_data["email"].strip().lower()
        # Optionally guard role updates here (view already enforces; this is extra safety)
        request = self.context.get("request")
        if request and not request.user.is_staff and "role" in validated_data:
            validated_data.pop("role", None)
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registration serializer.
    Accepts: username, email, password, password_confirm, first_name?, last_name?, role?
    Creates user via create_user (hashes password).
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message=_("This email is already in use."))],
    )
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message=_("This username is already in use."))],
    )
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"})
    role = serializers.ChoiceField(choices=_role_choices(), required=False)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "role",
        ]

    def validate_email(self, value: str) -> str:
        return (value or "").strip().lower()

    def validate(self, attrs):
        pw = attrs.get("password")
        pw2 = attrs.pop("password_confirm", None)
        if pw != pw2:
            raise serializers.ValidationError({"password_confirm": _("Passwords do not match.")})
        # Run Django's password validators
        validate_password(pw)
        return attrs

    def create(self, validated_data):
        # Default role (if the model supports it) when not provided
        role_choices = [c[0] for c in _role_choices()]
        role = validated_data.pop("role", None)
        if "email" in validated_data and validated_data["email"]:
            validated_data["email"] = validated_data["email"].strip().lower()

        create_kwargs = {
            "username": validated_data.get("username"),
            "email": validated_data.get("email"),
            "password": validated_data.get("password"),
            "first_name": validated_data.get("first_name", ""),
            "last_name": validated_data.get("last_name", ""),
        }

        user = User.objects.create_user(**create_kwargs)

        # Assign role if supported and provided/valid
        if role is not None and hasattr(user, "role"):
            if role_choices and role not in role_choices:
                # In case someone passed an invalid role even with choices present
                raise serializers.ValidationError({"role": _("Invalid role.")})
            setattr(user, "role", role)
            user.save(update_fields=["role"])

        return user


class LoginSerializer(serializers.Serializer):
    """
    Login serializer for /api/users/login/.
    Accepts either email or username plus password.
    """
    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_email(self, value: str) -> str:
        return (value or "").strip().lower()

    def validate(self, attrs):
        # Ensure at least one identifier is present
        email = (attrs.get("email") or "").strip().lower()
        username = (attrs.get("username") or "").strip()
        if not email and not username:
            raise serializers.ValidationError(
                {"username": _("Provide either username or email."), "email": _("Provide either email or username.")}
            )
        if not attrs.get("password"):
            raise serializers.ValidationError({"password": _("Password is required.")})
        return attrs
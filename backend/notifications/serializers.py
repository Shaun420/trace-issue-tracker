# notifications/serializers.py
from rest_framework import serializers

from .models import Notification
from issues.models import Issue

# Optional: use your real UserSerializer if available
try:
    from users.serializers import UserSerializer
except Exception:
    class UserSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        username = serializers.CharField(read_only=True)
        email = serializers.EmailField(read_only=True)
        first_name = serializers.CharField(read_only=True)
        last_name = serializers.CharField(read_only=True)


class IssueMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ["id", "title", "status", "priority"]


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification.
    - Read-only: status, error, sent_at, created_at, updated_at, created_by, is_sent, preview
    - Nested read-only details: created_by_details, issue_details
    """
    created_by_details = UserSerializer(source="created_by", read_only=True)
    issue_details = IssueMiniSerializer(source="issue", read_only=True)

    is_sent = serializers.SerializerMethodField(read_only=True)
    preview = serializers.ReadOnlyField(source="preview")

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient_email",
            "subject",
            "message",
            "channel",
            "status",
            "issue",
            "issue_details",
            "created_by",
            "created_by_details",
            "metadata",
            "error",
            "created_at",
            "updated_at",
            "sent_at",
            "is_sent",
            "preview",
        ]
        read_only_fields = [
            "id",
            "status",
            "error",
            "created_at",
            "updated_at",
            "sent_at",
            "created_by",
            "created_by_details",
            "issue_details",
            "is_sent",
            "preview",
        ]

    # ---------- Computed fields ----------

    def get_is_sent(self, obj) -> bool:
        return obj.status == Notification.STATUS_SENT

    # ---------- Validators / Normalizers ----------

    def validate_recipient_email(self, value: str) -> str:
        value = (value or "").strip().lower()
        if not value:
            raise serializers.ValidationError("Recipient email is required.")
        return value

    def validate_subject(self, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Subject is required.")
        return value

    def validate_message(self, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Message is required.")
        return value

    def validate_channel(self, value: str) -> str:
        return (value or "").strip().lower()

    # ---------- Create / Update hooks ----------

    def create(self, validated_data):
        # Attach creator if available
        request = self.context.get("request")
        if request and getattr(request, "user", None) and request.user.is_authenticated:
            validated_data.setdefault("created_by", request.user)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent clients from setting system-managed fields even if not read-only (extra safety)
        for field in ["status", "error", "sent_at", "created_at", "updated_at", "created_by"]:
            validated_data.pop(field, None)
        return super().update(instance, validated_data)
# feedback/serializers.py
from rest_framework import serializers
from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    # Reverse M2M via Issue.linked_feedback(related_name='issues')
    issue_ids = serializers.SerializerMethodField(read_only=True)
    issue_count = serializers.IntegerField(source="issues.count", read_only=True)
    created_by_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id",
            "source",
            "content",
            "user_email",
            "sentiment",
            "created_at",
            "created_by",
            "created_by_email",
            "issue_ids",
            "issue_count",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "created_by",
            "created_by_email",
            "issue_ids",
            "issue_count",
        ]

    def get_issue_ids(self, obj):
        # Return list of related issue ids; safe if relation isn't prefetched
        try:
            return list(obj.issues.values_list("id", flat=True))
        except Exception:
            return []

    def get_created_by_email(self, obj):
        user = getattr(obj, "created_by", None)
        return getattr(user, "email", None) if user else None

    # Field validators/normalizers
    def validate_user_email(self, value: str) -> str:
        value = (value or "").strip().lower()
        if not value:
            raise serializers.ValidationError("User email is required.")
        return value

    def validate_content(self, value: str) -> str:
        value = (value or "").strip()
        if len(value) < 5:
            raise serializers.ValidationError("Content is too short.")
        return value

    def validate_source(self, value: str) -> str:
        # Normalize to lowercase; model choices will enforce valid values
        return (value or "").strip().lower()

    def create(self, validated_data):
        # Attach creator if available
        request = self.context.get("request")
        if request and getattr(request, "user", None) and request.user.is_authenticated:
            validated_data.setdefault("created_by", request.user)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Keep default behavior; validators already applied above
        return super().update(instance, validated_data)
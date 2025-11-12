from rest_framework import serializers

from .models import Issue
from feedback.models import Feedback
from feedback.serializers import FeedbackSerializer

# If you have a users.serializers.UserSerializer as earlier:
try:
    from users.serializers import UserSerializer
except Exception:
    # Fallback minimal user serializer (if import not available)
    class UserSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        username = serializers.CharField(read_only=True)
        email = serializers.EmailField(read_only=True)
        first_name = serializers.CharField(read_only=True)
        last_name = serializers.CharField(read_only=True)
        # role optional


class IssueSerializer(serializers.ModelSerializer):
    """
    Basic Issue serializer for list/create/update.
    - assigned_to_details, created_by_details: read-only nested user info
    - feedback_count: from annotation if present, else computed
    - linked_feedback_ids: write-only list to set M2M
    """
    assigned_to_details = UserSerializer(source="assigned_to", read_only=True)
    created_by_details = UserSerializer(source="created_by", read_only=True)

    # Fallback compute if not annotated in queryset
    feedback_count = serializers.SerializerMethodField(read_only=True)

    # Allow writing feedback relations with ids
    linked_feedback_ids = serializers.PrimaryKeyRelatedField(
        queryset=Feedback.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Issue
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "assigned_to",
            "assigned_to_details",
            "created_by",
            "created_by_details",
            "created_at",
            "updated_at",
            "feedback_count",
            "linked_feedback_ids",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_details",
            "assigned_to_details",
            "feedback_count",
        ]

    def get_feedback_count(self, obj) -> int:
        # Use annotated value if present; otherwise count M2M
        val = getattr(obj, "feedback_count", None)
        if isinstance(val, int):
            return val
        try:
            return obj.linked_feedback.count()
        except Exception:
            return 0

    def validate_priority(self, value):
        # Keep simple guard if you use 1..3
        try:
            v = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Priority must be an integer.")
        if v < 1 or v > 3:
            raise serializers.ValidationError("Priority must be between 1 and 3.")
        return v

    def validate_status(self, value):
        # Let model choices validate if defined; normalize to lowercase for consistency
        return (value or "").lower()

    def create(self, validated_data):
        feedback_ids = validated_data.pop("linked_feedback_ids", [])
        issue = super().create(validated_data)
        if feedback_ids:
            issue.linked_feedback.set(feedback_ids)
        return issue

    def update(self, instance, validated_data):
        feedback_ids = validated_data.pop("linked_feedback_ids", None)
        issue = super().update(instance, validated_data)
        # Only update relation if the key is provided
        if feedback_ids is not None:
            issue.linked_feedback.set(feedback_ids)
        return issue


class IssueDetailSerializer(IssueSerializer):
    """
    Detail serializer extends IssueSerializer with nested feedback.
    """
    linked_feedback = FeedbackSerializer(source="linked_feedback", many=True, read_only=True)

    class Meta(IssueSerializer.Meta):
        fields = IssueSerializer.Meta.fields + ["linked_feedback"]
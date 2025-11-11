from rest_framework import serializers
from .models import Issue
from feedback.serializers import FeedbackSerializer
from users.serializers import UserSerializer

class IssueSerializer(serializers.ModelSerializer):
    feedback_count = serializers.SerializerMethodField()
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)

    class Meta:
        model = Issue
        fields = '__all__'

    def get_feedback_count(self, obj):
        return obj.linked_feedback.count()

class IssueDetailSerializer(IssueSerializer):
    linked_feedback = FeedbackSerializer(many=True, read_only=True)
    
    class Meta:
        model = Issue
        fields = '__all__'
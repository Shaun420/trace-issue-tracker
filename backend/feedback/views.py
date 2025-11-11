from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Feedback
from .serializers import FeedbackSerializer
from issues.models import Issue

class FeedbackViewSet(ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        source = self.request.query_params.get('source')
        unlinked = self.request.query_params.get('unlinked')
        
        if source:
            queryset = queryset.filter(source=source)
        if unlinked == 'true':
            queryset = queryset.filter(issues__isnull=True)
        
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def link_to_issue(self, request, pk=None):
        feedback = self.get_object()
        issue_id = request.data.get('issue_id')
        
        try:
            issue = Issue.objects.get(id=issue_id)
            issue.linked_feedback.add(feedback)
            return Response({'status': 'linked'})
        except Issue.DoesNotExist:
            return Response(
                {'error': 'Issue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
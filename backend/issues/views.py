from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Issue
from .serializers import IssueSerializer, IssueDetailSerializer
from notifications.tasks import send_resolution_notifications

class IssueViewSet(ModelViewSet):
    queryset = Issue.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return IssueDetailSerializer
        return IssueSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-priority', '-created_at')

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        issue = self.get_object()
        issue.status = 'resolved'
        issue.save()
        
        # Trigger notifications
        send_resolution_notifications(issue.id)
        
        return Response({'status': 'resolved'})

    @action(detail=True, methods=['post'])
    def link_feedback(self, request, pk=None):
        issue = self.get_object()
        feedback_ids = request.data.get('feedback_ids', [])
        
        issue.linked_feedback.add(*feedback_ids)
        
        return Response({
            'status': 'linked',
            'total_feedback': issue.linked_feedback.count()
        })
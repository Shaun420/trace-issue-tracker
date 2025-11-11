from django.core.mail import send_mail
from django.conf import settings
from .models import Notification
from issues.models import Issue

def send_resolution_notifications(issue_id):
    try:
        issue = Issue.objects.get(id=issue_id)
        affected_users = issue.linked_feedback.values_list('user_email', flat=True).distinct()
        
        for email in affected_users:
            # Create notification record
            notification = Notification.objects.create(
                issue=issue,
                recipient_email=email,
                message=f"Good news! The issue '{issue.title}' has been resolved.",
            )
            
            # Send email
            send_mail(
                subject=f'Issue Resolved: {issue.title}',
                message=notification.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
            
    except Issue.DoesNotExist:
        pass
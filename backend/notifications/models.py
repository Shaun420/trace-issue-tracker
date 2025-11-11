from django.db import models
from issues.models import Issue

class Notification(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE)
    recipient_email = models.EmailField()
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='sent')

    def __str__(self):
        return f"Notification to {self.recipient_email}"
from django.db import models
from users.models import User

class Feedback(models.Model):
    SOURCE_CHOICES = (
        ('email', 'Email'),
        ('slack', 'Slack'),
        ('form', 'Web Form'),
        ('github', 'GitHub'),
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    content = models.TextField()
    user_email = models.EmailField()
    sentiment = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.source} - {self.user_email}"
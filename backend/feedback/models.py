# feedback/models.py
from django.conf import settings
from django.db import models


class Feedback(models.Model):
    # Sources
    SOURCE_EMAIL = "email"
    SOURCE_SLACK = "slack"
    SOURCE_FORM = "form"
    SOURCE_GITHUB = "github"
    SOURCE_CHOICES = (
        (SOURCE_EMAIL, "Email"),
        (SOURCE_SLACK, "Slack"),
        (SOURCE_FORM, "Web Form"),
        (SOURCE_GITHUB, "GitHub"),
    )

    # Optional sentiment
    SENTIMENT_POSITIVE = "positive"
    SENTIMENT_NEUTRAL = "neutral"
    SENTIMENT_NEGATIVE = "negative"
    SENTIMENT_CHOICES = (
        (SENTIMENT_POSITIVE, "Positive"),
        (SENTIMENT_NEUTRAL, "Neutral"),
        (SENTIMENT_NEGATIVE, "Negative"),
    )

    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    content = models.TextField()
    user_email = models.EmailField()

    # Optional fields
    sentiment = models.CharField(
        max_length=20, choices=SENTIMENT_CHOICES, blank=True, null=True
    )
    metadata = models.JSONField(blank=True, null=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedback_created",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "feedback"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["source"]),
            models.Index(fields=["user_email"]),
        ]

    def save(self, *args, **kwargs):
        # Normalize fields
        if self.user_email:
            self.user_email = self.user_email.strip().lower()
        if self.source:
            self.source = self.source.strip().lower()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user_email} | {self.source} | {self.created_at:%Y-%m-%d %H:%M}"
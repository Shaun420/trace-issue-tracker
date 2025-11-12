# notifications/models.py
from django.conf import settings
from django.db import models
from django.db.models import Q


class Notification(models.Model):
    # Channels
    CHANNEL_EMAIL = "email"
    CHANNEL_SLACK = "slack"
    CHANNEL_CHOICES = (
        (CHANNEL_EMAIL, "Email"),
        (CHANNEL_SLACK, "Slack"),
    )

    # Statuses
    STATUS_PENDING = "pending"
    STATUS_SENT = "sent"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_SENT, "Sent"),
        (STATUS_FAILED, "Failed"),
    )

    # Who we're notifying (email is used for both email and slack-derived emails in this MVP)
    recipient_email = models.EmailField()

    subject = models.CharField(max_length=255)
    message = models.TextField()

    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default=CHANNEL_EMAIL, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)

    # Optional linkage back to an Issue
    issue = models.ForeignKey(
        "issues.Issue",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )

    # Who initiated the notification
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications_created",
    )

    # Optional metadata (e.g., provider response, headers, webhook id, etc.)
    metadata = models.JSONField(null=True, blank=True)

    # Error details if failed
    error = models.TextField(blank=True, default="")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-sent_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "channel"]),
            models.Index(fields=["recipient_email"]),
            models.Index(fields=["-sent_at"]),
            models.Index(fields=["-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(status__in=["pending", "sent", "failed"]),
                name="notifications_status_valid",
            ),
            models.CheckConstraint(
                check=Q(channel__in=["email", "slack"]),
                name="notifications_channel_valid",
            ),
        ]
    def save(self, *args, **kwargs):
        # Normalize fields
        if self.recipient_email:
            self.recipient_email = self.recipient_email.strip().lower()
        if self.channel:
            self.channel = self.channel.strip().lower()
        if self.status:
            self.status = self.status.strip().lower()
        if self.subject:
            self.subject = self.subject.strip()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.recipient_email} | {self.channel} | {self.status} | {self.subject[:40]}"

    @property
    def is_sent(self) -> bool:
        return self.status == self.STATUS_SENT

    @property
    def preview(self) -> str:
        # Short, single-line preview of the message
        txt = (self.message or "").replace("\n", " ").strip()
        return txt[:120] + ("…" if len(txt) > 120 else "")
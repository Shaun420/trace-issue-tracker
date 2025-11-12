from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from django.core.mail import send_mail

from .models import Notification
from .serializers import NotificationSerializer
from issues.models import Issue


class NotificationViewSet(ModelViewSet):
    """
    Endpoints:
    - GET    /notifications/?status=sent&channel=email&recipient=alice@example.com&issue_id=1
             &created_after=2025-01-01&created_before=2025-01-31&search=subject
    - POST   /notifications/           (standard create)
    - GET    /notifications/{id}/
    - DELETE /notifications/{id}/

    Custom actions:
    - GET    /notifications/stats/
    - POST   /notifications/send/              { recipients: [..], subject, message, channel, issue_id? }
    - POST   /notifications/send_to_affected/  { issue_id, subject, message, channel }
    - POST   /notifications/{id}/resend/
    - POST   /notifications/bulk_resend/       { notification_ids: [..] }
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "channel", "issue"]
    search_fields = ["subject", "message", "recipient_email"]
    ordering_fields = ["sent_at", "created_at", "updated_at", "status"]
    ordering = ["-sent_at"]

    def get_queryset(self):
        qs = (
            Notification.objects.all()
            .select_related("issue", "created_by")
        )

        params = self.request.query_params
        recipient = params.get("recipient") or params.get("recipient_email")
        issue_id = params.get("issue_id")
        created_after = params.get("created_after")
        created_before = params.get("created_before")

        if recipient:
            qs = qs.filter(recipient_email__iexact=recipient)

        if issue_id:
            qs = qs.filter(issue_id=issue_id)

        # Date filters (ISO 8601 or YYYY-MM-DD)
        def to_aware(dt_str, end_of_day=False):
            if not dt_str:
                return None
            dt = parse_datetime(dt_str)
            if not dt:
                dt = parse_datetime(f"{dt_str}{'T23:59:59Z' if end_of_day else 'T00:00:00Z'}")
            if not dt:
                return None
            from django.utils import timezone as tz
            if tz.is_naive(dt):
                dt = tz.make_aware(dt, tz.get_current_timezone())
            return dt

        dt_after = to_aware(created_after, end_of_day=False)
        dt_before = to_aware(created_before, end_of_day=True)

        # Prefer created_at if present; else fallback to sent_at
        if hasattr(Notification, "created_at"):
            if dt_after:
                qs = qs.filter(created_at__gte=dt_after)
            if dt_before:
                qs = qs.filter(created_at__lte=dt_before)
        else:
            if dt_after:
                qs = qs.filter(sent_at__gte=dt_after)
            if dt_before:
                qs = qs.filter(sent_at__lte=dt_before)

        return qs.distinct()

    def perform_create(self, serializer):
        user = getattr(self.request, "user", None)
        serializer.save(created_by=user if user and user.is_authenticated else None)

    # -------------------- Stats --------------------

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        qs = self.get_queryset()
        total = qs.count()
        sent = qs.filter(status="sent").count()
        pending = qs.filter(status="pending").count()
        failed = qs.filter(status="failed").count()

        # If you later track opens, compute properly; for now 0
        open_rate = 0

        return Response(
            {
                "total": total,
                "sent": sent,
                "pending": pending,
                "failed": failed,
                "openRate": open_rate,
            },
            status=status.HTTP_200_OK,
        )

    # -------------------- Send APIs --------------------

    @action(detail=False, methods=["post"], url_path="send")
    def send(self, request):
        """
        Body:
          {
            "recipients": ["a@b.com", "c@d.com"],   # or comma-separated string
            "subject": "Subject",
            "message": "Body",
            "channel": "email|slack",
            "issue_id": 123   # optional
          }
        """
        recipients = request.data.get("recipients")
        subject = (request.data.get("subject") or "").strip()
        message = (request.data.get("message") or "").strip()
        channel = (request.data.get("channel") or "email").strip().lower()
        issue_id = request.data.get("issue_id")

        if not recipients:
            raise ValidationError({"recipients": "Provide at least one recipient."})
        if isinstance(recipients, str):
            recipients = [r.strip() for r in recipients.split(",") if r.strip()]
        if not isinstance(recipients, list) or not recipients:
            raise ValidationError({"recipients": "Invalid recipients format."})
        if not subject:
            raise ValidationError({"subject": "Subject is required."})
        if not message:
            raise ValidationError({"message": "Message is required."})

        issue = None
        if issue_id:
            issue = get_object_or_404(Issue, id=issue_id)

        created = []
        with transaction.atomic():
            for email in recipients:
                notif = Notification.objects.create(
                    recipient_email=email,
                    subject=subject,
                    message=message,
                    channel=channel,
                    status="pending",
                    issue=issue,
                    created_by=request.user if request.user.is_authenticated else None,
                )
                self._attempt_send(notif)
                created.append(notif)

        serializer = self.get_serializer(created, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="send_to_affected")
    def send_to_affected(self, request):
        """
        Body:
          { "issue_id": 123, "subject": "...", "message": "...", "channel": "email|slack" }
        Sends to distinct emails from issue.linked_feedback.user_email
        """
        issue_id = request.data.get("issue_id")
        subject = (request.data.get("subject") or "").strip()
        message = (request.data.get("message") or "").strip()
        channel = (request.data.get("channel") or "email").strip().lower()

        if not issue_id:
            raise ValidationError({"issue_id": "This field is required."})
        if not subject:
            raise ValidationError({"subject": "Subject is required."})
        if not message:
            raise ValidationError({"message": "Message is required."})

        issue = get_object_or_404(Issue, id=issue_id)
        emails = (
            issue.linked_feedback.values_list("user_email", flat=True).distinct()
        )

        created = []
        with transaction.atomic():
            for email in emails:
                notif = Notification.objects.create(
                    recipient_email=email,
                    subject=subject,
                    message=message,
                    channel=channel,
                    status="pending",
                    issue=issue,
                    created_by=request.user if request.user.is_authenticated else None,
                )
                self._attempt_send(notif)
                created.append(notif)

        serializer = self.get_serializer(created, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # -------------------- Resend APIs --------------------

    @action(detail=True, methods=["post"], url_path="resend")
    def resend(self, request, pk=None):
        notif = self.get_object()
        # Reset status to pending before retry
        notif.status = "pending"
        notif.error = "" if hasattr(notif, "error") else getattr(notif, "error", "")
        notif.save(update_fields=["status"] + (["error"] if hasattr(notif, "error") else []))
        self._attempt_send(notif)
        serializer = self.get_serializer(notif, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="bulk_resend")
    def bulk_resend(self, request):
        """
        Body: { "notification_ids": [1,2,3] }
        """
        ids = request.data.get("notification_ids") or []
        if not isinstance(ids, list) or not ids:
            raise ValidationError({"notification_ids": "Provide a non-empty list of ids."})

        qs = Notification.objects.filter(id__in=ids)
        updated = 0
        with transaction.atomic():
            for notif in qs:
                notif.status = "pending"
                if hasattr(notif, "error"):
                    notif.error = ""
                notif.save(update_fields=["status"] + (["error"] if hasattr(notif, "error") else []))
                self._attempt_send(notif)
                updated += 1

        return Response(
            {"status": "resent", "count": updated},
            status=status.HTTP_200_OK,
        )

    # -------------------- Helpers --------------------

    def _attempt_send(self, notif: Notification):
        """
        Try to send the notification through the selected channel.
        On success: set status='sent' and sent_at=now.
        On failure: set status='failed' and store error if model has 'error'.
        """
        now = timezone.now()
        channel = (notif.channel or "email").lower()

        try:
            if channel == "email":
                from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")
                # If email backend not configured, this can raise — we handle below
                send_mail(
                    subject=notif.subject or "",
                    message=notif.message or "",
                    from_email=from_email,
                    recipient_list=[notif.recipient_email],
                    fail_silently=False,
                )
                notif.status = "sent"
                if hasattr(notif, "sent_at"):
                    notif.sent_at = now
                notif.save(update_fields=["status"] + (["sent_at"] if hasattr(notif, "sent_at") else []))
                return

            elif channel == "slack":
                # Implement actual Slack posting here (e.g., via webhook).
                # For now, treat as success.
                notif.status = "sent"
                if hasattr(notif, "sent_at"):
                    notif.sent_at = now
                notif.save(update_fields=["status"] + (["sent_at"] if hasattr(notif, "sent_at") else []))
                return

            else:
                # Unknown channels fail
                notif.status = "failed"
                if hasattr(notif, "error"):
                    notif.error = f"Unsupported channel: {channel}"
                notif.save(update_fields=["status"] + (["error"] if hasattr(notif, "error") else []))
                return

        except Exception as e:
            notif.status = "failed"
            if hasattr(notif, "error"):
                notif.error = str(e)
            notif.save(update_fields=["status"] + (["error"] if hasattr(notif, "error") else []))
            return
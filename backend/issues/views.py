# issues/views.py
from django.db import transaction
from django.db.models import Count, Avg, DurationField, ExpressionWrapper, F, Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Issue
from .serializers import IssueSerializer, IssueDetailSerializer
from feedback.models import Feedback

# Optional notifications; won't break if not present
try:
    from notifications.tasks import send_resolution_notifications
except Exception:
    send_resolution_notifications = None


class IssueViewSet(ModelViewSet):
    """
    Endpoints:
    - GET    /issues/?status=open&priority=3&assigned_to=12&with_feedback=true
             &created_after=2025-01-01&created_before=2025-01-31
             &search=login&ordering=-priority
    - POST   /issues/ (create)
    - GET    /issues/{id}/ (detail)
    - PATCH  /issues/{id}/ (update)
    - POST   /issues/{id}/resolve/
    - POST   /issues/{id}/reopen/
    - POST   /issues/{id}/link-feedback/     { "feedback_ids": [1,2,3] }
    - POST   /issues/{id}/unlink-feedback/   { "feedback_ids": [1,2,3] }
    - GET    /issues/stats/
    - GET    /issues/top-by-feedback/?limit=5
    """
    permission_classes = [IsAuthenticated]

    # Annotate feedback_count; select related for performance
    def get_queryset(self):
        qs = (
            Issue.objects.all()
            .select_related("assigned_to", "created_by")
            .prefetch_related("linked_feedback")
            .annotate(feedback_count=Count("linked_feedback", distinct=True))
        )

        # Filters via query params
        request = self.request
        params = request.query_params

        status_param = params.get("status")
        priority_param = params.get("priority")
        assigned_to = params.get("assigned_to")
        with_feedback = params.get("with_feedback")
        created_after = params.get("created_after")
        created_before = params.get("created_before")

        if status_param:
            qs = qs.filter(status=status_param)

        if priority_param:
            try:
                qs = qs.filter(priority=int(priority_param))
            except (TypeError, ValueError):
                pass

        if assigned_to:
            qs = qs.filter(assigned_to_id=assigned_to)

        if with_feedback == "true":
            qs = qs.filter(linked_feedback__isnull=False)
        elif with_feedback == "false":
            qs = qs.filter(linked_feedback__isnull=True)

        # Date filtering (ISO 8601 or YYYY-MM-DD)
        if created_after:
            dt = parse_datetime(created_after) or parse_datetime(f"{created_after}T00:00:00Z")
            if dt:
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt, timezone.get_current_timezone())
                qs = qs.filter(created_at__gte=dt)

        if created_before:
            dt = parse_datetime(created_before) or parse_datetime(f"{created_before}T23:59:59Z")
            if dt:
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt, timezone.get_current_timezone())
                qs = qs.filter(created_at__lte=dt)

        return qs.distinct()

    serializer_class = IssueSerializer

    # Search + ordering + filter backends
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "assigned_to"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "priority", "feedback_count"]
    ordering = ["-priority", "-created_at"]

    def get_serializer_class(self):
        if self.action in ["retrieve"]:
            return IssueDetailSerializer
        return IssueSerializer

    def perform_create(self, serializer):
        # Attach creator if authenticated
        user = getattr(self.request, "user", None)
        serializer.save(created_by=user if user and user.is_authenticated else None)

    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve(self, request, pk=None):
        """
        Mark issue as resolved and (optionally) notify affected users.
        """
        issue = self.get_object()
        if issue.status == "resolved":
            return Response({"status": "already_resolved"}, status=status.HTTP_200_OK)

        issue.status = "resolved"
        issue.save(update_fields=["status", "updated_at"])

        # Trigger notifications if available
        if send_resolution_notifications:
            try:
                send_resolution_notifications(issue.id)
            except Exception:
                # Fail silently to avoid breaking API
                pass

        return Response({"status": "resolved", "issue_id": issue.id}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reopen")
    def reopen(self, request, pk=None):
        """
        Reopen a resolved issue (status -> open).
        """
        issue = self.get_object()
        if issue.status != "resolved":
            issue.status = "open"
            issue.save(update_fields=["status", "updated_at"])
            return Response({"status": "open", "issue_id": issue.id}, status=status.HTTP_200_OK)

        issue.status = "open"
        issue.save(update_fields=["status", "updated_at"])
        return Response({"status": "open", "issue_id": issue.id}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="link-feedback")
    def link_feedback(self, request, pk=None):
        """
        Link multiple feedback items to this issue.
        Body: { "feedback_ids": [1,2,3] }
        """
        issue = self.get_object()
        feedback_ids = request.data.get("feedback_ids") or []
        if not isinstance(feedback_ids, list) or not feedback_ids:
            raise ValidationError({"feedback_ids": "Provide a non-empty list of ids."})

        with transaction.atomic():
            qs = Feedback.objects.filter(id__in=feedback_ids).only("id")
            issue.linked_feedback.add(*qs)

        return Response(
            {
                "status": "linked",
                "issue_id": issue.id,
                "linked_count": qs.count(),
                "total_feedback": issue.linked_feedback.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="unlink-feedback")
    def unlink_feedback(self, request, pk=None):
        """
        Unlink multiple feedback items from this issue.
        Body: { "feedback_ids": [1,2,3] }
        """
        issue = self.get_object()
        feedback_ids = request.data.get("feedback_ids") or []
        if not isinstance(feedback_ids, list) or not feedback_ids:
            raise ValidationError({"feedback_ids": "Provide a non-empty list of ids."})

        with transaction.atomic():
            qs = Feedback.objects.filter(id__in=feedback_ids).only("id")
            issue.linked_feedback.remove(*qs)

        return Response(
            {
                "status": "unlinked",
                "issue_id": issue.id,
                "unlinked_count": qs.count(),
                "total_feedback": issue.linked_feedback.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """
        Returns dashboard-friendly stats:
        {
          "totalFeedback": <int>,
          "openIssues": <int>,
          "resolvedIssues": <int>,
          "avgResolutionTime": <float days>,
          "activeUsers": <int>,
          "criticalIssues": <int>
        }
        """
        qs = self.get_queryset().all()
        open_issues = qs.filter(status="open").count()
        resolved_issues = qs.filter(status="resolved").count()

        # Average resolution time over resolved issues (using updated_at as a proxy end)
        resolved_qs = qs.filter(status="resolved").exclude(updated_at__isnull=True)
        duration_expr = ExpressionWrapper(F("updated_at") - F("created_at"), output_field=DurationField())
        avg_duration = resolved_qs.aggregate(avg=Avg(duration_expr))["avg"]
        avg_days = round(avg_duration.total_seconds() / 86400.0, 2) if avg_duration else 0.0

        # Total feedback (distinct) across issues
        total_feedback = Feedback.objects.count()

        # Active users (distinct emails in feedback)
        active_users = Feedback.objects.values("user_email").distinct().count()

        # Critical issues (priority >= 3) not resolved
        critical_issues = qs.filter(priority__gte=3).exclude(status="resolved").count()

        data = {
            "totalFeedback": total_feedback,
            "openIssues": open_issues,
            "resolvedIssues": resolved_issues,
            "avgResolutionTime": avg_days,
            "activeUsers": active_users,
            "criticalIssues": critical_issues,
        }
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="top-by-feedback")
    def top_by_feedback(self, request):
        """
        Top issues by feedback count.
        Query param: ?limit=5
        """
        try:
            limit = int(request.query_params.get("limit", 5))
        except (TypeError, ValueError):
            limit = 5

        qs = (
            self.get_queryset()
            .annotate(feedback_count=Count("linked_feedback", distinct=True))
            .order_by("-feedback_count", "-priority", "-created_at")[:limit]
        )

        serializer = IssueSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
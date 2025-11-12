from django.db import transaction
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

from .models import Feedback
from .serializers import FeedbackSerializer
from issues.models import Issue


class FeedbackViewSet(ModelViewSet):
    """
    Feedback endpoints:
    - GET /feedback/?source=email&sentiment=negative&unlinked=true&issue_id=123
    - POST /feedback/ (create)
    - POST /feedback/{id}/link-to-issue/
    - POST /feedback/{id}/unlink-from-issue/
    - POST /feedback/bulk-link/
    - POST /feedback/bulk-unlink/
    - POST /feedback/ingest/  (simple external ingest)
    """
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    # Powerful filtering + search + ordering out of the box
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["source", "sentiment"]  # extend if needed
    search_fields = ["content", "user_email"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = super().get_queryset()

        # Query params
        source = self.request.query_params.get("source")
        unlinked = self.request.query_params.get("unlinked")
        issue_id = self.request.query_params.get("issue_id")
        created_after = self.request.query_params.get("created_after")
        created_before = self.request.query_params.get("created_before")

        if source:
            qs = qs.filter(source=source)

        # Feedback not linked to any issue
        if unlinked == "true":
            qs = qs.filter(issues__isnull=True)

        # Only feedback linked to a particular issue
        if issue_id:
            qs = qs.filter(issues__id=issue_id)

        # Date range filters (expecting ISO 8601 strings)
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

    @action(detail=True, methods=["post"], url_path="link-to-issue")
    def link_to_issue(self, request, pk=None):
        """
        Link a single feedback item to an issue.
        Body: { "issue_id": 123 }
        """
        feedback = self.get_object()
        issue_id = request.data.get("issue_id")
        if not issue_id:
            raise ValidationError({"issue_id": "This field is required."})

        issue = get_object_or_404(Issue, id=issue_id)

        # Idempotent add; DRF ManyToMany won't duplicate
        issue.linked_feedback.add(feedback)
        return Response(
            {
                "status": "linked",
                "issue_id": issue.id,
                "feedback_id": feedback.id,
                "total_feedback_for_issue": issue.linked_feedback.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="unlink-from-issue")
    def unlink_from_issue(self, request, pk=None):
        """
        Unlink a single feedback item from an issue.
        Body: { "issue_id": 123 }
        """
        feedback = self.get_object()
        issue_id = request.data.get("issue_id")
        if not issue_id:
            raise ValidationError({"issue_id": "This field is required."})

        issue = get_object_or_404(Issue, id=issue_id)
        issue.linked_feedback.remove(feedback)
        return Response(
            {
                "status": "unlinked",
                "issue_id": issue.id,
                "feedback_id": feedback.id,
                "total_feedback_for_issue": issue.linked_feedback.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="bulk-link")
    def bulk_link(self, request):
        """
        Link multiple feedback items to a single issue.
        Body: { "feedback_ids": [1,2,3], "issue_id": 123 }
        """
        feedback_ids = request.data.get("feedback_ids") or []
        issue_id = request.data.get("issue_id")
        if not issue_id or not isinstance(feedback_ids, list) or not feedback_ids:
            raise ValidationError({"detail": "Provide 'issue_id' and non-empty list 'feedback_ids'."})

        issue = get_object_or_404(Issue, id=issue_id)
        with transaction.atomic():
            qs = Feedback.objects.filter(id__in=feedback_ids).only("id")
            issue.linked_feedback.add(*qs)

        return Response(
            {
                "status": "linked",
                "issue_id": issue.id,
                "linked_count": qs.count(),
                "total_feedback_for_issue": issue.linked_feedback.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="bulk-unlink")
    def bulk_unlink(self, request):
        """
        Unlink multiple feedback items from a single issue.
        Body: { "feedback_ids": [1,2,3], "issue_id": 123 }
        """
        feedback_ids = request.data.get("feedback_ids") or []
        issue_id = request.data.get("issue_id")
        if not issue_id or not isinstance(feedback_ids, list) or not feedback_ids:
            raise ValidationError({"detail": "Provide 'issue_id' and non-empty list 'feedback_ids'."})

        issue = get_object_or_404(Issue, id=issue_id)
        with transaction.atomic():
            qs = Feedback.objects.filter(id__in=feedback_ids).only("id")
            issue.linked_feedback.remove(*qs)

        return Response(
            {
                "status": "unlinked",
                "issue_id": issue.id,
                "unlinked_count": qs.count(),
                "total_feedback_for_issue": issue.linked_feedback.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="ingest")
    def ingest(self, request):
        """
        Simple ingestion endpoint for external sources (Slack, email, forms).
        Body: { "source": "email|slack|form|github", "content": "...", "user_email": "a@b.com", "sentiment": "optional" }
        """
        required = ["source", "content", "user_email"]
        missing = [f for f in required if not request.data.get(f)]
        if missing:
            raise ValidationError({"missing": missing})

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        feedback = serializer.save()

        return Response(
            {"status": "ingested", "id": feedback.id, "created_at": feedback.created_at},
            status=status.HTTP_201_CREATED,
        )
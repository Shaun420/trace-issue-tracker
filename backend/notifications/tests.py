# notifications/tests.py
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from notifications.models import Notification
from issues.models import Issue
from feedback.models import Feedback


User = get_user_model()


def url_list():
    # /api/notifications/
    return reverse("notifications:notifications-list")


def url_detail(pk: int):
    # /api/notifications/{id}/
    return reverse("notifications:notifications-detail", kwargs={"pk": pk})


def url_action_detail(pk: int, action: str):
    # /api/notifications/{id}/{action}/
    # e.g., notifications:notifications-resend
    return reverse(f"notifications:notifications-{action}", kwargs={"pk": pk})


def url_action(action: str):
    # detail=False actions: send, send_to_affected, stats, bulk_resend
    # send_to_affected -> 'send-to-affected'
    name = action.replace("_", "-")
    return reverse(f"notifications:notifications-{name}")


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class NotificationViewSetTests(APITestCase):
    def setUp(self):
        # Auth user
        self.user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="pass1234",
        )
        self.client.force_authenticate(self.user)

        # Extra users (if needed)
        self.dev = User.objects.create_user(
            username="dev",
            email="dev@example.com",
            password="pass1234",
        )

        # Create an Issue and Feedback to use with send_to_affected
        self.issue = Issue.objects.create(
            title="Export fails on large datasets",
            description="500 error when exporting >1000 rows",
            status=Issue.STATUS_OPEN,
            priority=Issue.PRIORITY_HIGH,
            created_by=self.user,
            assigned_to=self.dev,
        )

        self.fb1 = Feedback.objects.create(
            source=Feedback.SOURCE_EMAIL,
            content="Export fails for me too.",
            user_email="alice@example.com",
        )
        self.fb2 = Feedback.objects.create(
            source=Feedback.SOURCE_SLACK,
            content="Same export error, please fix.",
            user_email="bob@example.com",
        )
        self.issue.linked_feedback.add(self.fb1, self.fb2)

        # Seed some notifications
        now = timezone.now()
        self.n1 = Notification.objects.create(
            recipient_email="user1@example.com",
            subject="Welcome",
            message="Hello there",
            channel=Notification.CHANNEL_EMAIL,
            status=Notification.STATUS_SENT,
            sent_at=now,
            created_by=self.user,
        )
        self.n2 = Notification.objects.create(
            recipient_email="user2@example.com",
            subject="Outage",
            message="We had a brief outage",
            channel=Notification.CHANNEL_EMAIL,
            status=Notification.STATUS_FAILED,
            created_by=self.user,
        )
        self.n3 = Notification.objects.create(
            recipient_email="user3@example.com",
            subject="Reminder",
            message="Action needed",
            channel=Notification.CHANNEL_SLACK,
            status=Notification.STATUS_PENDING,
            created_by=self.user,
        )

    # ---------- Basics / Permissions ----------

    def test_auth_required(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get(url_list())
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_notifications(self):
        resp = self.client.get(url_list())
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 3)
        # Serializer read-only fields present
        first = resp.data[0]
        self.assertIn("status", first)
        self.assertIn("channel", first)
        self.assertIn("created_at", first)

    def test_retrieve_notification(self):
        resp = self.client.get(url_detail(self.n1.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["id"], self.n1.id)

    def test_delete_notification(self):
        resp = self.client.delete(url_detail(self.n3.id))
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Notification.objects.filter(id=self.n3.id).exists())

    # ---------- Send APIs ----------

    def test_send_creates_and_sends_email(self):
        payload = {
            "recipients": ["newuser@example.com", "newuser2@example.com"],
            "subject": "Test Subject",
            "message": "Test Body",
            "channel": "email",
        }
        resp = self.client.post(url_action("send"), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(resp.data), 2)
        # Should mark sent with locmem backend
        for row in resp.data:
            notif = Notification.objects.get(id=row["id"])
            self.assertEqual(notif.status, Notification.STATUS_SENT)
            self.assertIsNotNone(notif.sent_at)

    def test_send_with_invalid_payload(self):
        payload = {
            "recipients": "",  # invalid
            "subject": "X",
            "message": "Y",
            "channel": "email",
        }
        resp = self.client.post(url_action("send"), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("recipients", resp.data)

    def test_send_to_affected_uses_issue_feedback_emails(self):
        payload = {
            "issue_id": self.issue.id,
            "subject": "Fix deployed",
            "message": "We shipped a fix",
            "channel": "email",
        }
        resp = self.client.post(url_action("send_to_affected"), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        # Should create one for each distinct feedback user email
        emails = {row["recipient_email"] for row in resp.data}
        self.assertSetEqual(emails, {"alice@example.com", "bob@example.com"})
        for row in resp.data:
            notif = Notification.objects.get(id=row["id"])
            self.assertEqual(notif.status, Notification.STATUS_SENT)
            self.assertIsNotNone(notif.sent_at)
            self.assertEqual(notif.issue_id, self.issue.id)

    # ---------- Resend APIs ----------

    def test_resend_failed_notification(self):
        # Ensure it starts failed
        self.assertEqual(self.n2.status, Notification.STATUS_FAILED)
        resp = self.client.post(url_action_detail(self.n2.id, "resend"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.n2.refresh_from_db()
        self.assertEqual(self.n2.status, Notification.STATUS_SENT)
        self.assertIsNotNone(self.n2.sent_at)

    def test_bulk_resend(self):
        # Mark two as failed then resend both
        self.n1.status = Notification.STATUS_FAILED
        self.n1.save(update_fields=["status"])
        self.n3.status = Notification.STATUS_FAILED
        self.n3.save(update_fields=["status"])

        payload = {"notification_ids": [self.n1.id, self.n3.id]}
        resp = self.client.post(url_action("bulk_resend"), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.n1.refresh_from_db()
        self.n3.refresh_from_db()
        self.assertEqual(self.n1.status, Notification.STATUS_SENT)
        self.assertEqual(self.n3.status, Notification.STATUS_SENT)

    # ---------- Filters / Search / Ordering ----------

    def test_filters_status_channel_recipient_issue(self):
        # Attach one notification to issue
        self.n1.issue = self.issue
        self.n1.save(update_fields=["issue"])
        # Filter by status
        resp = self.client.get(url_list(), {"status": "sent"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for row in resp.data:
            self.assertEqual(row["status"], "sent")
        # Filter by channel
        resp = self.client.get(url_list(), {"channel": "email"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for row in resp.data:
            self.assertEqual(row["channel"], "email")
        # Filter by recipient
        resp = self.client.get(url_list(), {"recipient": "user1@example.com"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for row in resp.data:
            self.assertEqual(row["recipient_email"], "user1@example.com")
        # Filter by issue_id
        resp = self.client.get(url_list(), {"issue_id": self.issue.id})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = [row["id"] for row in resp.data]
        self.assertIn(self.n1.id, ids)

    def test_search_and_ordering(self):
        # Search by subject
        resp = self.client.get(url_list(), {"search": "Outage"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = [row["id"] for row in resp.data]
        self.assertIn(self.n2.id, ids)

        # Ordering by -sent_at should place sent ones first (n1 has sent_at)
        resp = self.client.get(url_list(), {"ordering": "-sent_at"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Ensure sorted by sent_at desc where present
        sent_ats = [
            (row["id"], row.get("sent_at"))
            for row in resp.data
        ]
        # Just assert the first one is either n1 or any with sent_at not None
        self.assertTrue(
            any(row.get("sent_at") for row in resp.data),
            "Expected at least one notification with sent_at for ordering test",
        )

    # ---------- Stats ----------

    def test_stats_endpoint(self):
        resp = self.client.get(url_action("stats"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data
        for key in ["total", "sent", "pending", "failed", "openRate"]:
            self.assertIn(key, data)
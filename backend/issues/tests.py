from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from issues.models import Issue
from feedback.models import Feedback

User = get_user_model()

def url_list():
    # /api/issues/
    return reverse("issues:issues-list")


def url_detail(pk: int):
    # /api/issues/{id}/
    return reverse("issues:issues-detail", kwargs={"pk": pk})


def url_action(pk: int, action: str):
    # /api/issues/{id}/{action}/
    return reverse(f"issues:issues-{action}", kwargs={"pk": pk})


def url_stats():
    # /api/issues/stats/
    return reverse("issues:issues-stats")


def url_top_by_feedback():
    # /api/issues/top-by-feedback/
    return reverse("issues:issues-top-by-feedback")


class IssueViewSetTests(APITestCase):
    def setUp(self):
        # Authenticated user
        self.user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="pass1234",
        )
        self.client.force_authenticate(self.user)

        # Another user for assigned_to
        self.dev = User.objects.create_user(
            username="devuser",
            email="dev@example.com",
            password="pass1234",
        )

        # Feedback seeds
        self.fb1 = Feedback.objects.create(
            source=Feedback.SOURCE_EMAIL,
            content="Login button not working on mobile.",
            user_email="alice@example.com",
        )
        self.fb2 = Feedback.objects.create(
            source=Feedback.SOURCE_SLACK,
            content="Dashboard loads slowly after latest release.",
            user_email="bob@example.com",
        )
        self.fb3 = Feedback.objects.create(
            source=Feedback.SOURCE_FORM,
            content="Export CSV returns 500 for >1000 rows.",
            user_email="carol@example.com",
        )

        # Issues seeds
        self.i1 = Issue.objects.create(
            title="Fix login on mobile",
            description="Users cannot click the login button on iOS.",
            status=Issue.STATUS_OPEN,
            priority=Issue.PRIORITY_HIGH,
            assigned_to=self.dev,
            created_by=self.user,
        )
        self.i2 = Issue.objects.create(
            title="Optimize dashboard queries",
            description="N+1 queries detected; cache required.",
            status=Issue.STATUS_IN_PROGRESS,
            priority=Issue.PRIORITY_MEDIUM,
            assigned_to=self.dev,
            created_by=self.user,
        )
        self.i3 = Issue.objects.create(
            title="CSV export fails",
            description="Large export returns 500.",
            status=Issue.STATUS_OPEN,
            priority=Issue.PRIORITY_HIGH,
            created_by=self.user,
        )
        # Link some feedback
        self.i1.linked_feedback.add(self.fb1)
        self.i2.linked_feedback.add(self.fb2)

    # ---------- Basics / Permissions ----------

    def test_auth_required(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get(url_list())
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_issues(self):
        resp = self.client.get(url_list())
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 3)
        # Serializer exposes feedback_count and nested user details (read-only)
        first = resp.data[0]
        self.assertIn("feedback_count", first)
        self.assertIn("created_by_details", first)
        self.assertIn("assigned_to_details", first)

    def test_retrieve_issue_detail(self):
        resp = self.client.get(url_detail(self.i1.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["id"], self.i1.id)
        # Detail serializer includes linked_feedback
        self.assertIn("linked_feedback", resp.data)

    # ---------- Create / Update ----------

    def test_create_issue_sets_created_by(self):
        payload = {
            "title": "New feature request",
            "description": "Add dark mode to the app",
            "priority": 2,
            "status": "open",
            "assigned_to": self.dev.id,
        }
        resp = self.client.post(url_list(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        issue = Issue.objects.get(id=resp.data["id"])
        self.assertEqual(issue.created_by_id, self.user.id)
        self.assertEqual(issue.assigned_to_id, self.dev.id)
        self.assertEqual(issue.priority, 2)

    def test_create_issue_with_linked_feedback_ids(self):
        payload = {
            "title": "Combine feedback for export",
            "description": "Unify export handling",
            "priority": 3,
            "status": "open",
            "linked_feedback_ids": [self.fb2.id, self.fb3.id],
        }
        resp = self.client.post(url_list(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        issue = Issue.objects.get(id=resp.data["id"])
        self.assertEqual(issue.linked_feedback.count(), 2)

    def test_update_issue_and_set_feedback_m2m(self):
        payload = {
            "title": "CSV export fails (updated)",
            "linked_feedback_ids": [self.fb1.id, self.fb3.id],
        }
        resp = self.client.patch(url_detail(self.i3.id), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.i3.refresh_from_db()
        self.assertEqual(self.i3.title, "CSV export fails (updated)")
        self.assertEqual(self.i3.linked_feedback.count(), 2)

    def test_invalid_priority_validation(self):
        payload = {"priority": 5}  # out of allowed 1..3
        resp = self.client.patch(url_detail(self.i1.id), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("priority", resp.data)

    # ---------- Actions: resolve / reopen ----------

    def test_resolve_action(self):
        resp = self.client.post(url_action(self.i1.id, "resolve"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.i1.refresh_from_db()
        self.assertEqual(self.i1.status, Issue.STATUS_RESOLVED)

    def test_reopen_action(self):
        self.i1.status = Issue.STATUS_RESOLVED
        self.i1.save(update_fields=["status"])
        resp = self.client.post(url_action(self.i1.id, "reopen"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.i1.refresh_from_db()
        self.assertEqual(self.i1.status, Issue.STATUS_OPEN)

    # ---------- Actions: link/unlink feedback ----------

    def test_link_feedback_bulk(self):
        resp = self.client.post(
            url_action(self.i3.id, "link-feedback"),
            {"feedback_ids": [self.fb1.id, self.fb2.id]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.i3.refresh_from_db()
        self.assertEqual(self.i3.linked_feedback.count(), 2)

    def test_unlink_feedback_bulk(self):
        # link then unlink one
        self.i2.linked_feedback.add(self.fb3)
        resp = self.client.post(
            url_action(self.i2.id, "unlink-feedback"),
            {"feedback_ids": [self.fb2.id]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.i2.refresh_from_db()
        self.assertFalse(self.i2.linked_feedback.filter(id=self.fb2.id).exists())

    # ---------- Filters / Search / Ordering ----------

    def test_filter_status_and_priority(self):
        resp = self.client.get(url_list(), {"status": "open", "priority": 3})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for it in resp.data:
            self.assertEqual(it["status"], "open")
            self.assertEqual(it["priority"], 3)

    def test_search_by_title_description(self):
        resp = self.client.get(url_list(), {"search": "dashboard"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # At least the dashboard issue should be there
        ids = [i["id"] for i in resp.data]
        self.assertIn(self.i2.id, ids)

    def test_ordering(self):
        # Order ascending by priority, then by created_at
        resp = self.client.get(url_list(), {"ordering": "priority"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        priorities = [row["priority"] for row in resp.data]
        self.assertEqual(priorities, sorted(priorities))

    # ---------- Stats / Top-by-feedback ----------

    def test_stats_endpoint(self):
        # resolve one to exercise avg calc
        self.client.post(url_action(self.i2.id, "resolve"))
        # bump updated_at to simulate non-zero duration
        Issue.objects.filter(id=self.i2.id).update(updated_at=timezone.now())

        resp = self.client.get(url_stats())
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.data
        for key in [
            "totalFeedback",
            "openIssues",
            "resolvedIssues",
            "avgResolutionTime",
            "activeUsers",
            "criticalIssues",
        ]:
            self.assertIn(key, data)

    def test_top_by_feedback(self):
        # Ensure i1 has the most feedback
        self.i1.linked_feedback.add(self.fb3)
        resp = self.client.get(url_top_by_feedback(), {"limit": 2})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp.data) <= 2)
        top_ids = [row["id"] for row in resp.data]
        self.assertIn(self.i1.id, top_ids)
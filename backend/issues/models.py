# issues/models.py
from django.conf import settings
from django.db import models
from django.db.models import Q


class Issue(models.Model):
	# Status choices
	STATUS_OPEN = "open"
	STATUS_IN_PROGRESS = "in_progress"
	STATUS_RESOLVED = "resolved"
	STATUS_CHOICES = (
		(STATUS_OPEN, "Open"),
		(STATUS_IN_PROGRESS, "In Progress"),
		(STATUS_RESOLVED, "Resolved"),
	)

	# Priority: 1 (Low), 2 (Medium), 3 (High)
	PRIORITY_LOW = 1
	PRIORITY_MEDIUM = 2
	PRIORITY_HIGH = 3

	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)

	status = models.CharField(
		max_length=20,
		choices=STATUS_CHOICES,
		default=STATUS_OPEN,
		db_index=True,
	)
	priority = models.PositiveSmallIntegerField(
		default=PRIORITY_LOW,
		help_text="1=Low, 2=Medium, 3=High",
		db_index=True,
	)

	assigned_to = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="issues_assigned",
	)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="issues_created",
	)

	# M2M to Feedback; reverse name 'issues' used in FeedbackSerializer
	linked_feedback = models.ManyToManyField(
		"feedback.Feedback",
		related_name="issues",
		blank=True,
	)

	created_at = models.DateTimeField(auto_now_add=True, db_index=True)
	updated_at = models.DateTimeField(auto_now=True, db_index=True)

	class Meta:
		db_table = "issues"
		ordering = ["-priority", "-created_at"]
		indexes = [
			models.Index(fields=["status", "priority"]),
			models.Index(fields=["created_at"]),
			models.Index(fields=["updated_at"]),
		]
		constraints = [
			models.CheckConstraint(
				check=Q(priority__gte=1) & Q(priority__lte=3),
				name="issues_priority_between_1_and_3",
			),
			models.CheckConstraint(
				# Use literals; class attrs aren’t available here
				check=Q(status__in=["open", "in_progress", "resolved"]),
				name="issues_status_valid",
			),
		]
	def save(self, *args, **kwargs):
		# Normalize fields
		if self.title:
			self.title = self.title.strip()
		if self.status:
			self.status = self.status.strip().lower()
		return super().save(*args, **kwargs)

	def __str__(self):
		return f"#{self.pk} {self.title} [{self.get_status_display()} | P{self.priority}]"

	@property
	def is_resolved(self) -> bool:
		return self.status == self.STATUS_RESOLVED

	@property
	def feedback_count(self) -> int:
		# Useful fallback if not annotated in queries
		try:
			return self.linked_feedback.count()
		except Exception:
			return 0
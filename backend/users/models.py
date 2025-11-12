# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    Notes:
    - Username remains the login identifier (USERNAME_FIELD = 'username').
    - Email is unique and normalized to lowercase on save.
    - Role is a simple choice field used across the app for permissions/UX.
    - Optional profile fields (bio, timezone) support front-end Settings UI.
    """

    # Simple role system (adjust/extend as needed)
    ROLE_ADMIN = "admin"
    ROLE_PM = "pm"
    ROLE_DEV = "dev"
    ROLE_SUPPORT = "support"

    ROLE_CHOICES = (
        (ROLE_ADMIN, "Admin"),
        (ROLE_PM, "Product Manager"),
        (ROLE_DEV, "Developer"),
        (ROLE_SUPPORT, "Support Agent"),
    )

    # Override default email to be unique
    email = models.EmailField(unique=True)

    # App-specific fields
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default=ROLE_SUPPORT, db_index=True
    )
    bio = models.TextField(blank=True, default="")
    timezone = models.CharField(max_length=64, blank=True, default="UTC")

    # Timestamps for auditing (AbstractUser already has last_login, date_joined)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["username"]),
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]
        verbose_name = "user"
        verbose_name_plural = "users"

    def save(self, *args, **kwargs):
        # Normalize email to lowercase
        if self.email:
            self.email = self.email.strip().lower()
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        full = self.get_full_name().strip()
        return full or self.username

    @property
    def full_name(self) -> str:
        return self.get_full_name() or self.username
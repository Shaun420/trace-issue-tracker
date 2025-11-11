from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('pm', 'Product Manager'),
        ('dev', 'Developer'),
        ('support', 'Support Agent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='support')

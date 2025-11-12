from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

app_name = "notifications"

router = DefaultRouter()
# Registers routes at /api/notifications/ and /api/notifications/{id}/ when included under that prefix
router.register(r"", NotificationViewSet, basename="notifications")

urlpatterns = router.urls
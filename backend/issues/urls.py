from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import IssueViewSet

app_name = "issues"

router = DefaultRouter()
# Registers routes at /api/issues/ and /api/issues/{id}/ when included under that prefix
router.register(r"", IssueViewSet, basename="issues")

urlpatterns = router.urls
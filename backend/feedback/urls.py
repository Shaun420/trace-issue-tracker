# feedback/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet

app_name = "feedback"

router = DefaultRouter()
# Registers at /api/feedback/ and /api/feedback/{id}/ when included as path('api/feedback/', include('feedback.urls'))
router.register(r"", FeedbackViewSet, basename="feedback")

urlpatterns = router.urls
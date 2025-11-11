from django.urls import path
from . import views

urlpatterns = [
    path('', views.FeedbackListCreateView.as_view(), name='feedback-list'),
]
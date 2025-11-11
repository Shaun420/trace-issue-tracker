from django.urls import path
from . import views

urlpatterns = [
    path('', views.IssueListCreateView.as_view(), name='issue-list'),
]
"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
# 	path('admin/', admin.site.urls),
# 	path('api/feedback/', include('feedback.urls', namespace="feedback")),
# 	path('api/issues/', include('issues.urls', namespace="issues")),
# 	path('api/notifications/', include('notifications.urls')),
# 	path('api/users/', include('users.urls')),
# ]

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

# Optional: DRF Spectacular (OpenAPI) if installed
try:
    from drf_spectacular.views import (
        SpectacularAPIView,
        SpectacularSwaggerView,
        SpectacularRedocView,
    )

    spectacular_urls = [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path(
            "api/docs/",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
        path(
            "api/redoc/",
            SpectacularRedocView.as_view(url_name="schema"),
            name="redoc",
        ),
    ]
except Exception:
    spectacular_urls = []


def health(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),

    # App APIs
    path("api/users/", include(("users.urls", "users"), namespace="users")),
    path("api/issues/", include(("issues.urls", "issues"), namespace="issues")),
    path("api/feedback/", include(("feedback.urls", "feedback"), namespace="feedback")),
    path(
        "api/notifications/",
        include(("notifications.urls", "notifications"), namespace="notifications"),
    ),

    # DRF login/logout for browsable API
    path("api-auth/", include("rest_framework.urls")),

    # Healthcheck
    path("health/", health),
] + spectacular_urls

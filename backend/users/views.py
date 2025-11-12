from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from django.utils.translation import gettext_lazy as _

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.exceptions import ValidationError

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

User = get_user_model()


def _issue_tokens_for_user(user: User) -> dict:
    """
    Return a dict with access/refresh JWTs for a given user.
    """
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    """
    POST /api/users/register/
    Body: { username, email, password, password_confirm, first_name?, last_name?, role? }
    Returns: { user: <UserSerializer>, tokens: {refresh, access} }
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    throttle_classes = [AnonRateThrottle]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # serializer should handle hashing via create_user
        tokens = _issue_tokens_for_user(user)
        return Response(
            {
                "user": UserSerializer(user, context={"request": request}).data,
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/users/login/
    Body: { email?, username?, password }
    - Allows login with either email or username.
    Returns: { user: <UserSerializer>, tokens: {refresh, access} }
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        username = serializer.validated_data.get("username")
        password = serializer.validated_data["password"]

        # Resolve username from email if provided
        if email and not username:
            user_obj = User.objects.filter(email__iexact=email).first()
            if not user_obj:
                raise ValidationError({"email": _("No user found with this email.")})
            username = user_obj.get_username()

        if not username:
            raise ValidationError({"username": _("Username or email is required.")})

        user = authenticate(request=request, username=username, password=password)
        if not user:
            # avoid leaking whether email exists
            return Response({"error": _("Invalid credentials")}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"error": _("User account is inactive")}, status=status.HTTP_403_FORBIDDEN)

        tokens = _issue_tokens_for_user(user)
        return Response(
            {
                "user": UserSerializer(user, context={"request": request}).data,
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH /api/users/profile/
    - Returns/updates the authenticated user's profile.
    - PATCH will ignore restricted fields (e.g., role) unless you allow them in the serializer.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    throttle_classes = [UserRateThrottle]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        # Optionally prevent role changes by non-admins at view level
        if "role" in request.data and not request.user.is_staff:
            # silently drop or explicitly reject
            data = request.data.copy()
            data.pop("role", None)
            serializer = self.get_serializer(self.get_object(), data=data, partial=True, context={"request": request})
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

        return super().patch(request, *args, **kwargs)
from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


def url_register():
    return reverse("users:register")


def url_login():
    return reverse("users:login")


def url_refresh():
    return reverse("users:token_refresh")


def url_profile():
    return reverse("users:profile")


class UsersAuthTests(APITestCase):
    def setUp(self):
        self.password = "Str0ngPass!123456"
        self.other_password = "An0therStr0ngPass!123"
        self.user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password=self.password,
            first_name="Test",
            last_name="User",
        )

    # -------- Register --------

    def test_register_success(self):
        payload = {
            "username": "newuser",
            "email": "NewUser@Example.com",
            "password": self.password,
            "password_confirm": self.password,
            "first_name": "New",
            "last_name": "User",
            "role": getattr(User, "ROLE_PM", "pm"),  # ok even if role not enforced
        }
        resp = self.client.post(url_register(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", resp.data)
        self.assertIn("tokens", resp.data)
        created = User.objects.get(username="newuser")
        self.assertEqual(created.email, "newuser@example.com")  # normalized lowercase
        # Role is set if model has role field and value valid
        if hasattr(created, "role"):
            self.assertEqual(created.role, payload["role"])

    def test_register_duplicate_email_and_username(self):
        payload = {
            "username": "tester",  # duplicate
            "email": "tester@example.com",  # duplicate
            "password": self.password,
            "password_confirm": self.password,
        }
        resp = self.client.post(url_register(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", resp.data)
        self.assertIn("email", resp.data)

    def test_register_password_mismatch(self):
        payload = {
            "username": "mismatch",
            "email": "mismatch@example.com",
            "password": self.password,
            "password_confirm": self.other_password,
        }
        resp = self.client.post(url_register(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", resp.data)

    # -------- Login --------

    def test_login_with_username(self):
        payload = {
            "username": "tester",
            "password": self.password,
        }
        resp = self.client.post(url_login(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("user", resp.data)
        self.assertIn("tokens", resp.data)
        self.assertIn("access", resp.data["tokens"])
        self.assertIn("refresh", resp.data["tokens"])

    def test_login_with_email(self):
        payload = {
            "email": "tester@example.com",
            "password": self.password,
        }
        resp = self.client.post(url_login(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("user", resp.data)
        self.assertIn("tokens", resp.data)

    def test_login_invalid_credentials(self):
        payload = {
            "username": "tester",
            "password": "WrongPass!999",
        }
        resp = self.client.post(url_login(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", resp.data)

    # -------- Token refresh --------

    def test_token_refresh_flow(self):
        # Login to get refresh token
        login_resp = self.client.post(
            url_login(),
            {"username": "tester", "password": self.password},
            format="json",
        )
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        refresh = login_resp.data["tokens"]["refresh"]

        # Refresh
        refresh_resp = self.client.post(url_refresh(), {"refresh": refresh}, format="json")
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_resp.data)

    # -------- Profile GET/PATCH --------

    def test_profile_requires_auth(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get(url_profile())
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_get(self):
        self.client.force_authenticate(self.user)
        resp = self.client.get(url_profile())
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], "tester")
        self.assertEqual(resp.data["email"], "tester@example.com")

    def test_profile_patch_updates_basic_fields(self):
        self.client.force_authenticate(self.user)
        payload = {"first_name": "Updated", "last_name": "Name"}
        resp = self.client.patch(url_profile(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.user.last_name, "Name")

    def test_profile_patch_email_normalized(self):
        self.client.force_authenticate(self.user)
        payload = {"email": "  UPPER@Example.COM  "}
        resp = self.client.patch(url_profile(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "upper@example.com")

    def test_profile_patch_cannot_change_role_as_non_staff(self):
        self.client.force_authenticate(self.user)
        original_role = getattr(self.user, "role", None)
        target_role = getattr(User, "ROLE_ADMIN", "admin")
        payload = {"first_name": "Keeprole", "role": target_role}
        resp = self.client.patch(url_profile(), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Keeprole")
        if hasattr(self.user, "role"):
            self.assertEqual(self.user.role, original_role)

    def test_profile_patch_can_change_role_as_staff(self):
        # Only if role field exists
        if not hasattr(self.user, "role"):
            self.skipTest("User model has no 'role' field")
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        self.client.force_authenticate(self.user)

        target_role = getattr(User, "ROLE_PM", "pm")
        resp = self.client.patch(url_profile(), {"role": target_role}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, target_role)

    # -------- Register + immediate login flow --------

    def test_register_then_login_by_email(self):
        reg = self.client.post(
            url_register(),
            {
                "username": "chainuser",
                "email": "chain@example.com",
                "password": self.password,
                "password_confirm": self.password,
            },
            format="json",
        )
        self.assertEqual(reg.status_code, status.HTTP_201_CREATED)
        login = self.client.post(
            url_login(), {"email": "chain@example.com", "password": self.password}, format="json"
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", login.data)
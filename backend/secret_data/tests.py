from rest_framework.test import APITestCase, APIClient, URLPatternsTestCase
from rest_framework import status
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse, include, path
from rest_framework_simplejwt.tokens import RefreshToken
from .models import SecretLevelData

class SecretDataTest(APITestCase):   
    def setUp(self):
        self.regular_user = User.objects.create_user(
            username='regular_user',
            email='regular@test.com',
            password='testpassword123'
        )

        self.secret_user = User.objects.create_user(
            username='secret_user',
            email='secret@test.com',
            password='testpassword123'
        )

        self.secret_group = Group.objects.create(name='Secret')

        self.secret_user.groups.add(self.secret_group)

        self.secret_data_1 = SecretLevelData.objects.create(message="Top Secret Message 1")
        self.secret_data_2 = SecretLevelData.objects.create(message="Top Secret Message 2")

    def test_user_permissions_authenticated_with_secret_access(self):
        # Tests for user permissions when in secret group. Should result in True
        client = APIClient()
        refresh = RefreshToken.for_user(self.secret_user)

        url = reverse('user-permissions')

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['has_secret_access'])
        self.assertEqual(response.data['username'], self.secret_user.username)

    def test_user_permissions_no_secret_access(self):
        # Tests for user permissions when not in group. Should result in False
        client = APIClient()
        refresh = RefreshToken.for_user(self.regular_user)

        url = reverse('user-permissions')

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['has_secret_access'])
        self.assertEqual(response.data['username'], self.regular_user.username)

    def test_user_permissions_unauthenticated(self):
        client = APIClient()
        url = reverse('user-permissions')

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_get_secret_message_with_access(self):
        client = APIClient()
        url = reverse('secret-level')
        refresh = RefreshToken.for_user(self.secret_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_get_secret_message_unauthorized_not_in_group(self):
        client = APIClient()
        url = reverse('secret-level')
        refresh = RefreshToken.for_user(self.regular_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_secret_message_unauthenticated(self):
        client =APIClient()
        url = reverse('secret-level')

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_secret_level_view_empty_data(self):
        SecretLevelData.objects.all().delete()

        client = APIClient()
        refresh = RefreshToken.for_user(self.secret_user)

        url = reverse('secret-level')
        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
        self.assertEqual(response.data, [])

    def test_secret_view_after_removed_from_group(self):
        client = APIClient()
        refresh = RefreshToken.for_user(self.secret_user)
        url = reverse('secret-level')
        self.secret_user.groups.remove(self.secret_group)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
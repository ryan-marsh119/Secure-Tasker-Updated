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

        self.supervisor_user = User.objects.create_user(
            username='supevisor_user',
            email='supervisor@test.com',
            password='testpassword123'
        )

        self.secret_group = Group.objects.create(name='Secret')
        self.supervisor_group = Group.objects.create(name='Supervisor')

        self.secret_user.groups.add(self.secret_group)
        self.supervisor_user.groups.add(self.supervisor_group)

        self.secret_data_1 = SecretLevelData.objects.create(message="Top Secret Message 1")
        self.secret_data_2 = SecretLevelData.objects.create(message="Top Secret Message 2")

    # def test_user_permissions_authenticated_with_secret_access(self):
    #     # Tests for user permissions when in secret group. Should result in True
    #     client = APIClient()
    #     refresh = RefreshToken.for_user(self.secret_user)

    #     url = reverse('user-permissions')

    #     response = client.get(
    #         url,
    #         headers={'Authorization': f'Bearer {refresh.access_token}'},
    #         format='json'
    #     )

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertTrue(response.data['has_secret_access'])
    #     self.assertEqual(response.data['username'], self.secret_user.username)

    # def test_user_permissions_no_secret_access(self):
    #     # Tests for user permissions when not in group. Should result in False
    #     client = APIClient()
    #     refresh = RefreshToken.for_user(self.regular_user)

    #     url = reverse('user-permissions')

    #     response = client.get(
    #         url,
    #         headers={'Authorization': f'Bearer {refresh.access_token}'},
    #         format='json'
    #     )

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertFalse(response.data['has_secret_access'])
    #     self.assertEqual(response.data['username'], self.regular_user.username)

    # def test_user_permissions_unauthenticated(self):
    #     client = APIClient()
    #     url = reverse('user-permissions')

    #     response = client.get(
    #         url,
    #         format='json'
    #     )

    #     self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_get_secret_list_with_access(self):
        client = APIClient()
        url = reverse('secret-level')
        refresh = RefreshToken.for_user(self.secret_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_get_secret_list_unauthorized_not_in_group(self):
        client = APIClient()
        url = reverse('secret-level')
        refresh = RefreshToken.for_user(self.regular_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_secret_list_unauthenticated(self):
        client =APIClient()
        url = reverse('secret-level')

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # def test_secret_level_view_empty_data(self):
    #     SecretLevelData.objects.all().delete()

    #     client = APIClient()
    #     refresh = RefreshToken.for_user(self.secret_user)

    #     url = reverse('secret-level')
    #     response = client.get(
    #         url,
    #         headers={'Authorization': f'Bearer {refresh.access_token}'},
    #         format='json'
    #     )

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(len(response.data), 0)
    #     self.assertEqual(response.data, [])

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
        
    def test_supervisor_get_secret_list_with_access(self):
        client = APIClient()
        url = reverse('secret-supervisor-list')
        refresh = RefreshToken.for_user(self.supervisor_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_supervisor_get_secret_list_unauthorized_not_in_group(self):
        client = APIClient()
        url = reverse('secret-supervisor-list')
        refresh = RefreshToken.for_user(self.regular_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supervisor_get_secret_list_unauthenticated(self):
        client =APIClient()
        url = reverse('secret-supervisor-list')

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_supervisor_get_secret_detail_unauthenticated(self):
        client = APIClient()
        url = reverse('secret-supervisor-detail', args=[self.secret_data_1.id])

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_supervisor_get_secret_detail_unauthorized(self):
        client = APIClient()
        url = reverse('secret-supervisor-detail', args=[self.secret_data_1.id])
        refresh = RefreshToken.for_user(self.regular_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supervisor_get_secret_detail_authorized(self):
            client = APIClient()
            url = reverse('secret-supervisor-detail', args=[self.secret_data_1.id])
            refresh = RefreshToken.for_user(self.supervisor_user)

            response = client.get(
                url,
                headers={'Authorization': f'Bearer {refresh.access_token}'},
                format='json'
            )

            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_supervisor_get_secret_detail_not_found(self):
        client = APIClient()
        url = reverse('secret-supervisor-detail', args=[0])
        refresh = RefreshToken.for_user(self.supervisor_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_supervisor_update_secret_detail(self):
        client = APIClient()
        url = reverse('secret-supervisor-detail', args=[self.secret_data_2.id])
        refresh = RefreshToken.for_user(self.supervisor_user)

        data = {
            'message': 'Top secret message 2 had been updated!',
        }

        # Updating task_2 with data.
        input_response = client.put(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            data=data,
            format='json'
        )

        # Verifying task_2 has been updated
        output_response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        # Input should equal output
        self.assertEqual(input_response.data['id'], output_response.data['id'])
        self.assertEqual(input_response.data['message'], output_response.data['message'])

    def test_supervisor_delete_secret_detail(self):
        client = APIClient()
        url = reverse('secret-supervisor-detail', args=[self.secret_data_2.id])
        refresh = RefreshToken.for_user(self.supervisor_user)

        input_response = client.delete(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        output_response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(input_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(output_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_supervisor_post_secret(self):
        # new_data = SecretLevelData.objects.create(message='new message')
        new_data = {'message': 'new message'}
        client = APIClient()
        url = reverse('secret-supervisor-list')
        refresh = RefreshToken.for_user(self.supervisor_user)

        input_response = client.post(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            data=new_data,
            format='json'
        )

        get_url = reverse('secret-supervisor-detail', args=[input_response.data['id']])

        output_response = client.get(
            get_url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(input_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(input_response.data['message'], output_response.data['message'])
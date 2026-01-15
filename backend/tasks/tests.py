from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User, Group, Permission
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Task
from datetime import datetime

class TaskTest(APITestCase):
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
            username='supervisor_user',
            email='supervisor@test.com',
            password='testpassword123'
        )

        self.secret_group = Group.objects.create(name='Secret')
        self.supervisor_group = Group.objects.create(name='Supervisor')

        self.secret_user.groups.add(self.secret_group)
        self.supervisor_user.groups.add(self.supervisor_group)

        self.task_1 = Task.objects.create(
            title='Test task 1',
            description='This is the description for test task 1.'
        )
        self.task_2 = Task.objects.create(
            title='Test task 2',
            description='This is the description for test task 2.'
        )

    def test_user_get_task_list_unauthenticated(self):
        client = APIClient()
        url = reverse('task-list')

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_get_task_list_unauthorized(self):
        client = APIClient()
        url = reverse('task-list')
        refresh = RefreshToken.for_user(self.regular_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_get_task_list_authorized(self):
        client = APIClient()
        url = reverse('task-list')
        refresh = RefreshToken.for_user(self.secret_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_get_task_detail_authorized(self):
        client = APIClient()
        url = reverse('task-detail', args=[self.task_1.id])
        refresh = RefreshToken.for_user(self.secret_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_user_get_task_detail_unauthorized(self):
        client = APIClient()
        url = reverse('task-detail', args=[self.task_1.id])

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_get_task_detail_not_found(self):
        client = APIClient()
        url = reverse('task-detail', args=[0])
        refresh = RefreshToken.for_user(self.secret_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_update_task_detail(self):
        client = APIClient()
        url = reverse('task-detail', args=[self.task_1.id])
        refresh = RefreshToken.for_user(self.secret_user)

        data = {
            'completed': True,
            'date_completed': str(datetime.now()),
            'user_completed': str(self.secret_user.username),
        }

        # Updating task_1 with data.
        input_response = client.put(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            data=data,
            format='json'
        )

        # Verifying task_1 has been updated
        output_response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        # Input should equal output
        self.assertEqual(input_response.data['id'], output_response.data['id'])
        self.assertEqual(input_response.data['title'], output_response.data['title'])
        self.assertEqual(input_response.data['description'], output_response.data['description'])
        self.assertEqual(input_response.data['completed'], output_response.data['completed'])
        self.assertEqual(input_response.data['created_at'], output_response.data['created_at'])
        self.assertEqual(input_response.data['date_completed'], output_response.data['date_completed'])
        self.assertEqual(input_response.data['user_completed'], output_response.data['user_completed'])

    def test_supervisor_get_task_list_unauthenticated(self):
        client = APIClient()
        url = reverse('task-supervisor-list')

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_supervisor_get_task_detail_unauthenticated(self):
        client = APIClient()
        url = reverse('task-supervisor-detail', args=[self.task_1.id])

        response = client.get(
            url,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_supervisor_get_task_list_unauthorized(self):
        client = APIClient()
        url = reverse('task-supervisor-list')
        refresh = RefreshToken.for_user(self.regular_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supervisor_get_task_list_authorized(self):
        client = APIClient()
        url = reverse('task-supervisor-list')
        refresh = RefreshToken.for_user(self.supervisor_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_supervisor_get_task_detail_authorized(self):
        client = APIClient()
        url = reverse('task-supervisor-detail', args=[self.task_1.id])
        refresh = RefreshToken.for_user(self.supervisor_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_supervisor_get_task_detail_not_found(self):
        client = APIClient()
        url = reverse('task-supervisor-detail', args=[0])
        refresh = RefreshToken.for_user(self.supervisor_user)

        response = client.get(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_supervisor_update_task_detail(self):
        client = APIClient()
        url = reverse('task-supervisor-detail', args=[self.task_2.id])
        refresh = RefreshToken.for_user(self.supervisor_user)

        data = {
            'completed': True,
            'date_completed': str(datetime.now()),
            'user_completed': str(self.supervisor_user.username),
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
        self.assertEqual(input_response.data['title'], output_response.data['title'])
        self.assertEqual(input_response.data['description'], output_response.data['description'])
        self.assertEqual(input_response.data['completed'], output_response.data['completed'])
        self.assertEqual(input_response.data['created_at'], output_response.data['created_at'])
        self.assertEqual(input_response.data['date_completed'], output_response.data['date_completed'])
        self.assertEqual(input_response.data['user_completed'], output_response.data['user_completed'])

    def test_supervisor_delete_task_detail(self):
        client = APIClient()
        url = reverse('task-supervisor-detail', args=[self.task_2.id])
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

    def test_supervisor_post_task(self):
        # new_data = SecretLevelData.objects.create(message='new message')
        new_data = {
            'title':'new title',
            'description':'new description',
        }
        client = APIClient()
        url = reverse('task-supervisor-list')
        refresh = RefreshToken.for_user(self.supervisor_user)

        input_response = client.post(
            url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            data=new_data,
            format='json'
        )

        get_url = reverse('task-supervisor-detail', args=[input_response.data['id']])

        output_response = client.get(
            get_url,
            headers={'Authorization': f'Bearer {refresh.access_token}'},
            format='json'
        )

        self.assertEqual(input_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(input_response.data['title'], output_response.data['title'])
        self.assertEqual(input_response.data['description'], output_response.data['description'])
from django.urls import path
from .views import TaskList, TaskDetail, TaskSupervisorList, TaskSupervisorDetail

urlpatterns = [
    path('', TaskList.as_view(), name='task-list'),
    path('<int:pk>/', TaskDetail.as_view(), name='task-detail'),
    path('supervisor/', TaskSupervisorList.as_view(), name='task-supervisor-list'),
    path('supervisor/<int:pk>/', TaskSupervisorDetail.as_view(), name='task-supervisor-detail'),
]
from django.urls import path
from .views import SecretLevelView, UserPermissionsView, SecretSupervisorList, SecretSupervisorDetail

urlpatterns = [
    path('', SecretLevelView.as_view(), name='secret-level'),
    path('user-permissions/', UserPermissionsView.as_view(), name='user-permissions'),
    path('supervisor/', SecretSupervisorList.as_view(), name='secret-supervisor-list'),
    path('supervisor/<int:pk>', SecretSupervisorDetail.as_view(), name='secret-supervisor-detail'),
]
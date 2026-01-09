from django.urls import path
from .views import SecretLevelView, UserPermissionsView

urlpatterns = [
    path('', SecretLevelView.as_view(), name='secret-level'),
    path('user-permissions/', UserPermissionsView.as_view(), name='user-permissions'),
]
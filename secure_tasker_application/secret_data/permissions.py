from rest_framework.permissions import BasePermission

class IsInSecretGroup(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Secret').exists()

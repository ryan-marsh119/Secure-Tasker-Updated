from rest_framework.permissions import BasePermission

# TODO, create patch endpoints for users with Secret permission so they can update if tasks have been completed.
# Update model to account for when task was complete and who completed it.
class IsInSecretGroup(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Secret').exists()


# TODO, add view specifically for endpoints for supervisors. Only supervisors can post secret messages and add tasks
class IsInSupervisorGroup(BasePermission):
    def has_permission(self,request, view):
        return request.user and request.user.groups.filter(name='Supervisor').exists()

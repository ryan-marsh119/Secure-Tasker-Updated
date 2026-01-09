from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsInSecretGroup
from .models import SecretLevelData
from .serializers import SecretLevelDataSerializer

class UserPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'has_secret_access': request.user.groups.filter(name='Secret').exists(),
            'username': request.user.username,
        })

class SecretLevelView(APIView):
    permission_classes = [IsAuthenticated, IsInSecretGroup]

    def get(self, request):
        data = SecretLevelData.objects.all()
        serializer = SecretLevelDataSerializer(data, many=True)
        return Response(serializer.data)


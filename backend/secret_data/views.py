from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .permissions import IsInSecretGroup, IsInSupervisorGroup
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

# TODO implemen full CRUD Capabilities for supervisor
# class SupervisorView(APIView):
    # def post(self, request):
    #     serializer = SecretLevelDataSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)  

    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)     



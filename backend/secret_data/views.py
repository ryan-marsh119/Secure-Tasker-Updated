from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .permissions import IsInSecretGroup, IsInSupervisorGroup
from .models import SecretLevelData
from .serializers import SecretLevelDataSerializer
from django.http import Http404

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

class SecretSupervisorList(APIView):
    permission_classes = [IsAuthenticated, IsInSupervisorGroup]

    def get(self, request, format=None):
        secrets = SecretLevelData.objects.all()
        serializer = SecretLevelDataSerializer(secrets, many=True)
        return Response(serializer.data)        

    def post(self, request, format=None):
        serializer = SecretLevelDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)  

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)     

class SecretSupervisorDetail(APIView):
    permission_classes = [IsAuthenticated, IsInSupervisorGroup]

    def get_object(self, pk):
        try:
            return SecretLevelData.objects.get(id=pk)

        except SecretLevelData.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        secret = self.get_object(pk)
        serializer = SecretLevelDataSerializer(secret)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        secret = self.get_object(pk)
        serializer = SecretLevelDataSerializer(secret, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        secret = self.get_object(pk)
        secret.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
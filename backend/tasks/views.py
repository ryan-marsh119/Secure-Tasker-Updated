from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import TaskSerializer
from .models import Task
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework import status
from cryptography.fernet import InvalidToken
from secret_data.permissions import IsInSecretGroup
        
class TaskList(ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsInSecretGroup]

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)

            for item in serializer.data:
                description = item.get('description', '')
                #Strings starting with 'gAAAAA' from Fernet are still encrypted, meaning decryption failed.
                if description and description.startswith('gAAAAA'):
                    raise InvalidToken("Failed to decrypt task data")
            return Response(serializer.data)

        except InvalidToken:
            return Response(
                {"detail": "Failed to decrypt task data."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )    
    
class TaskDetail(RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsInSecretGroup]

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            description = serializer.data.get('description', '')
            #Strings starting with 'gAAAAA' from Fernet are still encrypted, meaning decryption failed.
            if description and description.startswith('gAAAAA'):
                raise InvalidToken("Failed to decrypt task data")
            return Response(serializer.data)

        except InvalidToken:
            return Response(
                {"detail": "Failed to decrypt task data."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )          

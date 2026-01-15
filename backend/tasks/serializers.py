from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'completed', 'created_at', 'date_completed', 'user_completed']  # Explicit fields
        read_only_fields = ['id', 'created_at']  # Auto fields

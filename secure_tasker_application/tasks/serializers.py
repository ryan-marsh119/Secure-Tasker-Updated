from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True)
    description = serializers.CharField(required=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'completed', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_title(self, value):
        if not value:
            raise serializers.ValidationError("Title is required.")

        return value

    def validate_description(self, value):
        if len(value) < 500:
            raise serializers.ValidationError("Description must be at least 500 characters long.")

        return value
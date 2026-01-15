from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=None)
    completed = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)
    date_completed = serializers.DateTimeField(required=False, allow_null=True)
    user_completed = serializers.CharField(max_length=200, allow_blank=True, default='')

    def create(self, validated_data):
        return Task.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.id = validated_data.get('id', instance.id)
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.completed = validated_data.get('completed', instance.completed)
        instance.created_at = validated_data.get('created_at', instance.created_at)
        instance.date_completed = validated_data.get('date_completed', instance.date_completed)
        instance.user_completed = validated_data.get('user_completed', instance.user_completed)        
        instance.save()
        return instance
# class TaskSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Task
#         fields = ['id', 'title', 'description', 'completed', 'created_at']
#         read_only_fields = ['id', 'created_at']

#     def validate_description(self, value):
#         if len(value) < 10:
#             raise serializers.ValidationError("Description us be at least 10 characters long.")
#         return value

# class TaskCompleteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Task
#         fields = [
#             'id',
#             'title',
#             'description',
#             'completed',
#             'created_at',
#             'completed',
#             'date_completed',
#             'user_completed'
#         ]


    # def validate_title(self, value):
    #     if not value:
    #         raise serializers.ValidationError("Title is required.")

    #     return value

    # def validate_description(self, value):
    #     if len(value) < 500:
    #         raise serializers.ValidationError("Description must be at least 500 characters long.")

    #     return value
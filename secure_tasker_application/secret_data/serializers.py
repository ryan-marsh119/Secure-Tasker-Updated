from rest_framework import serializers
from .models import SecretLevelData

class SecretLevelDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecretLevelData
        fields = ['id', 'message']


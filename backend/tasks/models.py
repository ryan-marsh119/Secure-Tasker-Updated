from django.db import models
from encrypted_model_fields.fields import EncryptedCharField

# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=200)
    description = EncryptedCharField(max_length=500)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Title: {self.title} \nDescription: {self.description}"
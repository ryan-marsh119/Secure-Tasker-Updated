from django.db import models
from encrypted_model_fields.fields import EncryptedTextField

# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=200)
    description = EncryptedTextField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(blank=True, default=None, null=True)
    user_completed = models.CharField(max_length=200, blank=True, default='', null=True)

    def __str__(self):
        return f"Title: {self.title} \nDescription: {self.description}"
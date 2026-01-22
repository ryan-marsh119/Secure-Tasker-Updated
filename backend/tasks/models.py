from django.db import models
from encrypted_model_fields.fields import EncryptedTextField
from django.contrib.auth.models import User
# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=200)
    description = EncryptedTextField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(blank=True, null=True)
    user_completed = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, db_column='user_completed')

    def __str__(self):
        return f"Title: {self.title} \nDescription: {self.description}"

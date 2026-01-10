from django.db import models

# Create your models here.
class SecretLevelData(models.Model):
    message = models.TextField()


    class Meta:
        verbose_name_plural = "Secret Level Data"

        permissions = [
            ("view_secret_level_data", "Can view secret level data."),
        ]
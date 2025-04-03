from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=100, null=True, blank=True)
    completed = models.BooleanField(default=False)
    # Add other fields as needed
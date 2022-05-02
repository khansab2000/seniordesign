from django.db import models

class React(models.Model):
    query = models.CharField(max_length=30)
    url = models.CharField(max_length=1000)
    gender = models.CharField(max_length=10)
    race = models.CharField(max_length=1000)
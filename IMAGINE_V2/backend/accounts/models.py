from django.contrib.auth.models import AbstractUser
from django.db import models
class User(AbstractUser):
    class Role(models.TextChoices):
        TOURIST='TOURIST','Tourist'; GUIDE='GUIDE','Guide'; ADMIN='ADMIN','Admin'
    username=None
    email=models.EmailField(unique=True)
    name=models.CharField(max_length=100)
    role=models.CharField(max_length=10,choices=Role.choices,default=Role.TOURIST)
    USERNAME_FIELD='email'; REQUIRED_FIELDS=[]

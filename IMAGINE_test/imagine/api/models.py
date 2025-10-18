from django.db import models
from django.contrib.auth.models import User

class Place(models.Model):
    name = models.CharField(max_length=200)
    region = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=300, help_text="Relative path to image in frontend folder")

    def __str__(self):
        return self.name

class Guide(models.Model):
    name = models.CharField(max_length=200)
    region = models.CharField(max_length=100)
    languages = models.JSONField(default=list)
    rating = models.FloatField(default=0.0)
    reviews = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    image = models.CharField(max_length=300, help_text="Relative path to image in frontend folder")

    def __str__(self):
        return self.name

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    guide = models.ForeignKey(Guide, on_delete=models.CASCADE)
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    guide = models.ForeignKey(Guide, on_delete=models.SET_NULL, null=True, blank=True)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"

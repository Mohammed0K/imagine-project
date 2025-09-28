from django.db import models
from bookings.models import Booking
class Review(models.Model):
    booking=models.OneToOneField(Booking,on_delete=models.CASCADE)
    rating=models.PositiveSmallIntegerField(); comment=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)

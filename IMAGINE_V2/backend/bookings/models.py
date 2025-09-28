from django.db import models
from accounts.models import User
from places.models import TourismPlace
class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING='PENDING'; ACCEPTED='ACCEPTED'; REJECTED='REJECTED'; CANCELLED='CANCELLED'; DONE='DONE'
    tourist=models.ForeignKey(User,on_delete=models.CASCADE,related_name='tourist_bookings')
    guide=models.ForeignKey(User,on_delete=models.CASCADE,related_name='guide_bookings')
    place=models.ForeignKey(TourismPlace,on_delete=models.SET_NULL,null=True,blank=True)
    start_datetime=models.DateTimeField(); duration_minutes=models.IntegerField(default=120)
    meetup_location=models.CharField(max_length=255)
    status=models.CharField(max_length=10,choices=Status.choices,default=Status.PENDING)

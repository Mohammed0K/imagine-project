from rest_framework import serializers
from .models import Booking
class BookingSerializer(serializers.ModelSerializer):
    class Meta: model=Booking; fields=['id','tourist','guide','place','start_datetime','duration_minutes','meetup_location','status']

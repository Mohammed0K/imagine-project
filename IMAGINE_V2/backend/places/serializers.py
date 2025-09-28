from rest_framework import serializers
from .models import TourismPlace
class PlaceSerializer(serializers.ModelSerializer):
    class Meta: model=TourismPlace; fields=['id','name','region','description','images','lat','lng']

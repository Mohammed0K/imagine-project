from rest_framework import serializers
from .models import GuideProfile
class GuideSerializer(serializers.ModelSerializer):
    name=serializers.CharField(source='user.name',read_only=True)
    class Meta: model=GuideProfile; fields=['id','name','region','languages','bio','rating_avg','is_approved']

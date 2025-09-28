from django.db import models
from accounts.models import User
class GuideProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name='guide_profile')
    bio=models.TextField(blank=True); region=models.CharField(max_length=100,blank=True)
    languages=models.CharField(max_length=200,blank=True); rating_avg=models.DecimalField(max_digits=3,decimal_places=2,default=0)
    is_approved=models.BooleanField(default=False)

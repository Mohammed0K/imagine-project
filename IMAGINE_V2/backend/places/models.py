from django.db import models
class TourismPlace(models.Model):
    name=models.CharField(max_length=150); region=models.CharField(max_length=100)
    description=models.TextField(blank=True); images=models.JSONField(default=list,blank=True)
    lat=models.DecimalField(max_digits=10,decimal_places=7,null=True,blank=True)
    lng=models.DecimalField(max_digits=10,decimal_places=7,null=True,blank=True)

from rest_framework import viewsets,permissions
from .models import TourismPlace
from .serializers import PlaceSerializer
class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=TourismPlace.objects.all().order_by('name')
    serializer_class=PlaceSerializer; permission_classes=[permissions.AllowAny]

from rest_framework import viewsets,permissions
from .models import GuideProfile
from .serializers import GuideSerializer
class GuideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=GuideProfile.objects.filter(is_approved=True)
    serializer_class=GuideSerializer; permission_classes=[permissions.AllowAny]

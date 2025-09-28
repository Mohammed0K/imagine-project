from rest_framework import generics,permissions
from django.contrib.auth.hashers import make_password
from .models import User
from .serializers import UserSerializer
class RegisterView(generics.CreateAPIView):
    queryset=User.objects.all(); serializer_class=UserSerializer; permission_classes=[permissions.AllowAny]
    def perform_create(self, serializer): serializer.save(password=make_password(self.request.data.get('password')))

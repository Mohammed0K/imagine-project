from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Place, Guide, Booking, Review, ContactMessage
from .serializers import (
    PlaceSerializer, GuideSerializer, BookingSerializer,
    ReviewSerializer, ContactMessageSerializer, RegisterSerializer
)

class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all().order_by("name")
    serializer_class = PlaceSerializer

class GuideViewSet(viewsets.ModelViewSet):
    queryset = Guide.objects.all().order_by("name")
    serializer_class = GuideSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related("user", "guide", "place").all().order_by("-created_at")
    serializer_class = BookingSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("user", "guide", "place").all().order_by("-created_at")
    serializer_class = ReviewSerializer

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer

class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def login(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=400)
        return Response({"username": user.username, "email": user.email})

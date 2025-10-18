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
        email = (request.data.get("email") or "").strip()
        password = request.data.get("password") or ""
        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=400)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({"detail": "Invalid email or password."}, status=400)

        auth_user = authenticate(username=user.username, password=password)
        if not auth_user:
            return Response({"detail": "Invalid email or password."}, status=400)

        return Response({"username": auth_user.username, "email": auth_user.email}, status=200)

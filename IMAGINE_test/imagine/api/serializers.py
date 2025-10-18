from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Place, Guide, Booking, Review, ContactMessage

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["id", "name", "region", "description", "image"]

class GuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide
        fields = ["id", "name", "region", "languages", "rating", "reviews", "bio", "image"]

class BookingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    guide_name = serializers.CharField(source="guide.name", read_only=True)
    place_name = serializers.CharField(source="place.name", read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "user", "user_name", "guide", "guide_name", "place", "place_name", "date", "created_at"]

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = Review
        fields = ["id", "user", "guide", "place", "rating", "comment", "created_at"]

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "message", "created_at"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User(username=validated_data["username"], email=validated_data.get("email", ""))
        user.set_password(validated_data["password"])
        user.save()
        return user

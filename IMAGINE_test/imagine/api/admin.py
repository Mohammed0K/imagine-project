from django.contrib import admin
from .models import Place, Guide, Booking, Review, ContactMessage

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "region")

@admin.register(Guide)
class GuideAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "rating", "reviews")

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("user", "guide", "place", "date", "created_at")

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "rating", "guide", "place", "created_at")

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "created_at")

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaceViewSet, GuideViewSet, BookingViewSet, ReviewViewSet, ContactMessageViewSet, AuthViewSet

router = DefaultRouter()
router.register(r"places", PlaceViewSet, basename="places")
router.register(r"guides", GuideViewSet, basename="guides")
router.register(r"bookings", BookingViewSet, basename="bookings")
router.register(r"reviews", ReviewViewSet, basename="reviews")
router.register(r"contact", ContactMessageViewSet, basename="contact")
router.register(r"auth", AuthViewSet, basename="auth")

urlpatterns = [
    path("", include(router.urls)),
]

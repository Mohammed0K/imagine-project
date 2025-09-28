from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
urlpatterns=[path('admin/',admin.site.urls),path('api/auth/token',TokenObtainPairView.as_view()),path('api/auth/refresh',TokenRefreshView.as_view()),path('api/',include('guides.urls')),path('api/',include('places.urls')),path('api/',include('bookings.urls')),path('api/',include('reviews.urls')),path('api/',include('accounts.urls'))]

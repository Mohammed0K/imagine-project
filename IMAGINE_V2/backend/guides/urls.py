from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import GuideViewSet
router=DefaultRouter(); router.register('guides',GuideViewSet,basename='guide')
urlpatterns=[path('',include(router.urls))]

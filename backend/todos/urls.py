# File: backend/todos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, register ,current_user_view

router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')

urlpatterns = [
    
    path('auth/register/', register,name='register'),
    path('user/me/', current_user_view,name='current-user'),
    path('', include(router.urls)),
]


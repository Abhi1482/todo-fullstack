from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse 
def health_check(request):
    return HttpResponse("OK", status=200)

urlpatterns = [
path('', health_check),
path('admin/', admin.site.urls),
path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
path('api/', include('todos.urls')),
]
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

def home_view(request):
    return HttpResponse("Welcome to LineMart API")

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),  # Role-based authentication
    path('api/member/', include('member.urls')),
    path('api/cashier/', include('cashierdashboard.urls')),
    path('api/manager/', include('managerdashboard.urls')),
    path('api/customer/', include('customerdashboard.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
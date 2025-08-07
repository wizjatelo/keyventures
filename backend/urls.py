from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('member.urls')),
    path('api/cashier/', include('cashierdashboard.urls')),
    path('api/manager/', include('managerdashboard.urls')),
    path('api/customer/', include('customerdashboard.urls')),
]

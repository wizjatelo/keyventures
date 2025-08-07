from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ManagerDashboardViewSet, ManagerUserViewSet, ManagerProductViewSet,
    ManagerStoreViewSet, ManagerReportViewSet
)

router = DefaultRouter()
router.register(r'dashboard', ManagerDashboardViewSet, basename='manager-dashboard')
router.register(r'users', ManagerUserViewSet, basename='manager-users')
router.register(r'products', ManagerProductViewSet, basename='manager-products')
router.register(r'stores', ManagerStoreViewSet, basename='manager-stores')
router.register(r'reports', ManagerReportViewSet, basename='manager-reports')

urlpatterns = [
    path('', include(router.urls)),
]
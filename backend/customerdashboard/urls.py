from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerCategoryViewSet, CustomerSubCategoryViewSet, CustomerProductViewSet,
    CustomerAdvertisementViewSet, CustomerProfileViewSet, CustomerOrderViewSet,
    CustomerSearchViewSet, CustomerNotificationViewSet, CustomerStoreViewSet,
    CustomerPaymentViewSet, CustomerDeliveryViewSet
)

router = DefaultRouter()
router.register(r'categories', CustomerCategoryViewSet)
router.register(r'subcategories', CustomerSubCategoryViewSet)
router.register(r'products', CustomerProductViewSet)
router.register(r'advertisements', CustomerAdvertisementViewSet)
router.register(r'profile', CustomerProfileViewSet, basename='customer-profile')
router.register(r'orders', CustomerOrderViewSet, basename='customer-orders')
router.register(r'search', CustomerSearchViewSet, basename='customer-search')
router.register(r'notifications', CustomerNotificationViewSet, basename='customer-notifications')
router.register(r'stores', CustomerStoreViewSet)
router.register(r'payments', CustomerPaymentViewSet, basename='customer-payments')
router.register(r'deliveries', CustomerDeliveryViewSet, basename='customer-deliveries')

urlpatterns = [
    path('', include(router.urls)),
]
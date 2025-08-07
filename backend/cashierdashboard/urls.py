from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StoreViewSet, ProductViewSet, ProductVariantViewSet,
    CustomerViewSet, TransactionViewSet, TransactionItemViewSet,
    ReturnViewSet, OfflineTransactionViewSet, HardwareDeviceViewSet,
    CashierDashboardStatsViewSet, CategoryViewSet, SubCategoryViewSet,
    AdvertisementViewSet, ManagerDashboardViewSet, RealTimeDataViewSet,
    PaymentViewSet, DeliveryRouteViewSet, DeliveryViewSet, DeliveryUpdateViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'stores', StoreViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'subcategories', SubCategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product-variants', ProductVariantViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'transaction-items', TransactionItemViewSet)
router.register(r'returns', ReturnViewSet)
router.register(r'offline-transactions', OfflineTransactionViewSet)
router.register(r'hardware-devices', HardwareDeviceViewSet)
router.register(r'dashboard-stats', CashierDashboardStatsViewSet, basename='dashboard-stats')
router.register(r'advertisements', AdvertisementViewSet)
router.register(r'manager-dashboard', ManagerDashboardViewSet, basename='manager-dashboard')
router.register(r'realtime-data', RealTimeDataViewSet, basename='realtime-data')
router.register(r'payments', PaymentViewSet)
router.register(r'delivery-routes', DeliveryRouteViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'delivery-updates', DeliveryUpdateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]


from rest_framework import serializers
from .models import (
    Store, Product, ProductVariant, Customer, Transaction, TransactionItem, Return, 
    OfflineTransaction, HardwareDevice, Category, SubCategory, Advertisement,
    Payment, DeliveryRoute, Delivery, DeliveryUpdate
)
from member.models import CustomUser

# Note: UserSerializer moved to member.serializers as CustomUserSerializer

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ['id', 'name', 'location', 'timezone', 'tax_rate', 'currency', 'status']

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent_id', 'subcategories']

    def get_subcategories(self, obj):
        children = Category.objects.filter(parent_id=obj.id)
        return CategorySerializer(children, many=True).data

class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'category', 'category_name', 'display_order']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'barcode', 'category', 'category_name', 'subcategory', 'subcategory_name', 
                 'description', 'price', 'base_price', 'cost_price', 'stock', 'stock_quantity', 'min_stock_level', 
                 'image', 'is_active']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'product_id', 'name', 'sku', 'price_modifier', 'stock_quantity', 'attributes']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'phone', 'email', 'name', 'loyalty_points', 'tier', 'total_spent', 'last_visit']

class TransactionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionItem
        fields = ['id', 'transaction_id', 'product_id', 'variant_id', 'quantity', 'unit_price', 'discount', 'total']

class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, read_only=True)
    class Meta:
        model = Transaction
        fields = ['id', 'receipt_number', 'cashier', 'customer', 'subtotal', 'tax_amount', 'total', 'payment_method', 'status', 'timestamp', 'is_offline', 'items']

class ReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Return
        fields = ['id', 'original_transaction', 'reason', 'refund_amount', 'restock_fee', 'status', 'processed_by']

class OfflineTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflineTransaction
        fields = ['id', 'device_id', 'transaction_data', 'timestamp', 'sync_status', 'conflict_resolution', 'store', 'cashier']

class HardwareDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HardwareDevice
        fields = ['id', 'store_id', 'device_type', 'mac_address', 'ip_address', 'status', 'last_ping']

class AdvertisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = ['id', 'title', 'description', 'image', 'link_url', 'is_active', 'display_order', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    transaction_receipt = serializers.CharField(source='transaction.receipt_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.username', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction', 'transaction_receipt', 'payment_method', 'amount', 
            'status', 'reference_number', 'gateway_response', 'processed_at', 
            'created_at', 'updated_at', 'processed_by', 'processed_by_name'
        ]
        read_only_fields = ['reference_number', 'created_at', 'updated_at']

class DeliveryRouteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = DeliveryRoute
        fields = [
            'id', 'name', 'description', 'areas_covered', 'estimated_delivery_time',
            'delivery_fee', 'is_active', 'created_at', 'created_by', 'created_by_name'
        ]

class DeliveryUpdateSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = DeliveryUpdate
        fields = [
            'id', 'delivery', 'status', 'location', 'notes', 
            'timestamp', 'updated_by', 'updated_by_name'
        ]

class DeliverySerializer(serializers.ModelSerializer):
    transaction_receipt = serializers.CharField(source='transaction.receipt_number', read_only=True)
    route_name = serializers.CharField(source='route.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    updates = DeliveryUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'transaction', 'transaction_receipt', 'route', 'route_name',
            'delivery_address', 'customer_phone', 'customer_name', 'status',
            'tracking_number', 'estimated_delivery_time', 'actual_delivery_time',
            'delivery_fee', 'delivery_notes', 'created_at', 'updated_at',
            'assigned_to', 'assigned_to_name', 'updated_by', 'updated_by_name', 'updates'
        ]
        read_only_fields = ['tracking_number', 'created_at', 'updated_at']
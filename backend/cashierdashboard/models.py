from django.conf import settings
from django.db import models

# Use the unified CustomUser from member app
# Remove duplicate User model - use settings.AUTH_USER_MODEL instead

class Store(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    timezone = models.CharField(max_length=50, default='UTC')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, default='active')

    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='stores')
    products = models.ManyToManyField('Product', related_name='stores')
    transactions = models.ManyToManyField('Transaction', related_name='stores')
    hardware_devices = models.ManyToManyField('HardwareDevice', related_name='stores')

    def __str__(self):
        return self.name

class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey('Category', on_delete=models.CASCADE, related_name='subcategories')
    display_order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.category.name} - {self.name}"

    class Meta:
        verbose_name_plural = "Subcategories"

class Product(models.Model):
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=50, unique=True, null=True, blank=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    subcategory = models.ForeignKey('SubCategory', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock = models.IntegerField(default=0)
    stock_quantity = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock_quantity = models.IntegerField(default=0)
    attributes = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.product.name} - {self.name}"

class Category(models.Model):
    name = models.CharField(max_length=100)
    parent_id = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    hierarchy_path = models.CharField(max_length=255, null=True, blank=True)
    display_order = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Customer(models.Model):
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    loyalty_points = models.IntegerField(default=0)
    tier = models.CharField(max_length=20, default='basic')
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_visit = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    receipt_number = models.CharField(max_length=20, unique=True)
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='cashier_transactions')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_transactions')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_offline = models.BooleanField(default=False)

    def __str__(self):
        return self.receipt_number

class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.transaction.receipt_number} - {self.product.name}"

class Return(models.Model):
    original_transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='returns')
    reason = models.CharField(max_length=100)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    restock_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='pending')
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Return for {self.original_transaction.receipt_number}"

class OfflineTransaction(models.Model):
    device_id = models.CharField(max_length=50)
    transaction_data = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    sync_status = models.CharField(max_length=20, default='pending')
    conflict_resolution = models.JSONField(null=True, blank=True)

    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Offline Tx - {self.device_id}"

class HardwareDevice(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    device_type = models.CharField(max_length=50)
    mac_address = models.CharField(max_length=17, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    status = models.CharField(max_length=20, default='active')
    last_ping = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.device_type} - {self.mac_address}"

class Advertisement(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='advertisements/', null=True, blank=True)
    link_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.title

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('mobile_money', 'Mobile Money'),
        ('bank_transfer', 'Bank Transfer'),
        ('digital_wallet', 'Digital Wallet'),
    ]
    
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    reference_number = models.CharField(max_length=100, unique=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Payment {self.reference_number} - {self.status}"

class DeliveryRoute(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    areas_covered = models.JSONField(default=list)  # List of area names
    estimated_delivery_time = models.CharField(max_length=50)  # e.g., "2-3 hours", "Same day"
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.name

class Delivery(models.Model):
    DELIVERY_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed Delivery'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    ]
    
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='delivery')
    route = models.ForeignKey(DeliveryRoute, on_delete=models.SET_NULL, null=True, blank=True)
    delivery_address = models.TextField()
    customer_phone = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default='pending')
    tracking_number = models.CharField(max_length=50, unique=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    delivery_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_deliveries')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='delivery_updates')
    
    def __str__(self):
        return f"Delivery {self.tracking_number} - {self.status}"

class DeliveryUpdate(models.Model):
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='updates')
    status = models.CharField(max_length=20, choices=Delivery.DELIVERY_STATUS_CHOICES)
    location = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.delivery.tracking_number} - {self.status} at {self.timestamp}"
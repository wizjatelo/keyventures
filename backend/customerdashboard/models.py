from django.db import models
from django.conf import settings
from django.utils import timezone

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.CharField(max_length=255)  # URL to image
    category = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.0)
    stock = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order_date = models.DateTimeField(default=timezone.now)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tracking_info = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    shipping_address = models.TextField()
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of purchase
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class UserProfile(models.Model):
    LOYALTY_TIER_CHOICES = (
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    avatar = models.CharField(max_length=255, blank=True, null=True)  # URL to avatar
    loyalty_points = models.IntegerField(default=0)
    loyalty_tier = models.CharField(max_length=10, choices=LOYALTY_TIER_CHOICES, default='bronze')
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_visit = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class PaymentMethod(models.Model):
    TYPE_CHOICES = (
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_methods')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_default = models.BooleanField(default=False)
    last_four = models.CharField(max_length=4, blank=True, null=True)  # Last 4 digits for cards
    expiry_date = models.CharField(max_length=7, blank=True, null=True)  # Format: MM/YYYY
    
    def __str__(self):
        return f"{self.user.username}'s {self.get_type_display()}"

class Notification(models.Model):
    TYPE_CHOICES = (
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username}'s notification: {self.message[:20]}..."

class Deal(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    discount = models.IntegerField()  # Percentage discount
    image = models.CharField(max_length=255)  # URL to image
    expires = models.DateTimeField()
    category = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class PromoBanner(models.Model):
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=255)
    image = models.CharField(max_length=255)  # URL to image
    link = models.CharField(max_length=255)
    background_color = models.CharField(max_length=7, default="#FFFFFF")  # Hex color code
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

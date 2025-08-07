from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.db import models
from django.utils import timezone
import uuid

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('CUSTOMER', 'Customer'),
        ('CASHIER', 'Cashier'),
        ('MANAGER', 'Manager'),
    )
    
    # Core user fields as per specification
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CUSTOMER')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    # Authentication fields
    is_approved = models.BooleanField(default=True)
    cashier_secret_key = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    
    # Customer-specific fields
    loyalty_points = models.IntegerField(default=0)
    loyalty_tier = models.CharField(max_length=20, default='basic')
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_visit = models.DateTimeField(null=True, blank=True)
    
    # Store assignment for cashiers/managers
    store_id = models.IntegerField(null=True, blank=True)
    
    # Session management
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Generate secret key for cashiers
        if self.role == 'CASHIER' and not self.cashier_secret_key:
            self.cashier_secret_key = uuid.uuid4().hex
        
        # Hash password with bcrypt if it's being set
        if self.password and not self.password.startswith('bcrypt'):
            self.password = make_password(self.password)
            
        super().save(*args, **kwargs)

    def has_permission(self, permission):
        """Check if user has specific permission based on role"""
        role_permissions = {
            'CUSTOMER': [
                'view_products', 'add_to_cart', 'update_profile'
            ],
            'CASHIER': [
                'view_orders', 'update_order_status', 'process_payment', 
                'view_product_stock'
            ],
            'MANAGER': [
                'manage_users', 'view_all_orders', 'manage_products', 
                'update_inventory', 'generate_reports'
            ]
        }
        return permission in role_permissions.get(self.role, [])
    
    def is_account_locked(self):
        """Check if account is locked due to failed login attempts"""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False
    
    def lock_account(self, minutes=15):
        """Lock account for specified minutes"""
        self.locked_until = timezone.now() + timezone.timedelta(minutes=minutes)
        self.save()
    
    def unlock_account(self):
        """Unlock account and reset failed attempts"""
        self.locked_until = None
        self.failed_login_attempts = 0
        self.save()

    def __str__(self):
        return f"{self.username} ({self.role})"

    class Meta:
        db_table = 'auth_user_custom'

from rest_framework.permissions import BasePermission
from django.utils import timezone

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'MANAGER'

class IsCashier(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CASHIER'

class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CLIENT'

class IsCustomer(BasePermission):
    """Permission for customer role"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CUSTOMER'

class HasPermission(BasePermission):
    """Custom permission class that checks specific permissions"""
    required_permission = None
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if account is locked
        if hasattr(request.user, 'is_account_locked') and request.user.is_account_locked():
            return False
        
        # Check if user has the required permission
        if self.required_permission:
            return request.user.has_permission(self.required_permission)
        
        return True

class CanViewProducts(HasPermission):
    required_permission = 'view_products'

class CanAddToCart(HasPermission):
    required_permission = 'add_to_cart'

class CanUpdateProfile(HasPermission):
    required_permission = 'update_profile'

class CanViewOrders(HasPermission):
    required_permission = 'view_orders'

class CanUpdateOrderStatus(HasPermission):
    required_permission = 'update_order_status'

class CanProcessPayment(HasPermission):
    required_permission = 'process_payment'

class CanViewProductStock(HasPermission):
    required_permission = 'view_product_stock'

class CanManageUsers(HasPermission):
    required_permission = 'manage_users'

class CanViewAllOrders(HasPermission):
    required_permission = 'view_all_orders'

class CanManageProducts(HasPermission):
    required_permission = 'manage_products'

class CanUpdateInventory(HasPermission):
    required_permission = 'update_inventory'

class CanGenerateReports(HasPermission):
    required_permission = 'generate_reports'

class IsCustomerOrReadOnly(BasePermission):
    """
    Custom permission for customer endpoints:
    - Allows customers to access without login for viewing products
    - Restricts certain actions for non-authenticated users
    """
    def has_permission(self, request, view):
        # Allow read-only access for unauthenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # For write operations, require authentication and customer role
        if request.user.is_authenticated:
            return request.user.role == 'CUSTOMER'
        
        return False

class AccessControlPermission(BasePermission):
    """
    Advanced access control based on path and role
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            # Allow access to customer endpoints for viewing products
            if request.path.startswith('/api/customer/') and request.method in ['GET', 'HEAD', 'OPTIONS']:
                return True
            return False
        
        user_role = request.user.role
        path = request.path
        
        # Access control rules as per specification
        if path.startswith('/api/customer/'):
            # Customer endpoints - allow customers, restrict certain actions
            if user_role == 'CUSTOMER':
                # Restrict order viewing and payment for unauthenticated
                restricted_paths = ['/api/customer/orders/', '/api/customer/payments/']
                if any(restricted in path for restricted in restricted_paths):
                    return request.user.is_authenticated
                return True
            return False
        
        elif path.startswith('/api/cashier/'):
            return user_role == 'CASHIER'
        
        elif path.startswith('/api/manager/'):
            return user_role == 'MANAGER'
        
        elif path.startswith('/api/common/'):
            return user_role in ['CUSTOMER', 'CASHIER', 'MANAGER']
        
        return True

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count, Avg, F
from django.utils import timezone
from datetime import datetime, timedelta

# Import shared models from cashierdashboard
from cashierdashboard.models import (
    Store, Category, SubCategory, Product, Advertisement, 
    Customer, Transaction, TransactionItem, Return
)
from .models import Manager, ApprovalRequest, AuditLog, ReportConfig
from cashierdashboard.serializers import (
    StoreSerializer, CategorySerializer, SubCategorySerializer, ProductSerializer, 
    AdvertisementSerializer, CustomerSerializer, TransactionSerializer, ReturnSerializer
)
from member.models import CustomUser
from member.serializers import CustomUserSerializer, StaffUserSerializer

class ManagerPermissionMixin:
    """Mixin to ensure only managers can access these views"""
    
    def check_manager_permission(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if request.user.role not in ['manager', 'admin']:
            return Response({'error': 'Manager access required'}, status=status.HTTP_403_FORBIDDEN)
        
        return None

class ManagerDashboardViewSet(viewsets.ViewSet, ManagerPermissionMixin):
    """Manager dashboard with comprehensive analytics"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get dashboard overview"""
        permission_error = self.check_manager_permission(request)
        if permission_error:
            return permission_error
        
        # Get store-specific data if manager has store_id
        store_filter = {}
        if request.user.store_id:
            store_filter['store_id'] = request.user.store_id
        
        # Basic metrics
        total_products = Product.objects.filter(**store_filter).count()
        active_products = Product.objects.filter(is_active=True, **store_filter).count()
        low_stock_products = Product.objects.filter(stock__lte=F('min_stock_level'), **store_filter).count()
        
        # Sales metrics (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_transactions = Transaction.objects.filter(
            timestamp__gte=thirty_days_ago,
            **store_filter
        )
        
        total_sales = recent_transactions.aggregate(total=Sum('total'))['total'] or 0
        total_orders = recent_transactions.count()
        avg_order_value = recent_transactions.aggregate(avg=Avg('total'))['avg'] or 0
        
        # Customer metrics
        total_customers = Customer.objects.count()
        new_customers = CustomUser.objects.filter(
            role='customer',
            date_joined__gte=thirty_days_ago
        ).count()
        
        return Response({
            'overview': {
                'total_products': total_products,
                'active_products': active_products,
                'low_stock_products': low_stock_products,
                'total_sales': float(total_sales),
                'total_orders': total_orders,
                'avg_order_value': float(avg_order_value),
                'total_customers': total_customers,
                'new_customers': new_customers
            }
        })
    
    @action(detail=False, methods=['get'])
    def sales_analytics(self, request):
        """Get detailed sales analytics"""
        permission_error = self.check_manager_permission(request)
        if permission_error:
            return permission_error
        
        period = request.query_params.get('period', 'week')  # week, month, year
        
        # Calculate date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=7)
        
        # Get transactions in period
        store_filter = {}
        if request.user.store_id:
            store_filter['store_id'] = request.user.store_id
            
        transactions = Transaction.objects.filter(
            timestamp__gte=start_date,
            **store_filter
        )
        
        # Daily sales data
        daily_sales = []
        for i in range((now.date() - start_date.date()).days + 1):
            day = start_date.date() + timedelta(days=i)
            day_transactions = transactions.filter(timestamp__date=day)
            daily_sales.append({
                'date': day.isoformat(),
                'sales': float(day_transactions.aggregate(total=Sum('total'))['total'] or 0),
                'orders': day_transactions.count()
            })
        
        # Top products
        top_products = TransactionItem.objects.filter(
            transaction__timestamp__gte=start_date,
            **({'transaction__' + k: v for k, v in store_filter.items()} if store_filter else {})
        ).values('product__name').annotate(
            total_sold=Sum('quantity'),
            revenue=Sum('total')
        ).order_by('-revenue')[:10]
        
        return Response({
            'period': period,
            'daily_sales': daily_sales,
            'top_products': list(top_products),
            'total_revenue': float(transactions.aggregate(total=Sum('total'))['total'] or 0),
            'total_orders': transactions.count()
        })
    
    @action(detail=False, methods=['get'])
    def inventory_status(self, request):
        """Get inventory status and alerts"""
        permission_error = self.check_manager_permission(request)
        if permission_error:
            return permission_error
        
        store_filter = {}
        if request.user.store_id:
            store_filter['store_id'] = request.user.store_id
        
        # Low stock alerts
        low_stock = Product.objects.filter(
            stock__lte=F('min_stock_level'),
            is_active=True,
            **store_filter
        ).values('name', 'stock', 'min_stock_level', 'category__name')
        
        # Out of stock
        out_of_stock = Product.objects.filter(
            stock=0,
            is_active=True,
            **store_filter
        ).values('name', 'category__name')
        
        # Inventory value
        total_inventory_value = Product.objects.filter(
            is_active=True,
            **store_filter
        ).aggregate(
            total_value=Sum(F('stock') * F('cost_price'))
        )['total_value'] or 0
        
        return Response({
            'low_stock_alerts': list(low_stock),
            'out_of_stock': list(out_of_stock),
            'total_inventory_value': float(total_inventory_value),
            'low_stock_count': low_stock.count(),
            'out_of_stock_count': out_of_stock.count()
        })

class ManagerUserViewSet(viewsets.ModelViewSet, ManagerPermissionMixin):
    """Manager user management"""
    queryset = CustomUser.objects.all()
    serializer_class = StaffUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        permission_error = self.check_manager_permission(self.request)
        if permission_error:
            return CustomUser.objects.none()
        
        # Managers can see users in their store
        if self.request.user.store_id:
            return CustomUser.objects.filter(store_id=self.request.user.store_id)
        else:
            # Admin managers can see all users
            return CustomUser.objects.all()
    
    @action(detail=True, methods=['post'])
    def approve_user(self, request, pk=None):
        """Approve a user account"""
        permission_error = self.check_manager_permission(request)
        if permission_error:
            return permission_error
        
        try:
            user = self.get_queryset().get(pk=pk)
            user.is_approved = True
            user.save()
            return Response({'message': 'User approved successfully'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def deactivate_user(self, request, pk=None):
        """Deactivate a user account"""
        permission_error = self.check_manager_permission(request)
        if permission_error:
            return permission_error
        
        try:
            user = self.get_queryset().get(pk=pk)
            user.is_active = False
            user.save()
            return Response({'message': 'User deactivated successfully'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ManagerProductViewSet(viewsets.ModelViewSet, ManagerPermissionMixin):
    """Manager product management"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        permission_error = self.check_manager_permission(self.request)
        if permission_error:
            return Product.objects.none()
        
        # Filter by store if manager has store_id
        if self.request.user.store_id:
            return Product.objects.filter(store_id=self.request.user.store_id)
        else:
            return Product.objects.all()

class ManagerStoreViewSet(viewsets.ModelViewSet, ManagerPermissionMixin):
    """Manager store management"""
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        permission_error = self.check_manager_permission(self.request)
        if permission_error:
            return Store.objects.none()
        
        # Managers can only see their own store
        if self.request.user.store_id:
            return Store.objects.filter(id=self.request.user.store_id)
        else:
            # Admin managers can see all stores
            return Store.objects.all()

class ManagerReportViewSet(viewsets.ViewSet, ManagerPermissionMixin):
    """Manager reporting system"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def sales_report(self, request):
        """Generate sales report"""
        permission_error = self.check_manager_permission(request)
        if permission_error:
            return permission_error
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get transactions in date range
        store_filter = {}
        if request.user.store_id:
            store_filter['store_id'] = request.user.store_id
            
        transactions = Transaction.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date,
            **store_filter
        )
        
        # Generate report data
        report_data = {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_sales': float(transactions.aggregate(total=Sum('total'))['total'] or 0),
                'total_orders': transactions.count(),
                'avg_order_value': float(transactions.aggregate(avg=Avg('total'))['avg'] or 0)
            },
            'daily_breakdown': []
        }
        
        # Daily breakdown
        current_date = start_date
        while current_date <= end_date:
            day_transactions = transactions.filter(timestamp__date=current_date)
            report_data['daily_breakdown'].append({
                'date': current_date.isoformat(),
                'sales': float(day_transactions.aggregate(total=Sum('total'))['total'] or 0),
                'orders': day_transactions.count()
            })
            current_date += timedelta(days=1)
        
        return Response(report_data)
    
    @action(detail=False, methods=['get'])
    def inventory_report(self, request):
        """Generate inventory report"""
        permission_error = self.check_manager_permission(request)
        if permission_error:
            return permission_error
        
        store_filter = {}
        if request.user.store_id:
            store_filter['store_id'] = request.user.store_id
        
        products = Product.objects.filter(is_active=True, **store_filter)
        
        report_data = {
            'summary': {
                'total_products': products.count(),
                'total_inventory_value': float(products.aggregate(
                    total=Sum(F('stock') * F('cost_price'))
                )['total'] or 0),
                'low_stock_count': products.filter(stock__lte=F('min_stock_level')).count(),
                'out_of_stock_count': products.filter(stock=0).count()
            },
            'products': []
        }
        
        for product in products:
            report_data['products'].append({
                'name': product.name,
                'sku': product.sku,
                'category': product.category.name if product.category else 'Uncategorized',
                'stock': product.stock,
                'min_stock_level': product.min_stock_level,
                'cost_price': float(product.cost_price),
                'selling_price': float(product.price),
                'inventory_value': float(product.stock * product.cost_price),
                'status': 'Low Stock' if product.stock <= product.min_stock_level else 'In Stock'
            })
        
        return Response(report_data)
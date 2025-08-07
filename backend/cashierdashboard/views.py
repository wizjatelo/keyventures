from datetime import date, datetime, timedelta
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from .models import (
    Store, Product, ProductVariant, Customer, Transaction, TransactionItem, Return, 
    OfflineTransaction, HardwareDevice, Category, SubCategory, Advertisement,
    Payment, DeliveryRoute, Delivery, DeliveryUpdate
)
from .serializers import (
    StoreSerializer, ProductSerializer, ProductVariantSerializer, CustomerSerializer, 
    TransactionSerializer, TransactionItemSerializer, ReturnSerializer, OfflineTransactionSerializer, 
    HardwareDeviceSerializer, CategorySerializer, SubCategorySerializer, AdvertisementSerializer,
    PaymentSerializer, DeliveryRouteSerializer, DeliverySerializer, DeliveryUpdateSerializer
)
from member.models import CustomUser
from member.serializers import CustomUserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filter users based on role permissions
        user = self.request.user
        if user.role == 'manager':
            # Managers can see all users in their store
            return CustomUser.objects.filter(store_id=user.store_id)
        elif user.role == 'cashier':
            # Cashiers can only see themselves and customers
            return CustomUser.objects.filter(
                Q(id=user.id) | Q(role='customer')
            )
        else:
            # Admins can see all users
            return CustomUser.objects.all()

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []  # Temporarily disable authentication for testing

    def get_queryset(self):
        queryset = Category.objects.all()
        parent = self.request.query_params.get('parent', None)
        if parent is not None:
            if parent == 'null':
                queryset = queryset.filter(parent_id__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent)
        return queryset

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = []  # Temporarily disable authentication for testing

    def get_queryset(self):
        queryset = SubCategory.objects.all()
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category=category)
        return queryset

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = []  # Temporarily disable authentication for testing

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(cashier=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def void_transaction(self, request, pk=None):
        transaction = self.get_object()
        if request.user.role == 'manager':
            transaction.status = 'voided'
            transaction.save()
            return Response({'status': 'Transaction voided'}, status=status.HTTP_200_OK)
        return Response({'error': 'Manager permission required'}, status=status.HTTP_403_FORBIDDEN)

class TransactionItemViewSet(viewsets.ModelViewSet):
    queryset = TransactionItem.objects.all()
    serializer_class = TransactionItemSerializer
    permission_classes = [IsAuthenticated]

class ReturnViewSet(viewsets.ModelViewSet):
    queryset = Return.objects.all()
    serializer_class = ReturnSerializer
    permission_classes = [IsAuthenticated]

class OfflineTransactionViewSet(viewsets.ModelViewSet):
    queryset = OfflineTransaction.objects.all()
    serializer_class = OfflineTransactionSerializer
    permission_classes = [IsAuthenticated]

    def sync_offline(self, request):
        offline_tx = self.get_queryset().filter(sync_status='pending')
        for tx in offline_tx:
            # Simulate sync logic (to be expanded with Kafka)
            tx.sync_status = 'synced'
            tx.save()
        return Response({'status': 'Offline transactions synced'}, status=status.HTTP_200_OK)

class HardwareDeviceViewSet(viewsets.ModelViewSet):
    queryset = HardwareDevice.objects.all()
    serializer_class = HardwareDeviceSerializer
    permission_classes = [IsAuthenticated]

class CashierDashboardStatsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        today_transactions = Transaction.objects.filter(cashier=request.user, timestamp__date=date.today())
        total_sales = today_transactions.aggregate(total=Sum('total'))['total'] or 0
        transaction_count = today_transactions.count()
        return Response({
            'total_sales': total_sales,
            'transaction_count': transaction_count,
            'last_sync': OfflineTransaction.objects.filter(cashier=request.user).latest('timestamp').timestamp if OfflineTransaction.objects.filter(cashier=request.user).exists() else None
        })

class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.filter(is_active=True)
    serializer_class = AdvertisementSerializer
    permission_classes = []  # Allow public access for customer dashboard

    def get_queryset(self):
        return Advertisement.objects.filter(is_active=True).order_by('display_order', '-created_at')


# ============= MANAGER DASHBOARD API ENDPOINTS =============

class ManagerDashboardViewSet(viewsets.ViewSet):
    """
    Manager Dashboard API endpoints for real-time data
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard_metrics(self, request):
        """Get main dashboard metrics"""
        try:
            # Get date range for calculations
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Filter by store if specified
            store_filter = {}
            selected_store = request.query_params.get('store', 'all')
            if selected_store != 'all':
                store_filter['store_id'] = selected_store

            # Current period metrics
            current_transactions = Transaction.objects.filter(
                timestamp__date__gte=week_ago,
                status__in=['completed', 'paid'],
                **store_filter
            )
            
            # Previous period for comparison
            previous_transactions = Transaction.objects.filter(
                timestamp__date__gte=month_ago,
                timestamp__date__lt=week_ago,
                status__in=['completed', 'paid'],
                **store_filter
            )

            # Calculate metrics
            total_sales = current_transactions.aggregate(total=Sum('total'))['total'] or 0
            total_orders = current_transactions.count()
            active_stores = Store.objects.filter(status='active').count()
            total_customers = Customer.objects.count()
            
            # Calculate conversion rate (orders/customers ratio)
            conversion_rate = (total_orders / max(total_customers, 1)) * 100
            
            # Calculate average order value
            avg_order_value = total_sales / max(total_orders, 1)
            
            # Calculate growth percentages
            prev_sales = previous_transactions.aggregate(total=Sum('total'))['total'] or 1
            prev_orders = previous_transactions.count() or 1
            
            sales_growth = ((total_sales - prev_sales) / prev_sales) * 100
            orders_growth = ((total_orders - prev_orders) / prev_orders) * 100

            return Response({
                'totalSales': float(total_sales),
                'totalOrders': total_orders,
                'activeStores': active_stores,
                'totalCustomers': total_customers,
                'conversionRate': round(conversion_rate, 1),
                'avgOrderValue': round(float(avg_order_value), 2),
                'salesGrowth': round(sales_growth, 1),
                'ordersGrowth': round(orders_growth, 1),
                'lastUpdated': timezone.now().isoformat()
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def notifications(self, request):
        """Get system notifications"""
        try:
            notifications = []
            
            # Low stock alerts
            low_stock_products = Product.objects.filter(
                stock__lte=F('min_stock_level'),
                is_active=True
            )[:5]
            
            for product in low_stock_products:
                notifications.append({
                    'id': f'stock_{product.id}',
                    'type': 'warning',
                    'message': f'Low stock alert: {product.name} ({product.stock} remaining)',
                    'time': 'Real-time',
                    'priority': 'high' if product.stock == 0 else 'medium'
                })
            
            # Recent high-performing stores
            today = timezone.now().date()
            high_performing_stores = Transaction.objects.filter(
                timestamp__date=today,
                status='completed'
            ).values('store_id__name').annotate(
                daily_sales=Sum('total')
            ).filter(daily_sales__gt=1000)[:3]
            
            for store in high_performing_stores:
                notifications.append({
                    'id': f'performance_{store["store_id__name"]}',
                    'type': 'success',
                    'message': f'{store["store_id__name"]} exceeded daily target (${store["daily_sales"]:.0f})',
                    'time': '1 hour ago',
                    'priority': 'low'
                })
            
            # System updates
            notifications.append({
                'id': 'system_update',
                'type': 'info',
                'message': 'System synchronized successfully',
                'time': '5 min ago',
                'priority': 'low'
            })

            return Response(notifications)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get pending approvals"""
        try:
            approvals = []
            
            # Pending returns
            pending_returns = Return.objects.filter(status='pending')[:10]
            for return_item in pending_returns:
                approvals.append({
                    'id': return_item.id,
                    'type': 'Return',
                    'amount': float(return_item.refund_amount),
                    'store': return_item.original_transaction.store_id.name if return_item.original_transaction.store_id else 'Unknown',
                    'time': self._time_ago(return_item.original_transaction.timestamp),
                    'details': {
                        'reason': return_item.reason,
                        'transaction_id': return_item.original_transaction.receipt_number
                    }
                })
            
            # Large transactions needing approval (over $500)
            large_transactions = Transaction.objects.filter(
                total__gt=500,
                status='pending_approval'
            )[:5]
            
            for transaction in large_transactions:
                approvals.append({
                    'id': f'transaction_{transaction.id}',
                    'type': 'Large Transaction',
                    'amount': float(transaction.total),
                    'store': transaction.store_id.name if transaction.store_id else 'Unknown',
                    'time': self._time_ago(transaction.timestamp),
                    'details': {
                        'receipt_number': transaction.receipt_number,
                        'customer': transaction.customer.name if transaction.customer else 'Walk-in'
                    }
                })

            return Response(approvals)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def sales_data(self, request):
        """Get sales data for charts"""
        try:
            period = request.query_params.get('period', 'weekly')
            store_filter = {}
            selected_store = request.query_params.get('store', 'all')
            if selected_store != 'all':
                store_filter['store_id'] = selected_store

            if period == 'weekly':
                # Last 7 days
                sales_data = []
                for i in range(7):
                    day = timezone.now().date() - timedelta(days=6-i)
                    day_transactions = Transaction.objects.filter(
                        timestamp__date=day,
                        status='completed',
                        **store_filter
                    )
                    
                    daily_sales = day_transactions.aggregate(total=Sum('total'))['total'] or 0
                    daily_orders = day_transactions.count()
                    
                    sales_data.append({
                        'name': day.strftime('%a'),
                        'sales': float(daily_sales),
                        'orders': daily_orders,
                        'date': day.isoformat()
                    })
            else:  # monthly
                # Last 12 months
                sales_data = []
                for i in range(12):
                    month_start = (timezone.now().replace(day=1) - timedelta(days=30*i)).replace(day=1)
                    month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                    
                    month_transactions = Transaction.objects.filter(
                        timestamp__date__gte=month_start,
                        timestamp__date__lte=month_end,
                        status='completed',
                        **store_filter
                    )
                    
                    monthly_sales = month_transactions.aggregate(total=Sum('total'))['total'] or 0
                    monthly_orders = month_transactions.count()
                    
                    sales_data.append({
                        'name': month_start.strftime('%b'),
                        'sales': float(monthly_sales),
                        'orders': monthly_orders,
                        'date': month_start.isoformat()
                    })
                
                sales_data.reverse()  # Show chronological order

            return Response(sales_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def store_performance(self, request):
        """Get store performance data"""
        try:
            # Get sales by store for the last 30 days
            thirty_days_ago = timezone.now().date() - timedelta(days=30)
            
            store_sales = Transaction.objects.filter(
                timestamp__date__gte=thirty_days_ago,
                status='completed'
            ).values('store_id__name').annotate(
                total_sales=Sum('total')
            ).order_by('-total_sales')

            total_all_stores = sum(store['total_sales'] for store in store_sales)
            
            colors = ['#FF6B35', '#3498DB', '#27AE60', '#F39C12', '#8B5CF6', '#E74C3C']
            performance_data = []
            
            for i, store in enumerate(store_sales[:6]):  # Top 6 stores
                percentage = (store['total_sales'] / max(total_all_stores, 1)) * 100
                performance_data.append({
                    'name': store['store_id__name'] or f'Store #{i+1}',
                    'value': round(percentage, 1),
                    'sales': float(store['total_sales']),
                    'color': colors[i % len(colors)]
                })

            return Response(performance_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def inventory_alerts(self, request):
        """Get inventory alerts"""
        try:
            # Get products with low stock
            low_stock_products = Product.objects.filter(
                Q(stock__lte=F('min_stock_level')) | Q(stock__lt=10),
                is_active=True
            ).order_by('stock')[:10]

            alerts = []
            for product in low_stock_products:
                status_level = 'critical' if product.stock <= 5 else 'low'
                alerts.append({
                    'id': product.id,
                    'product': product.name,
                    'sku': product.sku,
                    'stock': product.stock,
                    'reorder': product.min_stock_level or 20,
                    'status': status_level,
                    'category': product.category.name if product.category else 'Uncategorized'
                })

            return Response(alerts)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def recent_orders(self, request):
        """Get recent orders"""
        try:
            recent_orders = Transaction.objects.filter(
                status__in=['completed', 'pending', 'processing']
            ).order_by('-timestamp')[:10]

            orders_data = []
            for order in recent_orders:
                orders_data.append({
                    'id': order.receipt_number,
                    'customer': order.customer.name if order.customer else 'Walk-in Customer',
                    'amount': float(order.total),
                    'status': order.status,
                    'store': order.store_id.name if order.store_id else 'Unknown Store',
                    'timestamp': order.timestamp.isoformat(),
                    'time_ago': self._time_ago(order.timestamp),
                    'items_count': order.transactionitem_set.count()
                })

            return Response(orders_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def approve_request(self, request, pk=None):
        """Approve a pending request"""
        try:
            request_id = request.data.get('id')
            request_type = request.data.get('type')
            
            if request_type == 'Return':
                return_item = Return.objects.get(id=request_id)
                return_item.status = 'approved'
                return_item.processed_by = request.user
                return_item.save()
                
                # Update product stock
                for item in return_item.original_transaction.transactionitem_set.all():
                    if item.product:
                        item.product.stock += item.quantity
                        item.product.save()
                
                return Response({'message': 'Return approved successfully'})
            
            elif request_type == 'Large Transaction':
                transaction_id = request_id.replace('transaction_', '')
                transaction = Transaction.objects.get(id=transaction_id)
                transaction.status = 'completed'
                transaction.save()
                
                return Response({'message': 'Transaction approved successfully'})
            
            return Response({'error': 'Invalid request type'}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def reject_request(self, request, pk=None):
        """Reject a pending request"""
        try:
            request_id = request.data.get('id')
            request_type = request.data.get('type')
            
            if request_type == 'Return':
                return_item = Return.objects.get(id=request_id)
                return_item.status = 'rejected'
                return_item.processed_by = request.user
                return_item.save()
                
                return Response({'message': 'Return rejected successfully'})
            
            elif request_type == 'Large Transaction':
                transaction_id = request_id.replace('transaction_', '')
                transaction = Transaction.objects.get(id=transaction_id)
                transaction.status = 'cancelled'
                transaction.save()
                
                return Response({'message': 'Transaction rejected successfully'})
            
            return Response({'error': 'Invalid request type'}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _time_ago(self, timestamp):
        """Helper method to calculate time ago"""
        now = timezone.now()
        diff = now - timestamp
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} min ago"
        else:
            return "Just now"


# ============= REAL-TIME DATA SYNC ENDPOINTS =============

class RealTimeDataViewSet(viewsets.ViewSet):
    """
    Real-time data synchronization endpoints
    """
    permission_classes = []  # Allow public access for real-time updates

    @action(detail=False, methods=['get'])
    def product_updates(self, request):
        """Get real-time product updates"""
        try:
            # Get timestamp from query params for incremental updates
            last_update = request.query_params.get('since')
            
            queryset = Product.objects.filter(is_active=True)
            if last_update:
                try:
                    since_datetime = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
                    # Note: We'd need to add updated_at field to Product model for this to work properly
                    # For now, return all products
                except ValueError:
                    pass
            
            products = []
            for product in queryset:
                products.append({
                    'id': product.id,
                    'name': product.name,
                    'sku': product.sku,
                    'price': float(product.price),
                    'stock': product.stock,
                    'category': product.category.name if product.category else None,
                    'subcategory': product.subcategory.name if product.subcategory else None,
                    'image': product.image.url if product.image else None,
                    'is_active': product.is_active,
                    'last_updated': timezone.now().isoformat()
                })
            
            return Response({
                'products': products,
                'timestamp': timezone.now().isoformat(),
                'total_count': len(products)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def category_updates(self, request):
        """Get real-time category updates"""
        try:
            categories = []
            for category in Category.objects.all():
                categories.append({
                    'id': category.id,
                    'name': category.name,
                    'display_order': category.display_order,
                    'subcategories': [
                        {
                            'id': sub.id,
                            'name': sub.name,
                            'display_order': sub.display_order
                        } for sub in category.subcategories.all()
                    ]
                })
            
            return Response({
                'categories': categories,
                'timestamp': timezone.now().isoformat()
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def inventory_status(self, request):
        """Get real-time inventory status"""
        try:
            inventory_data = []
            for product in Product.objects.filter(is_active=True):
                stock_status = 'in_stock'
                if product.stock <= 0:
                    stock_status = 'out_of_stock'
                elif product.stock <= (product.min_stock_level or 10):
                    stock_status = 'low_stock'
                
                inventory_data.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'sku': product.sku,
                    'current_stock': product.stock,
                    'min_stock_level': product.min_stock_level or 10,
                    'status': stock_status,
                    'last_updated': timezone.now().isoformat()
                })
            
            return Response({
                'inventory': inventory_data,
                'timestamp': timezone.now().isoformat(),
                'summary': {
                    'total_products': len(inventory_data),
                    'out_of_stock': len([item for item in inventory_data if item['status'] == 'out_of_stock']),
                    'low_stock': len([item for item in inventory_data if item['status'] == 'low_stock']),
                    'in_stock': len([item for item in inventory_data if item['status'] == 'in_stock'])
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create a new payment"""
        import uuid
        
        # Generate unique reference number
        reference_number = f"PAY-{uuid.uuid4().hex[:8].upper()}"
        request.data['reference_number'] = reference_number
        request.data['processed_by'] = request.user.id
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """Process a payment (mark as completed/failed)"""
        try:
            payment = self.get_object()
            new_status = request.data.get('status')
            
            if new_status not in ['completed', 'failed', 'cancelled']:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
            payment.status = new_status
            payment.processed_at = timezone.now()
            payment.processed_by = request.user
            payment.gateway_response = request.data.get('gateway_response', {})
            payment.save()
            
            # Update transaction status based on payment status
            if new_status == 'completed':
                payment.transaction.status = 'completed'
                payment.transaction.save()
            
            return Response(PaymentSerializer(payment).data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeliveryRouteViewSet(viewsets.ModelViewSet):
    queryset = DeliveryRoute.objects.all()
    serializer_class = DeliveryRouteSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        queryset = DeliveryRoute.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('name')

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create a new delivery"""
        import uuid
        
        # Generate unique tracking number
        tracking_number = f"TRK-{uuid.uuid4().hex[:8].upper()}"
        request.data['tracking_number'] = tracking_number
        request.data['updated_by'] = request.user.id
        
        return super().create(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Delivery.objects.all()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update delivery status with tracking information"""
        try:
            delivery = self.get_object()
            new_status = request.data.get('status')
            location = request.data.get('location', '')
            notes = request.data.get('notes', '')
            
            if new_status not in dict(Delivery.DELIVERY_STATUS_CHOICES):
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update delivery status
            delivery.status = new_status
            delivery.updated_by = request.user
            
            # Set actual delivery time if delivered
            if new_status == 'delivered':
                delivery.actual_delivery_time = timezone.now()
            
            delivery.save()
            
            # Create delivery update record
            DeliveryUpdate.objects.create(
                delivery=delivery,
                status=new_status,
                location=location,
                notes=notes,
                updated_by=request.user
            )
            
            return Response(DeliverySerializer(delivery).data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def tracking_history(self, request, pk=None):
        """Get delivery tracking history"""
        try:
            delivery = self.get_object()
            updates = delivery.updates.all()
            
            return Response({
                'delivery': DeliverySerializer(delivery).data,
                'tracking_history': DeliveryUpdateSerializer(updates, many=True).data
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeliveryUpdateViewSet(viewsets.ModelViewSet):
    queryset = DeliveryUpdate.objects.all()
    serializer_class = DeliveryUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta

# Import models from cashier dashboard (shared models)
from cashierdashboard.models import (
    Category, SubCategory, Product, Advertisement, 
    Customer, Transaction, TransactionItem, Payment, Delivery, DeliveryUpdate
)
from cashierdashboard.serializers import (
    CategorySerializer, SubCategorySerializer, ProductSerializer, 
    AdvertisementSerializer, CustomerSerializer, TransactionSerializer,
    PaymentSerializer, DeliverySerializer, DeliveryUpdateSerializer
)
from member.models import CustomUser
from member.serializers import CustomerProfileSerializer

class CustomerCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only categories for customers"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Allow guest browsing
    
    def get_queryset(self):
        queryset = Category.objects.all()
        parent = self.request.query_params.get('parent', None)
        if parent is not None:
            if parent == 'null':
                queryset = queryset.filter(parent_id__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent)
        return queryset

class CustomerSubCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only subcategories for customers"""
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [AllowAny]  # Allow guest browsing
    
    def get_queryset(self):
        queryset = SubCategory.objects.all()
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category=category)
        return queryset

class CustomerProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only products for customers"""
    queryset = Product.objects.filter(is_active=True, stock__gt=0)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Allow guest browsing
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(subcategory__name__icontains=search)
            )
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
            
        # Subcategory filter
        subcategory = self.request.query_params.get('subcategory', None)
        if subcategory:
            queryset = queryset.filter(subcategory=subcategory)
            
        # Price range filter
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # In stock filter
        in_stock_only = self.request.query_params.get('in_stock', None)
        if in_stock_only == 'true':
            queryset = queryset.filter(stock__gt=0)
            
        return queryset.order_by('-id')

class CustomerAdvertisementViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only advertisements for customers"""
    queryset = Advertisement.objects.filter(is_active=True)
    serializer_class = AdvertisementSerializer
    permission_classes = [AllowAny]  # Allow guest browsing
    
    def get_queryset(self):
        return Advertisement.objects.filter(is_active=True).order_by('display_order', '-created_at')

class CustomerProfileViewSet(viewsets.ViewSet):
    """Customer profile management"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get customer profile"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = CustomerProfileSerializer(request.user)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        """Update customer profile"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = CustomerProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerOrderViewSet(viewsets.ViewSet):
    """Customer order management"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get customer orders"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get customer record
        try:
            customer = Customer.objects.get(email=request.user.email)
            transactions = Transaction.objects.filter(customer=customer).order_by('-timestamp')
            
            orders_data = []
            for transaction in transactions:
                items = TransactionItem.objects.filter(transaction=transaction)
                orders_data.append({
                    'id': transaction.receipt_number,
                    'date': transaction.timestamp,
                    'total': transaction.total,
                    'status': transaction.status,
                    'payment_method': transaction.payment_method,
                    'items_count': items.count(),
                    'items': [
                        {
                            'product_name': item.product.name if item.product else 'Unknown',
                            'quantity': item.quantity,
                            'unit_price': item.unit_price,
                            'total': item.total
                        } for item in items
                    ]
                })
            
            return Response({'orders': orders_data})
            
        except Customer.DoesNotExist:
            return Response({'orders': []})
    
    def retrieve(self, request, pk=None):
        """Get specific order details"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            customer = Customer.objects.get(email=request.user.email)
            transaction = Transaction.objects.get(receipt_number=pk, customer=customer)
            items = TransactionItem.objects.filter(transaction=transaction)
            
            order_data = {
                'id': transaction.receipt_number,
                'date': transaction.timestamp,
                'subtotal': transaction.subtotal,
                'tax_amount': transaction.tax_amount,
                'total': transaction.total,
                'status': transaction.status,
                'payment_method': transaction.payment_method,
                'cashier': transaction.cashier.username if transaction.cashier else 'Unknown',
                'items': [
                    {
                        'product_name': item.product.name if item.product else 'Unknown',
                        'quantity': item.quantity,
                        'unit_price': item.unit_price,
                        'discount': item.discount,
                        'total': item.total
                    } for item in items
                ]
            }
            
            return Response(order_data)
            
        except (Customer.DoesNotExist, Transaction.DoesNotExist):
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

class CustomerSearchViewSet(viewsets.ViewSet):
    """Customer search functionality"""
    permission_classes = [AllowAny]  # Allow guest searching
    
    def list(self, request):
        """Search products, categories, etc."""
        query = request.query_params.get('q', '')
        if not query:
            return Response({
                'products': [],
                'categories': [],
                'total_results': 0
            })
        
        # Search products
        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query),
            is_active=True
        )[:20]  # Limit results
        
        # Search categories
        categories = Category.objects.filter(
            name__icontains=query
        )[:10]  # Limit results
        
        return Response({
            'products': ProductSerializer(products, many=True).data,
            'categories': CategorySerializer(categories, many=True).data,
            'total_results': products.count() + categories.count()
        })

class CustomerNotificationViewSet(viewsets.ViewSet):
    """Customer notifications (placeholder for future implementation)"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get customer notifications"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Placeholder - implement actual notification system later
        notifications = [
            {
                'id': 1,
                'type': 'info',
                'title': 'Welcome to LineMart!',
                'message': 'Thank you for joining our platform.',
                'read': False,
                'created_at': timezone.now()
            }
        ]
        
        return Response({'notifications': notifications})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        # Placeholder implementation
        return Response({'message': 'Notification marked as read'})

class CustomerStoreViewSet(viewsets.ReadOnlyModelViewSet):
    """Store information for customers"""
    from cashierdashboard.models import Store
    from cashierdashboard.serializers import StoreSerializer
    
    queryset = Store.objects.filter(status='active')
    serializer_class = StoreSerializer
    permission_classes = [AllowAny]  # Allow guest browsing

class CustomerPaymentViewSet(viewsets.ViewSet):
    """Customer payment management"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get customer payments"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get customer record
            customer = Customer.objects.get(email=request.user.email)
            transactions = Transaction.objects.filter(customer=customer)
            payments = Payment.objects.filter(transaction__in=transactions).order_by('-created_at')
            
            return Response({
                'payments': PaymentSerializer(payments, many=True).data
            })
            
        except Customer.DoesNotExist:
            return Response({'payments': []})
    
    def create(self, request):
        """Create a payment for an order"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            transaction_id = request.data.get('transaction_id')
            payment_method = request.data.get('payment_method')
            
            if not transaction_id or not payment_method:
                return Response({'error': 'Transaction ID and payment method are required'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Verify transaction belongs to customer
            customer = Customer.objects.get(email=request.user.email)
            transaction = Transaction.objects.get(id=transaction_id, customer=customer)
            
            # Check if payment already exists
            if hasattr(transaction, 'payment'):
                return Response({'error': 'Payment already exists for this transaction'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Create payment
            import uuid
            payment_data = {
                'transaction': transaction.id,
                'payment_method': payment_method,
                'amount': transaction.total,
                'reference_number': f"PAY-{uuid.uuid4().hex[:8].upper()}",
                'status': 'pending'
            }
            
            serializer = PaymentSerializer(data=payment_data)
            if serializer.is_valid():
                payment = serializer.save()
                return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except (Customer.DoesNotExist, Transaction.DoesNotExist):
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, pk=None):
        """Get specific payment details"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            customer = Customer.objects.get(email=request.user.email)
            payment = Payment.objects.get(
                id=pk, 
                transaction__customer=customer
            )
            
            return Response(PaymentSerializer(payment).data)
            
        except (Customer.DoesNotExist, Payment.DoesNotExist):
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

class CustomerDeliveryViewSet(viewsets.ViewSet):
    """Customer delivery tracking"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get customer deliveries"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get customer record
            customer = Customer.objects.get(email=request.user.email)
            transactions = Transaction.objects.filter(customer=customer)
            deliveries = Delivery.objects.filter(transaction__in=transactions).order_by('-created_at')
            
            return Response({
                'deliveries': DeliverySerializer(deliveries, many=True).data
            })
            
        except Customer.DoesNotExist:
            return Response({'deliveries': []})
    
    def retrieve(self, request, pk=None):
        """Get specific delivery details"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            customer = Customer.objects.get(email=request.user.email)
            delivery = Delivery.objects.get(
                id=pk, 
                transaction__customer=customer
            )
            
            return Response(DeliverySerializer(delivery).data)
            
        except (Customer.DoesNotExist, Delivery.DoesNotExist):
            return Response({'error': 'Delivery not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def track_by_number(self, request):
        """Track delivery by tracking number"""
        tracking_number = request.query_params.get('tracking_number')
        
        if not tracking_number:
            return Response({'error': 'Tracking number is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            delivery = Delivery.objects.get(tracking_number=tracking_number)
            
            # Verify delivery belongs to customer (if authenticated)
            if request.user.is_authenticated and request.user.role == 'customer':
                customer = Customer.objects.get(email=request.user.email)
                if delivery.transaction.customer != customer:
                    return Response({'error': 'Delivery not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get tracking history
            updates = delivery.updates.all()
            
            return Response({
                'delivery': DeliverySerializer(delivery).data,
                'tracking_history': DeliveryUpdateSerializer(updates, many=True).data
            })
            
        except (Delivery.DoesNotExist, Customer.DoesNotExist):
            return Response({'error': 'Delivery not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def tracking_history(self, request, pk=None):
        """Get delivery tracking history"""
        if request.user.role != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            customer = Customer.objects.get(email=request.user.email)
            delivery = Delivery.objects.get(
                id=pk, 
                transaction__customer=customer
            )
            updates = delivery.updates.all()
            
            return Response({
                'delivery': DeliverySerializer(delivery).data,
                'tracking_history': DeliveryUpdateSerializer(updates, many=True).data
            })
            
        except (Customer.DoesNotExist, Delivery.DoesNotExist):
            return Response({'error': 'Delivery not found'}, status=status.HTTP_404_NOT_FOUND)
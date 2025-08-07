import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from customerdashboard.models import (
    Product, Order, OrderItem, UserProfile, 
    PaymentMethod, Notification, Deal, PromoBanner
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with sample customer data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Create products
        self.create_products()
        
        # Create deals
        self.create_deals()
        
        # Create promo banners
        self.create_promo_banners()
        
        # Create a test client user if none exists
        if not User.objects.filter(username='client').exists():
            user = User.objects.create_user(
                username='client',
                email='client@example.com',
                password='client123',
                role='client'
            )
            self.stdout.write(f'Created test client user: {user.username}')
        
        # Create user profiles and related data for existing users
        for user in User.objects.filter(role='client'):
            self.create_user_data(user)
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data!'))
    
    def create_products(self):
        if Product.objects.exists():
            self.stdout.write('Products already exist, skipping...')
            return
        
        categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books']
        
        products_data = [
            {
                'name': 'Wireless Earbuds',
                'description': 'High-quality wireless earbuds with noise cancellation.',
                'price': 79.99,
                'image': '/earbuds.jpg',
                'category': 'Electronics',
                'rating': 4.5,
                'stock': 50
            },
            {
                'name': 'Bluetooth Speaker',
                'description': 'Portable Bluetooth speaker with 20-hour battery life.',
                'price': 49.99,
                'image': '/bluetooths.jpg',
                'category': 'Electronics',
                'rating': 4.2,
                'stock': 30
            },
            {
                'name': 'Fitness Tracker',
                'description': 'Track your steps, heart rate, and sleep patterns.',
                'price': 59.99,
                'image': '/fitness-tracker.jpg',
                'category': 'Electronics',
                'rating': 4.0,
                'stock': 25
            },
            {
                'name': 'Portable Charger',
                'description': '10000mAh portable charger for all your devices.',
                'price': 29.99,
                'image': '/portable-charger.jpg',
                'category': 'Electronics',
                'rating': 4.7,
                'stock': 100
            },
            {
                'name': 'Wireless Mouse',
                'description': 'Ergonomic wireless mouse for comfortable use.',
                'price': 19.99,
                'image': '/wireless-mouse.jpg',
                'category': 'Electronics',
                'rating': 4.3,
                'stock': 75
            },
            {
                'name': 'Tablet Stand',
                'description': 'Adjustable stand for tablets and e-readers.',
                'price': 15.99,
                'image': '/tablet-stand.jpg',
                'category': 'Home',
                'rating': 4.1,
                'stock': 60
            },
            {
                'name': 'Desk Lamp',
                'description': 'LED desk lamp with adjustable brightness.',
                'price': 24.99,
                'image': '/desk-lamp.jpg',
                'category': 'Home',
                'rating': 4.4,
                'stock': 40
            },
            {
                'name': 'Kitchen Scale',
                'description': 'Digital kitchen scale for precise measurements.',
                'price': 14.99,
                'image': '/kitchen-scale.jpg',
                'category': 'Home',
                'rating': 4.2,
                'stock': 55
            },
            {
                'name': 'Coffee Maker',
                'description': 'Programmable coffee maker with timer.',
                'price': 39.99,
                'image': '/coffee-maker.jpg',
                'category': 'Home',
                'rating': 4.6,
                'stock': 35
            },
            {
                'name': 'Water Bottle',
                'description': 'Insulated water bottle keeps drinks cold for 24 hours.',
                'price': 18.99,
                'image': '/water-bottle.jpg',
                'category': 'Sports',
                'rating': 4.8,
                'stock': 90
            },
            {
                'name': 'Yoga Mat',
                'description': 'Non-slip yoga mat for home workouts.',
                'price': 22.99,
                'image': '/yoga-mat.jpg',
                'category': 'Sports',
                'rating': 4.3,
                'stock': 45
            },
            {
                'name': 'Running Shoes',
                'description': 'Lightweight running shoes for daily use.',
                'price': 69.99,
                'image': '/running-shoes.jpg',
                'category': 'Fashion',
                'rating': 4.5,
                'stock': 30
            },
            {
                'name': 'Backpack',
                'description': 'Durable backpack with laptop compartment.',
                'price': 34.99,
                'image': '/backpack.jpg',
                'category': 'Fashion',
                'rating': 4.4,
                'stock': 50
            },
            {
                'name': 'Sunglasses',
                'description': 'UV protection sunglasses with polarized lenses.',
                'price': 24.99,
                'image': '/sunglasses.jpg',
                'category': 'Fashion',
                'rating': 4.2,
                'stock': 65
            },
            {
                'name': 'Phone Case',
                'description': 'Protective phone case with card holder.',
                'price': 12.99,
                'image': '/phone-case.jpg',
                'category': 'Electronics',
                'rating': 4.0,
                'stock': 120
            },
            {
                'name': 'Travel Pillow',
                'description': 'Memory foam travel pillow for comfortable journeys.',
                'price': 19.99,
                'image': '/travel-pillow.jpg',
                'category': 'Travel',
                'rating': 4.1,
                'stock': 40
            },
        ]
        
        for product_data in products_data:
            Product.objects.create(**product_data)
        
        self.stdout.write(f'Created {len(products_data)} products')
    
    def create_deals(self):
        if Deal.objects.exists():
            self.stdout.write('Deals already exist, skipping...')
            return
        
        deals_data = [
            {
                'name': 'Summer Sale - 20% Off Electronics',
                'description': 'Get 20% off all electronics until the end of the month.',
                'discount': 20,
                'image': 'https://via.placeholder.com/150',
                'expires': timezone.now() + timedelta(days=30),
                'category': 'Electronics'
            },
            {
                'name': 'Buy 1 Get 1 Free on Accessories',
                'description': 'Buy any accessory and get another one free.',
                'discount': 50,
                'image': 'https://via.placeholder.com/150',
                'expires': timezone.now() + timedelta(days=15),
                'category': 'Fashion'
            },
            {
                'name': 'Clearance - Up to 30% Off Home Items',
                'description': 'Clearance sale on all home items.',
                'discount': 30,
                'image': 'https://via.placeholder.com/150',
                'expires': timezone.now() + timedelta(days=10),
                'category': 'Home'
            },
        ]
        
        for deal_data in deals_data:
            Deal.objects.create(**deal_data)
        
        self.stdout.write(f'Created {len(deals_data)} deals')
    
    def create_promo_banners(self):
        if PromoBanner.objects.exists():
            self.stdout.write('Promo banners already exist, skipping...')
            return
        
        banners_data = [
            {
                'title': 'Summer Sale',
                'subtitle': 'Up to 50% off on selected items',
                'image': 'https://via.placeholder.com/800x200?text=Summer+Sale',
                'link': '/shop?promo=summer',
                'background_color': '#FF6B35'
            },
            {
                'title': 'New Arrivals',
                'subtitle': 'Check out our latest products',
                'image': 'https://via.placeholder.com/800x200?text=New+Arrivals',
                'link': '/shop?category=new',
                'background_color': '#4ECDC4'
            },
            {
                'title': 'Free Shipping',
                'subtitle': 'On orders over $50',
                'image': 'https://via.placeholder.com/800x200?text=Free+Shipping',
                'link': '/shipping-info',
                'background_color': '#1A535C'
            },
        ]
        
        for banner_data in banners_data:
            PromoBanner.objects.create(**banner_data)
        
        self.stdout.write(f'Created {len(banners_data)} promo banners')
    
    def create_user_data(self, user):
        # Create or update user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if created:
            profile.avatar = f'https://randomuser.me/api/portraits/men/{random.randint(1, 99)}.jpg'
            profile.loyalty_points = random.randint(0, 1200)
            profile.total_spent = random.uniform(0, 2000)
            
            # Set loyalty tier based on points
            if profile.loyalty_points >= 1000:
                profile.loyalty_tier = 'platinum'
            elif profile.loyalty_points >= 500:
                profile.loyalty_tier = 'gold'
            elif profile.loyalty_points >= 200:
                profile.loyalty_tier = 'silver'
            
            profile.save()
            self.stdout.write(f'Created profile for {user.username}')
        
        # Create payment methods if none exist
        if not PaymentMethod.objects.filter(user=user).exists():
            payment_methods_data = [
                {
                    'user': user,
                    'type': 'visa',
                    'is_default': True,
                    'last_four': '4242',
                    'expiry_date': '12/2025'
                },
                {
                    'user': user,
                    'type': 'mpesa',
                    'is_default': False
                }
            ]
            
            for payment_data in payment_methods_data:
                PaymentMethod.objects.create(**payment_data)
            
            self.stdout.write(f'Created payment methods for {user.username}')
        
        # Create notifications if none exist
        if not Notification.objects.filter(user=user).exists():
            notifications_data = [
                {
                    'user': user,
                    'type': 'info',
                    'message': 'Welcome to LineMart! Start shopping now.',
                    'created_at': timezone.now() - timedelta(days=5),
                    'read': True
                },
                {
                    'user': user,
                    'type': 'success',
                    'message': f'You\'ve earned {profile.loyalty_points} loyalty points so far!',
                    'created_at': timezone.now() - timedelta(days=2),
                    'read': False
                },
                {
                    'user': user,
                    'type': 'warning',
                    'message': 'Special offer expires in 2 days. Don\'t miss out!',
                    'created_at': timezone.now() - timedelta(days=1),
                    'read': False
                }
            ]
            
            for notification_data in notifications_data:
                Notification.objects.create(**notification_data)
            
            self.stdout.write(f'Created notifications for {user.username}')
        
        # Create orders if none exist
        if not Order.objects.filter(user=user).exists():
            # Create 3-5 orders for this user
            for i in range(random.randint(3, 5)):
                # Get random products
                products = list(Product.objects.all())
                random.shuffle(products)
                selected_products = products[:random.randint(1, 4)]
                
                # Calculate total
                total = sum(product.price for product in selected_products)
                
                # Create order
                order = Order.objects.create(
                    user=user,
                    order_date=timezone.now() - timedelta(days=random.randint(1, 90)),
                    total=total,
                    status=random.choice(['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered']),
                    tracking_info=f'TRK{random.randint(100000, 999999)}',
                    payment_method=random.choice(['visa', 'mastercard', 'mpesa']),
                    shipping_address=f'{random.randint(100, 999)} Main St, Anytown, ST 12345'
                )
                
                # Create order items
                for product in selected_products:
                    quantity = random.randint(1, 3)
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=product.price
                    )
            
            self.stdout.write(f'Created orders for {user.username}')
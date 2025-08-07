#!/usr/bin/env python
"""
Sample data creation script for LineMart backend
Run this script to populate the database with test data
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from cashierdashboard.models import (
    User, Store, Category, SubCategory, Product, Customer, 
    Transaction, TransactionItem, Return, Advertisement
)

def create_sample_data():
    print("🚀 Creating sample data for LineMart...")
    
    # Create Users
    print("👥 Creating users...")
    manager_user, created = User.objects.get_or_create(
        username='manager1',
        defaults={
            'email': 'manager@linemart.com',
            'first_name': 'John',
            'last_name': 'Manager',
            'role': 'manager',
            'is_active': True
        }
    )
    
    cashier_user, created = User.objects.get_or_create(
        username='cashier1',
        defaults={
            'email': 'cashier@linemart.com',
            'first_name': 'Jane',
            'last_name': 'Cashier',
            'role': 'cashier',
            'is_active': True
        }
    )
    
    # Create Stores
    print("🏪 Creating stores...")
    stores_data = [
        {'name': 'Downtown Flagship', 'location': '123 Main St, NYC', 'status': 'active'},
        {'name': 'Mall Outlet', 'location': '456 Mall Ave, NYC', 'status': 'active'},
        {'name': 'Airport Kiosk', 'location': 'JFK Terminal 1', 'status': 'active'},
        {'name': 'Online Store', 'location': 'Virtual', 'status': 'active'},
    ]
    
    stores = []
    for store_data in stores_data:
        store, created = Store.objects.get_or_create(
            name=store_data['name'],
            defaults=store_data
        )
        stores.append(store)
        if created:
            print(f"  ✅ Created store: {store.name}")
    
    # Assign users to stores
    cashier_user.store_id = stores[0]
    cashier_user.save()
    
    # Create Categories
    print("📂 Creating categories...")
    categories_data = [
        {'name': 'Electronics', 'display_order': 1},
        {'name': 'Clothing', 'display_order': 2},
        {'name': 'Food & Beverages', 'display_order': 3},
        {'name': 'Books', 'display_order': 4},
        {'name': 'Home & Garden', 'display_order': 5},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        categories.append(category)
        if created:
            print(f"  ✅ Created category: {category.name}")
    
    # Create Subcategories
    print("📁 Creating subcategories...")
    subcategories_data = [
        # Electronics
        {'name': 'Smartphones', 'category': categories[0], 'display_order': 1},
        {'name': 'Laptops', 'category': categories[0], 'display_order': 2},
        {'name': 'Headphones', 'category': categories[0], 'display_order': 3},
        # Clothing
        {'name': 'T-Shirts', 'category': categories[1], 'display_order': 1},
        {'name': 'Jeans', 'category': categories[1], 'display_order': 2},
        {'name': 'Shoes', 'category': categories[1], 'display_order': 3},
        # Food & Beverages
        {'name': 'Snacks', 'category': categories[2], 'display_order': 1},
        {'name': 'Beverages', 'category': categories[2], 'display_order': 2},
        # Books
        {'name': 'Fiction', 'category': categories[3], 'display_order': 1},
        {'name': 'Non-Fiction', 'category': categories[3], 'display_order': 2},
        # Home & Garden
        {'name': 'Furniture', 'category': categories[4], 'display_order': 1},
        {'name': 'Plants', 'category': categories[4], 'display_order': 2},
    ]
    
    subcategories = []
    for subcat_data in subcategories_data:
        subcategory, created = SubCategory.objects.get_or_create(
            name=subcat_data['name'],
            category=subcat_data['category'],
            defaults={'display_order': subcat_data['display_order']}
        )
        subcategories.append(subcategory)
        if created:
            print(f"  ✅ Created subcategory: {subcategory.name}")
    
    # Create Products
    print("📦 Creating products...")
    products_data = [
        # Electronics - Smartphones
        {
            'name': 'iPhone 15 Pro', 'sku': 'IPH15PRO', 'barcode': '123456789001',
            'category': categories[0], 'subcategory': subcategories[0],
            'description': 'Latest iPhone with advanced features',
            'price': Decimal('999.99'), 'base_price': Decimal('999.99'), 'cost_price': Decimal('750.00'),
            'stock': 25, 'min_stock_level': 10
        },
        {
            'name': 'Samsung Galaxy S24', 'sku': 'SGS24', 'barcode': '123456789002',
            'category': categories[0], 'subcategory': subcategories[0],
            'description': 'Premium Android smartphone',
            'price': Decimal('899.99'), 'base_price': Decimal('899.99'), 'cost_price': Decimal('650.00'),
            'stock': 15, 'min_stock_level': 10
        },
        {
            'name': 'Google Pixel 8', 'sku': 'GPX8', 'barcode': '123456789003',
            'category': categories[0], 'subcategory': subcategories[0],
            'description': 'Google\'s flagship smartphone',
            'price': Decimal('699.99'), 'base_price': Decimal('699.99'), 'cost_price': Decimal('500.00'),
            'stock': 5, 'min_stock_level': 10  # Low stock for testing alerts
        },
        
        # Electronics - Laptops
        {
            'name': 'MacBook Pro 16"', 'sku': 'MBP16', 'barcode': '123456789004',
            'category': categories[0], 'subcategory': subcategories[1],
            'description': 'Professional laptop for creators',
            'price': Decimal('2499.99'), 'base_price': Decimal('2499.99'), 'cost_price': Decimal('1800.00'),
            'stock': 8, 'min_stock_level': 5
        },
        {
            'name': 'Dell XPS 13', 'sku': 'DXPS13', 'barcode': '123456789005',
            'category': categories[0], 'subcategory': subcategories[1],
            'description': 'Compact and powerful laptop',
            'price': Decimal('1299.99'), 'base_price': Decimal('1299.99'), 'cost_price': Decimal('900.00'),
            'stock': 12, 'min_stock_level': 8
        },
        
        # Electronics - Headphones
        {
            'name': 'AirPods Pro', 'sku': 'APPRO', 'barcode': '123456789006',
            'category': categories[0], 'subcategory': subcategories[2],
            'description': 'Wireless earbuds with noise cancellation',
            'price': Decimal('249.99'), 'base_price': Decimal('249.99'), 'cost_price': Decimal('150.00'),
            'stock': 30, 'min_stock_level': 15
        },
        {
            'name': 'Sony WH-1000XM5', 'sku': 'SWXM5', 'barcode': '123456789007',
            'category': categories[0], 'subcategory': subcategories[2],
            'description': 'Premium noise-canceling headphones',
            'price': Decimal('399.99'), 'base_price': Decimal('399.99'), 'cost_price': Decimal('250.00'),
            'stock': 3, 'min_stock_level': 10  # Critical stock for testing
        },
        
        # Clothing - T-Shirts
        {
            'name': 'Cotton Basic Tee', 'sku': 'CBT001', 'barcode': '123456789008',
            'category': categories[1], 'subcategory': subcategories[3],
            'description': 'Comfortable cotton t-shirt',
            'price': Decimal('19.99'), 'base_price': Decimal('19.99'), 'cost_price': Decimal('8.00'),
            'stock': 50, 'min_stock_level': 20
        },
        {
            'name': 'Premium Polo Shirt', 'sku': 'PPS001', 'barcode': '123456789009',
            'category': categories[1], 'subcategory': subcategories[3],
            'description': 'High-quality polo shirt',
            'price': Decimal('39.99'), 'base_price': Decimal('39.99'), 'cost_price': Decimal('18.00'),
            'stock': 25, 'min_stock_level': 15
        },
        
        # Food & Beverages - Snacks
        {
            'name': 'Organic Trail Mix', 'sku': 'OTM001', 'barcode': '123456789010',
            'category': categories[2], 'subcategory': subcategories[6],
            'description': 'Healthy organic trail mix',
            'price': Decimal('8.99'), 'base_price': Decimal('8.99'), 'cost_price': Decimal('4.50'),
            'stock': 100, 'min_stock_level': 30
        },
    ]
    
    products = []
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(
            sku=prod_data['sku'],
            defaults=prod_data
        )
        products.append(product)
        if created:
            print(f"  ✅ Created product: {product.name} (Stock: {product.stock})")
    
    # Create Customers
    print("👤 Creating customers...")
    customers_data = [
        {
            'phone': '+1234567890', 'email': 'john.doe@email.com', 'name': 'John Doe',
            'loyalty_points': 450, 'tier': 'silver', 'total_spent': Decimal('1250.75')
        },
        {
            'phone': '+1234567891', 'email': 'jane.smith@email.com', 'name': 'Jane Smith',
            'loyalty_points': 120, 'tier': 'bronze', 'total_spent': Decimal('350.25')
        },
        {
            'phone': '+1234567892', 'email': 'bob.johnson@email.com', 'name': 'Bob Johnson',
            'loyalty_points': 800, 'tier': 'gold', 'total_spent': Decimal('2100.50')
        },
    ]
    
    customers = []
    for cust_data in customers_data:
        customer, created = Customer.objects.get_or_create(
            phone=cust_data['phone'],
            defaults=cust_data
        )
        customers.append(customer)
        if created:
            print(f"  ✅ Created customer: {customer.name}")
    
    # Create Transactions
    print("💳 Creating transactions...")
    
    # Create some recent transactions
    for i in range(10):
        days_ago = i
        transaction_date = timezone.now() - timedelta(days=days_ago)
        
        transaction = Transaction.objects.create(
            receipt_number=f'TXN{1000 + i:04d}',
            cashier=cashier_user,
            customer=customers[i % len(customers)],
            subtotal=Decimal('100.00') + Decimal(str(i * 25)),
            tax_amount=Decimal('8.00') + Decimal(str(i * 2)),
            total=Decimal('108.00') + Decimal(str(i * 27)),
            payment_method='card' if i % 2 == 0 else 'cash',
            status='completed',
            timestamp=transaction_date
        )
        
        # Add transaction items
        selected_products = products[i % len(products):i % len(products) + 2]
        for product in selected_products:
            TransactionItem.objects.create(
                transaction=transaction,
                product=product,
                quantity=1 + (i % 3),
                unit_price=product.price,
                total=product.price * (1 + (i % 3))
            )
        
        if i < 3:  # Only print first few
            print(f"  ✅ Created transaction: {transaction.receipt_number}")
    
    # Create some pending returns for manager approval
    print("🔄 Creating pending returns...")
    recent_transactions = Transaction.objects.filter(status='completed')[:3]
    for i, transaction in enumerate(recent_transactions):
        return_obj = Return.objects.create(
            original_transaction=transaction,
            reason=f'Defective item' if i % 2 == 0 else 'Customer changed mind',
            refund_amount=transaction.total * Decimal('0.8'),  # 80% refund
            status='pending'
        )
        print(f"  ✅ Created pending return: {return_obj.id}")
    
    # Create Advertisements
    print("📢 Creating advertisements...")
    ads_data = [
        {
            'title': 'Summer Electronics Sale',
            'description': 'Up to 30% off on all electronics',
            'is_active': True,
            'display_order': 1,
            'created_by': manager_user
        },
        {
            'title': 'New Arrivals in Fashion',
            'description': 'Check out our latest clothing collection',
            'is_active': True,
            'display_order': 2,
            'created_by': manager_user
        },
        {
            'title': 'Back to School Special',
            'description': 'Laptops and books at discounted prices',
            'is_active': True,
            'display_order': 3,
            'created_by': manager_user
        },
    ]
    
    for ad_data in ads_data:
        ad, created = Advertisement.objects.get_or_create(
            title=ad_data['title'],
            defaults=ad_data
        )
        if created:
            print(f"  ✅ Created advertisement: {ad.title}")
    
    print("\n🎉 Sample data creation completed!")
    print("\n📊 Summary:")
    print(f"  - Users: {User.objects.count()}")
    print(f"  - Stores: {Store.objects.count()}")
    print(f"  - Categories: {Category.objects.count()}")
    print(f"  - Subcategories: {SubCategory.objects.count()}")
    print(f"  - Products: {Product.objects.count()}")
    print(f"  - Customers: {Customer.objects.count()}")
    print(f"  - Transactions: {Transaction.objects.count()}")
    print(f"  - Pending Returns: {Return.objects.filter(status='pending').count()}")
    print(f"  - Advertisements: {Advertisement.objects.count()}")
    
    print("\n🔍 Low Stock Alerts:")
    low_stock = Product.objects.filter(stock__lte=5)
    for product in low_stock:
        print(f"  ⚠️  {product.name}: {product.stock} units (Min: {product.min_stock_level})")
    
    print("\n✅ Ready to test the real-time dashboard system!")

if __name__ == '__main__':
    create_sample_data()
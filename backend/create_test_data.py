#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from cashierdashboard.models import Category, SubCategory, Product

def create_test_data():
    print("Creating test data...")
    
    # Create categories
    electronics = Category.objects.get_or_create(name="Electronics")[0]
    clothing = Category.objects.get_or_create(name="Clothing")[0]
    books = Category.objects.get_or_create(name="Books")[0]
    
    print(f"Created categories: {electronics.name}, {clothing.name}, {books.name}")
    
    # Create subcategories
    phones = SubCategory.objects.get_or_create(name="Smartphones", category=electronics)[0]
    laptops = SubCategory.objects.get_or_create(name="Laptops", category=electronics)[0]
    shirts = SubCategory.objects.get_or_create(name="Shirts", category=clothing)[0]
    fiction = SubCategory.objects.get_or_create(name="Fiction", category=books)[0]
    
    print(f"Created subcategories: {phones.name}, {laptops.name}, {shirts.name}, {fiction.name}")
    
    # Create products
    products_data = [
        {
            'name': 'iPhone 15 Pro',
            'sku': 'IP15P001',
            'barcode': '123456789001',
            'category': electronics,
            'subcategory': phones,
            'description': 'Latest iPhone with advanced camera system',
            'price': 999.99,
            'base_price': 999.99,
            'cost_price': 750.00,
            'stock': 25,
            'stock_quantity': 25,
            'min_stock_level': 5
        },
        {
            'name': 'Samsung Galaxy S24',
            'sku': 'SGS24001',
            'barcode': '123456789002',
            'category': electronics,
            'subcategory': phones,
            'description': 'Premium Android smartphone with AI features',
            'price': 899.99,
            'base_price': 899.99,
            'cost_price': 650.00,
            'stock': 30,
            'stock_quantity': 30,
            'min_stock_level': 5
        },
        {
            'name': 'MacBook Pro 16"',
            'sku': 'MBP16001',
            'barcode': '123456789003',
            'category': electronics,
            'subcategory': laptops,
            'description': 'Professional laptop with M3 chip',
            'price': 2499.99,
            'base_price': 2499.99,
            'cost_price': 1800.00,
            'stock': 15,
            'stock_quantity': 15,
            'min_stock_level': 3
        },
        {
            'name': 'Cotton T-Shirt',
            'sku': 'CTS001',
            'barcode': '123456789004',
            'category': clothing,
            'subcategory': shirts,
            'description': 'Comfortable 100% cotton t-shirt',
            'price': 29.99,
            'base_price': 29.99,
            'cost_price': 15.00,
            'stock': 100,
            'stock_quantity': 100,
            'min_stock_level': 20
        },
        {
            'name': 'The Great Gatsby',
            'sku': 'TGG001',
            'barcode': '123456789005',
            'category': books,
            'subcategory': fiction,
            'description': 'Classic American novel by F. Scott Fitzgerald',
            'price': 14.99,
            'base_price': 14.99,
            'cost_price': 8.00,
            'stock': 50,
            'stock_quantity': 50,
            'min_stock_level': 10
        }
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            sku=product_data['sku'],
            defaults=product_data
        )
        if created:
            print(f"Created product: {product.name}")
        else:
            print(f"Product already exists: {product.name}")
    
    print("Test data creation completed!")
    print(f"Total categories: {Category.objects.count()}")
    print(f"Total subcategories: {SubCategory.objects.count()}")
    print(f"Total products: {Product.objects.count()}")

if __name__ == '__main__':
    create_test_data()
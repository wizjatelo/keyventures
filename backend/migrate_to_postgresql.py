#!/usr/bin/env python
"""
Migration script to help transition from SQLite to PostgreSQL
Run this script after setting up PostgreSQL database
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

def migrate_database():
    """Run database migrations"""
    print("🔄 Running database migrations...")
    
    # Make migrations for all apps
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    # Apply migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("✅ Database migrations completed!")

def create_superuser():
    """Create a superuser if it doesn't exist"""
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    if not User.objects.filter(username='admin').exists():
        print("👤 Creating superuser...")
        User.objects.create_superuser(
            username='admin',
            email='admin@linemart.com',
            password='admin123',
            role='admin'
        )
        print("✅ Superuser created: admin/admin123")
    else:
        print("ℹ️  Superuser already exists")

def create_sample_users():
    """Create sample users for testing"""
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Sample users data
    sample_users = [
        {
            'username': 'manager1',
            'email': 'manager@linemart.com',
            'password': 'manager123',
            'role': 'manager'
        },
        {
            'username': 'cashier1',
            'email': 'cashier@linemart.com',
            'password': 'cashier123',
            'role': 'cashier'
        },
        {
            'username': 'customer1',
            'email': 'customer@linemart.com',
            'password': 'customer123',
            'role': 'client'
        }
    ]
    
    print("👥 Creating sample users...")
    
    for user_data in sample_users:
        if not User.objects.filter(username=user_data['username']).exists():
            User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                role=user_data['role']
            )
            print(f"✅ Created {user_data['role']}: {user_data['username']}")
        else:
            print(f"ℹ️  User {user_data['username']} already exists")

def main():
    """Main migration function"""
    print("🚀 Starting PostgreSQL migration...")
    
    # Setup Django
    setup_django()
    
    # Run migrations
    migrate_database()
    
    # Create superuser
    create_superuser()
    
    # Create sample users
    create_sample_users()
    
    print("🎉 Migration completed successfully!")
    print("\n📋 Summary:")
    print("- Database migrated to PostgreSQL")
    print("- Superuser: admin/admin123")
    print("- Manager: manager1/manager123")
    print("- Cashier: cashier1/cashier123")
    print("- Customer: customer1/customer123")

if __name__ == '__main__':
    main()
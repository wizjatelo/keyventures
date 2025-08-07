#!/usr/bin/env python
"""
Script to create test users for LineMart authentication testing
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from member.models import CustomUser

def create_test_users():
    """Create test users for different roles"""
    
    # Delete existing test users if they exist
    test_usernames = ['testcashier', 'testmanager', 'testcustomer']
    CustomUser.objects.filter(username__in=test_usernames).delete()
    print("🗑️ Cleaned up existing test users")
    
    try:
        # Create a test cashier
        cashier = CustomUser.objects.create_user(
            username='testcashier',
            email='cashier@linemart.com',
            password='testpass123',
            role='cashier',
            first_name='Test',
            last_name='Cashier',
            is_approved=True,
            cashier_secret_key='CASHIER123'
        )
        print(f"✅ Created cashier: {cashier.username} (Key: {cashier.cashier_secret_key})")
        
        # Create a test manager
        manager = CustomUser.objects.create_user(
            username='testmanager',
            email='manager@linemart.com',
            password='testpass123',
            role='manager',
            first_name='Test',
            last_name='Manager',
            is_approved=True
        )
        print(f"✅ Created manager: {manager.username}")
        
        # Create a test customer
        customer = CustomUser.objects.create_user(
            username='testcustomer',
            email='customer@linemart.com',
            password='testpass123',
            role='customer',
            first_name='Test',
            last_name='Customer',
            is_approved=True
        )
        print(f"✅ Created customer: {customer.username}")
        
        print("\n🎉 All test users created successfully!")
        print("\n📋 Login Credentials:")
        print("=" * 50)
        print("CASHIER LOGIN:")
        print("  Username: testcashier")
        print("  Password: testpass123")
        print("  Cashier Key: CASHIER123")
        print()
        print("MANAGER LOGIN:")
        print("  Username: testmanager")
        print("  Password: testpass123")
        print()
        print("CUSTOMER LOGIN:")
        print("  Username: testcustomer")
        print("  Password: testpass123")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("🚀 Creating LineMart test users...")
    success = create_test_users()
    if success:
        print("\n✅ Setup complete! You can now test the authentication system.")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
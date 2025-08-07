#!/usr/bin/env python3
"""
API Endpoint Testing Script for LineMart
Tests all major API endpoints to verify implementation
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_endpoint(method, endpoint, data=None, headers=None):
    """Test an API endpoint and return the result"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        
        return {
            'status_code': response.status_code,
            'success': response.status_code < 400,
            'data': response.json() if response.content else None,
            'error': None
        }
    except requests.exceptions.ConnectionError:
        return {
            'status_code': None,
            'success': False,
            'data': None,
            'error': 'Connection refused - Server not running'
        }
    except Exception as e:
        return {
            'status_code': None,
            'success': False,
            'data': None,
            'error': str(e)
        }

def print_result(endpoint, result):
    """Print test result in a formatted way"""
    status = "✅ PASS" if result['success'] else "❌ FAIL"
    print(f"{status} {endpoint} - Status: {result['status_code']}")
    if result['error']:
        print(f"    Error: {result['error']}")
    elif result['data'] and isinstance(result['data'], dict) and 'error' in result['data']:
        print(f"    API Error: {result['data']['error']}")

def main():
    print("🧪 LineMart API Endpoint Testing")
    print("=" * 50)
    
    # Test basic connectivity
    print("\n📡 Testing Server Connectivity...")
    result = test_endpoint('GET', '/cashier/categories/')
    if not result['success'] and result['error'] == 'Connection refused - Server not running':
        print("❌ Server is not running. Please start the Django server first:")
        print("   cd backend && python manage.py runserver")
        sys.exit(1)
    
    # Authentication Endpoints
    print("\n🔐 Testing Authentication Endpoints...")
    auth_endpoints = [
        ('POST', '/auth/customer/login/'),
        ('POST', '/auth/customer/register/'),
        ('POST', '/auth/cashier/login/'),
        ('POST', '/auth/manager/login/'),
        ('POST', '/auth/logout/'),
    ]
    
    for method, endpoint in auth_endpoints:
        result = test_endpoint(method, endpoint, {})
        print_result(endpoint, result)
    
    # Cashier Dashboard Endpoints
    print("\n🏪 Testing Cashier Dashboard Endpoints...")
    cashier_endpoints = [
        ('GET', '/cashier/categories/'),
        ('GET', '/cashier/subcategories/'),
        ('GET', '/cashier/products/'),
        ('GET', '/cashier/transactions/'),
        ('GET', '/cashier/customers/'),
        ('GET', '/cashier/advertisements/'),
        ('GET', '/cashier/stores/'),
    ]
    
    for method, endpoint in cashier_endpoints:
        result = test_endpoint(method, endpoint)
        print_result(endpoint, result)
    
    # Customer Dashboard Endpoints
    print("\n👥 Testing Customer Dashboard Endpoints...")
    customer_endpoints = [
        ('GET', '/customer/categories/'),
        ('GET', '/customer/subcategories/'),
        ('GET', '/customer/products/'),
        ('GET', '/customer/advertisements/'),
        ('GET', '/customer/stores/'),
    ]
    
    for method, endpoint in customer_endpoints:
        result = test_endpoint(method, endpoint)
        print_result(endpoint, result)
    
    # Manager Dashboard Endpoints
    print("\n👔 Testing Manager Dashboard Endpoints...")
    manager_endpoints = [
        ('GET', '/manager/dashboard/'),
        ('GET', '/manager/users/'),
        ('GET', '/manager/products/'),
        ('GET', '/manager/stores/'),
    ]
    
    for method, endpoint in manager_endpoints:
        result = test_endpoint(method, endpoint)
        print_result(endpoint, result)
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\nNote: Some endpoints may return 401/403 errors due to authentication requirements.")
    print("This is expected behavior for protected endpoints.")

if __name__ == "__main__":
    main()
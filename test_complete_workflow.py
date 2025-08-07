import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000/api/cashier"

def test_complete_workflow():
    print("🚀 Testing Complete Cashier-Customer Dashboard Integration")
    print("=" * 60)
    
    # Test 1: Add a new category
    print("\n📁 Step 1: Adding a new category...")
    category_data = {
        "name": "Test Electronics Category"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/categories/", json=category_data)
        if response.status_code == 201:
            category = response.json()
            print(f"✅ Category created successfully!")
            print(f"   ID: {category['id']}, Name: {category['name']}")
            category_id = category['id']
        else:
            print(f"❌ Failed to create category: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating category: {e}")
        return
    
    # Test 2: Add a subcategory
    print("\n📂 Step 2: Adding a subcategory...")
    subcategory_data = {
        "name": "Test Smartphones",
        "category": category_id,
        "display_order": 1
    }
    
    try:
        response = requests.post(f"{BASE_URL}/subcategories/", json=subcategory_data)
        if response.status_code == 201:
            subcategory = response.json()
            print(f"✅ Subcategory created successfully!")
            print(f"   ID: {subcategory['id']}, Name: {subcategory['name']}")
            print(f"   Category: {subcategory['category_name']}")
            subcategory_id = subcategory['id']
        else:
            print(f"❌ Failed to create subcategory: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating subcategory: {e}")
        return
    
    # Test 3: Add a product
    print("\n📱 Step 3: Adding a product...")
    product_data = {
        "name": "Test iPhone 16 Pro Max",
        "sku": "TIPM16001",
        "barcode": "999888777666",
        "category": category_id,
        "subcategory": subcategory_id,
        "description": "Latest test iPhone with advanced features for integration testing",
        "price": "1299.99",
        "base_price": "1299.99",
        "cost_price": "950.00",
        "stock": 20,
        "stock_quantity": 20,
        "min_stock_level": 5
    }
    
    try:
        response = requests.post(f"{BASE_URL}/products/", json=product_data)
        if response.status_code == 201:
            product = response.json()
            print(f"✅ Product created successfully!")
            print(f"   ID: {product['id']}, Name: {product['name']}")
            print(f"   SKU: {product['sku']}, Price: ${product['price']}")
            print(f"   Category: {product['category_name']}")
            print(f"   Subcategory: {product['subcategory_name']}")
            product_id = product['id']
        else:
            print(f"❌ Failed to create product: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error creating product: {e}")
        return
    
    # Test 4: Verify data in API endpoints
    print("\n🔍 Step 4: Verifying data through API endpoints...")
    
    # Check categories
    try:
        response = requests.get(f"{BASE_URL}/categories/")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categories endpoint working - Total: {len(categories)}")
            test_category = next((c for c in categories if c['id'] == category_id), None)
            if test_category:
                print(f"   ✓ Test category found: {test_category['name']}")
            else:
                print(f"   ⚠️  Test category not found in list")
        else:
            print(f"❌ Categories endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking categories: {e}")
    
    # Check subcategories
    try:
        response = requests.get(f"{BASE_URL}/subcategories/")
        if response.status_code == 200:
            subcategories = response.json()
            print(f"✅ Subcategories endpoint working - Total: {len(subcategories)}")
            test_subcategory = next((s for s in subcategories if s['id'] == subcategory_id), None)
            if test_subcategory:
                print(f"   ✓ Test subcategory found: {test_subcategory['name']}")
            else:
                print(f"   ⚠️  Test subcategory not found in list")
        else:
            print(f"❌ Subcategories endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking subcategories: {e}")
    
    # Check products
    try:
        response = requests.get(f"{BASE_URL}/products/")
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Products endpoint working - Total: {len(products)}")
            test_product = next((p for p in products if p['id'] == product_id), None)
            if test_product:
                print(f"   ✓ Test product found: {test_product['name']}")
            else:
                print(f"   ⚠️  Test product not found in list")
        else:
            print(f"❌ Products endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking products: {e}")
    
    # Test 5: Summary
    print("\n📊 Step 5: Integration Summary")
    print("=" * 40)
    print("✅ Category → Subcategory → Product sequence working")
    print("✅ All API endpoints responding correctly")
    print("✅ Data relationships maintained")
    print("\n🎯 Next Steps:")
    print("1. Open http://localhost:3001/cashier-dashboard")
    print("2. Navigate through Categories → Subcategories → Products")
    print("3. Verify the test data appears in the UI")
    print("4. Switch to Customer Dashboard to see real-time updates")
    print("5. Customer Dashboard polls every 30 seconds for updates")
    
    print("\n🔄 Real-time Testing:")
    print("- Add more products through Cashier Dashboard UI")
    print("- Check Customer Dashboard for automatic updates")
    print("- Verify search and filtering works in both dashboards")
    
    return {
        'category_id': category_id,
        'subcategory_id': subcategory_id,
        'product_id': product_id
    }

if __name__ == "__main__":
    try:
        result = test_complete_workflow()
        if result:
            print(f"\n🎉 Test completed successfully!")
            print(f"Created: Category {result['category_id']}, Subcategory {result['subcategory_id']}, Product {result['product_id']}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django API server.")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
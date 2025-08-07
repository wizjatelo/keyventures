import requests
import json

# API endpoint
url = "http://localhost:8000/api/cashier/products/"

# New product data
new_product = {
    "name": "Test Product from API",
    "sku": "TEST001",
    "barcode": "999999999999",
    "category": 1,  # Electronics
    "subcategory": 1,  # Smartphones
    "description": "This is a test product added via API to verify real-time updates",
    "price": "199.99",
    "base_price": "199.99",
    "cost_price": "150.00",
    "stock": 10,
    "stock_quantity": 10,
    "min_stock_level": 2
}

try:
    # Add the product
    response = requests.post(url, json=new_product)
    
    if response.status_code == 201:
        print("✅ Product added successfully!")
        print("Product details:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Failed to add product. Status code: {response.status_code}")
        print("Response:", response.text)
        
    # Fetch all products to verify
    print("\n" + "="*50)
    print("Fetching all products to verify...")
    
    get_response = requests.get(url)
    if get_response.status_code == 200:
        products = get_response.json()
        print(f"Total products: {len(products)}")
        print("\nLatest products:")
        for product in products[-3:]:  # Show last 3 products
            print(f"- {product['name']} (SKU: {product['sku']}) - ${product['price']}")
    else:
        print(f"Failed to fetch products. Status code: {get_response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to the API. Make sure the Django server is running on http://localhost:8000")
except Exception as e:
    print(f"❌ Error: {e}")
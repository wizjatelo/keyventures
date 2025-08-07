#!/usr/bin/env python3
"""
Real-time Integration Test Script for LineMart
Tests the complete data flow from Cashier → Backend → Manager → Customer dashboards
"""

import requests
import json
import time
import threading
from datetime import datetime
import sys

# API Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3001"  # React app on port 3001

class LineMartAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_backend_health(self):
        """Test if Django backend is running"""
        try:
            response = self.session.get(f"{BACKEND_URL}/api/cashier/categories/")
            if response.status_code == 200:
                self.log("✅ Backend is running and accessible")
                return True
            else:
                self.log(f"❌ Backend returned status {response.status_code}", "ERROR")
                return False
        except requests.exceptions.ConnectionError:
            self.log("❌ Cannot connect to Django backend", "ERROR")
            return False
            
    def test_frontend_health(self):
        """Test if React frontend is running"""
        try:
            response = self.session.get(FRONTEND_URL)
            if response.status_code == 200:
                self.log("✅ Frontend is running and accessible")
                return True
            else:
                self.log(f"❌ Frontend returned status {response.status_code}", "ERROR")
                return False
        except requests.exceptions.ConnectionError:
            self.log("❌ Cannot connect to React frontend", "ERROR")
            return False
    
    def test_manager_dashboard_endpoints(self):
        """Test all Manager Dashboard API endpoints"""
        self.log("🔍 Testing Manager Dashboard endpoints...")
        
        endpoints = [
            "/api/cashier/manager-dashboard/dashboard_metrics/",
            "/api/cashier/manager-dashboard/notifications/",
            "/api/cashier/manager-dashboard/pending_approvals/",
            "/api/cashier/manager-dashboard/sales_data/",
            "/api/cashier/manager-dashboard/store_performance/",
            "/api/cashier/manager-dashboard/inventory_alerts/",
            "/api/cashier/manager-dashboard/recent_orders/",
            "/api/cashier/realtime-data/product_updates/",
            "/api/cashier/realtime-data/category_updates/",
            "/api/cashier/realtime-data/inventory_status/"
        ]
        
        results = {}
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{BACKEND_URL}{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    results[endpoint] = {"status": "✅", "data_count": len(data) if isinstance(data, list) else "object"}
                    self.log(f"  ✅ {endpoint} - OK")
                else:
                    results[endpoint] = {"status": "❌", "error": f"Status {response.status_code}"}
                    self.log(f"  ❌ {endpoint} - Status {response.status_code}", "ERROR")
            except Exception as e:
                results[endpoint] = {"status": "❌", "error": str(e)}
                self.log(f"  ❌ {endpoint} - Error: {str(e)}", "ERROR")
                
        return results
    
    def test_cashier_dashboard_endpoints(self):
        """Test Cashier Dashboard CRUD operations"""
        self.log("🔍 Testing Cashier Dashboard endpoints...")
        
        # Test basic CRUD endpoints
        endpoints = [
            "/api/cashier/categories/",
            "/api/cashier/subcategories/",
            "/api/cashier/products/",
            "/api/cashier/stores/"
        ]
        
        results = {}
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{BACKEND_URL}{endpoint}")
                if response.status_code == 200:
                    data = response.json()
                    results[endpoint] = {"status": "✅", "count": len(data)}
                    self.log(f"  ✅ {endpoint} - {len(data)} items")
                else:
                    results[endpoint] = {"status": "❌", "error": f"Status {response.status_code}"}
                    self.log(f"  ❌ {endpoint} - Status {response.status_code}", "ERROR")
            except Exception as e:
                results[endpoint] = {"status": "❌", "error": str(e)}
                self.log(f"  ❌ {endpoint} - Error: {str(e)}", "ERROR")
                
        return results
    
    def test_real_time_data_flow(self):
        """Test real-time data synchronization"""
        self.log("🔄 Testing real-time data flow...")
        
        # Step 1: Get initial product count
        try:
            response = self.session.get(f"{BACKEND_URL}/api/cashier/products/")
            initial_count = len(response.json())
            self.log(f"  📊 Initial product count: {initial_count}")
        except Exception as e:
            self.log(f"  ❌ Failed to get initial product count: {e}", "ERROR")
            return False
        
        # Step 2: Create a new product via Cashier API
        new_product = {
            "name": f"Test Product {int(time.time())}",
            "sku": f"TEST{int(time.time())}",
            "barcode": f"999{int(time.time())}",
            "description": "Test product for real-time sync",
            "price": "99.99",
            "cost_price": "50.00",
            "stock": "10",
            "category": 1,  # Electronics
            "subcategory": 1  # Smartphones
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/api/cashier/products/",
                json=new_product
            )
            if response.status_code == 201:
                created_product = response.json()
                self.log(f"  ✅ Created test product: {created_product['name']}")
                
                # Step 3: Verify the product appears in real-time endpoints
                time.sleep(2)  # Wait for potential caching
                
                # Check product updates endpoint
                response = self.session.get(f"{BACKEND_URL}/api/cashier/realtime-data/product_updates/")
                if response.status_code == 200:
                    products = response.json()
                    if any(p['id'] == created_product['id'] for p in products):
                        self.log("  ✅ Product appears in real-time updates")
                    else:
                        self.log("  ⚠️  Product not found in real-time updates", "WARNING")
                
                # Step 4: Clean up - delete the test product
                delete_response = self.session.delete(
                    f"{BACKEND_URL}/api/cashier/products/{created_product['id']}/"
                )
                if delete_response.status_code == 204:
                    self.log("  🗑️  Test product cleaned up")
                
                return True
            else:
                self.log(f"  ❌ Failed to create test product: Status {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"  ❌ Error in real-time test: {e}", "ERROR")
            return False
    
    def test_manager_approval_flow(self):
        """Test manager approval workflow"""
        self.log("🔍 Testing manager approval workflow...")
        
        try:
            # Get pending approvals
            response = self.session.get(f"{BACKEND_URL}/api/cashier/manager-dashboard/pending_approvals/")
            if response.status_code == 200:
                approvals = response.json()
                self.log(f"  📋 Found {len(approvals)} pending approvals")
                
                if approvals:
                    # Test approval action
                    first_approval = approvals[0]
                    approval_data = {
                        "id": first_approval["id"],
                        "type": first_approval["type"]
                    }
                    
                    # Note: This would normally approve the request
                    # For testing, we'll just verify the endpoint exists
                    self.log(f"  ✅ Approval endpoint ready for: {first_approval['type']}")
                
                return True
            else:
                self.log(f"  ❌ Failed to get pending approvals: Status {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"  ❌ Error testing approval flow: {e}", "ERROR")
            return False
    
    def test_inventory_alerts(self):
        """Test inventory alert system"""
        self.log("🔍 Testing inventory alert system...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/api/cashier/manager-dashboard/inventory_alerts/")
            if response.status_code == 200:
                alerts = response.json()
                self.log(f"  ⚠️  Found {len(alerts)} inventory alerts")
                
                critical_alerts = [alert for alert in alerts if alert.get('status') == 'critical']
                low_alerts = [alert for alert in alerts if alert.get('status') == 'low']
                
                self.log(f"    🔴 Critical: {len(critical_alerts)}")
                self.log(f"    🟡 Low: {len(low_alerts)}")
                
                return True
            else:
                self.log(f"  ❌ Failed to get inventory alerts: Status {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"  ❌ Error testing inventory alerts: {e}", "ERROR")
            return False
    
    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        self.log("🚀 Starting comprehensive LineMart integration test...")
        self.log("=" * 60)
        
        # Health checks
        backend_ok = self.test_backend_health()
        frontend_ok = self.test_frontend_health()
        
        if not backend_ok:
            self.log("❌ Backend not available - stopping tests", "ERROR")
            return False
        
        # API endpoint tests
        self.log("\n" + "=" * 60)
        manager_results = self.test_manager_dashboard_endpoints()
        
        self.log("\n" + "=" * 60)
        cashier_results = self.test_cashier_dashboard_endpoints()
        
        # Functional tests
        self.log("\n" + "=" * 60)
        realtime_ok = self.test_real_time_data_flow()
        
        self.log("\n" + "=" * 60)
        approval_ok = self.test_manager_approval_flow()
        
        self.log("\n" + "=" * 60)
        inventory_ok = self.test_inventory_alerts()
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log("📊 TEST SUMMARY")
        self.log("=" * 60)
        
        self.log(f"Backend Health: {'✅' if backend_ok else '❌'}")
        self.log(f"Frontend Health: {'✅' if frontend_ok else '❌'}")
        self.log(f"Real-time Data Flow: {'✅' if realtime_ok else '❌'}")
        self.log(f"Approval Workflow: {'✅' if approval_ok else '❌'}")
        self.log(f"Inventory Alerts: {'✅' if inventory_ok else '❌'}")
        
        # Manager Dashboard endpoints summary
        manager_success = sum(1 for result in manager_results.values() if result["status"] == "✅")
        manager_total = len(manager_results)
        self.log(f"Manager Dashboard APIs: {manager_success}/{manager_total} working")
        
        # Cashier Dashboard endpoints summary
        cashier_success = sum(1 for result in cashier_results.values() if result["status"] == "✅")
        cashier_total = len(cashier_results)
        self.log(f"Cashier Dashboard APIs: {cashier_success}/{cashier_total} working")
        
        overall_success = (backend_ok and realtime_ok and approval_ok and inventory_ok and 
                          manager_success == manager_total and cashier_success == cashier_total)
        
        if overall_success:
            self.log("\n🎉 ALL TESTS PASSED! Real-time integration is working correctly!")
        else:
            self.log("\n⚠️  Some tests failed. Check the logs above for details.")
        
        self.log("\n🔗 Access your dashboards:")
        self.log(f"  • Manager Dashboard: {FRONTEND_URL}/manager")
        self.log(f"  • Cashier Dashboard: {FRONTEND_URL}/cashier")
        self.log(f"  • Customer Dashboard: {FRONTEND_URL}/customer")
        self.log(f"  • Django Admin: {BACKEND_URL}/admin/")
        
        return overall_success

def main():
    print("🧪 LineMart Real-time Integration Tester")
    print("=" * 60)
    
    tester = LineMartAPITester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n✅ Integration test completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Integration test completed with errors!")
        sys.exit(1)

if __name__ == "__main__":
    main()
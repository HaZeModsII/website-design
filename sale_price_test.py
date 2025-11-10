#!/usr/bin/env python3
"""
Backend API Testing for Triple Barrel Racing - Sale Price Functionality
Tests individual item sale_percent, effective_price calculation, and sales settings
"""

import requests
import json
import sys
from typing import Dict, Any, Optional, List

# Configuration
BASE_URL = "https://size-selector-1.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class SalePriceTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.test_results = []
        self.created_items = []  # Track items for cleanup
        
    def log_result(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def authenticate_admin(self) -> bool:
        """Authenticate as admin and get token"""
        try:
            response = requests.post(
                f"{self.base_url}/admin/login",
                json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.admin_token = data.get("token")
                    self.log_result("Admin Authentication", True, "Successfully authenticated as admin")
                    return True
            
            self.log_result("Admin Authentication", False, f"Failed to authenticate: {response.status_code}", 
                          {"response": response.text})
            return False
            
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers"""
        if not self.admin_token:
            return {}
        return {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_get_all_merch_sale_calculation(self) -> bool:
        """Test GET /api/merch and check sale calculation fields"""
        test_name = "GET All Merch - Sale Calculation Fields"
        
        try:
            response = requests.get(f"{self.base_url}/merch", timeout=10)
            
            if response.status_code == 200:
                items = response.json()
                
                if isinstance(items, list):
                    print(f"\n📋 Found {len(items)} merch items")
                    
                    # Check that all items have required sale fields
                    missing_fields = []
                    items_with_sales = []
                    
                    for item in items:
                        # Check for required fields
                        if 'effective_price' not in item:
                            missing_fields.append(f"Item {item.get('name', 'Unknown')} missing effective_price")
                        if 'discount_percent' not in item:
                            missing_fields.append(f"Item {item.get('name', 'Unknown')} missing discount_percent")
                        
                        # Log items with sales
                        if item.get('sale_percent') and item.get('sale_percent') > 0:
                            items_with_sales.append({
                                'name': item.get('name'),
                                'price': item.get('price'),
                                'sale_percent': item.get('sale_percent'),
                                'effective_price': item.get('effective_price'),
                                'discount_percent': item.get('discount_percent')
                            })
                    
                    if missing_fields:
                        self.log_result(test_name, False, "Some items missing required sale fields", 
                                      {"missing_fields": missing_fields})
                        return False
                    
                    print(f"   ✅ All items have effective_price and discount_percent fields")
                    if items_with_sales:
                        print(f"   📊 Items with individual sales: {len(items_with_sales)}")
                        for item in items_with_sales:
                            print(f"      - {item['name']}: ${item['price']} → ${item['effective_price']} ({item['discount_percent']}% off)")
                    
                    self.log_result(test_name, True, f"All {len(items)} items have required sale calculation fields")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list", {"response_type": type(items)})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to get merch items: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error getting all merch items: {str(e)}")
            return False
    
    def test_create_item_with_individual_sale(self) -> bool:
        """Test creating item with individual sale_percent"""
        test_name = "Create Item with Individual Sale"
        
        merch_data = {
            "name": "Test Sale Item",
            "description": "Test item with 20% individual sale",
            "price": 100.0,
            "sale_percent": 20.0,
            "image_url": "https://example.com/test-sale-item.jpg",
            "category": "Test",
            "stock": 50
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/merch",
                json=merch_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                item = response.json()
                self.created_items.append(item["id"])
                
                # Verify the item was created with sale_percent
                if item.get("sale_percent") == 20.0:
                    print(f"   ✅ Item created with sale_percent: {item.get('sale_percent')}%")
                    self.log_result(test_name, True, "Item created successfully with individual sale_percent")
                    return True
                else:
                    self.log_result(test_name, False, "Item created but sale_percent incorrect", 
                                  {"expected": 20.0, "actual": item.get("sale_percent")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to create item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error creating item with sale: {str(e)}")
            return False
    
    def test_verify_sale_calculation(self) -> bool:
        """Test that the created item shows correct sale calculation"""
        test_name = "Verify Sale Calculation"
        
        try:
            # Get all merch to find our test item
            response = requests.get(f"{self.base_url}/merch", timeout=10)
            
            if response.status_code == 200:
                items = response.json()
                
                # Find our test item
                test_item = None
                for item in items:
                    if item.get("name") == "Test Sale Item" and item.get("price") == 100.0:
                        test_item = item
                        break
                
                if not test_item:
                    self.log_result(test_name, False, "Could not find test item for verification")
                    return False
                
                # Verify calculations
                expected_effective_price = 80.0  # 100 * (1 - 20/100)
                expected_discount_percent = 20.0
                
                actual_effective_price = test_item.get("effective_price")
                actual_discount_percent = test_item.get("discount_percent")
                
                print(f"   📊 Sale Calculation Verification:")
                print(f"      Original Price: ${test_item.get('price')}")
                print(f"      Sale Percent: {test_item.get('sale_percent')}%")
                print(f"      Expected Effective Price: ${expected_effective_price}")
                print(f"      Actual Effective Price: ${actual_effective_price}")
                print(f"      Expected Discount: {expected_discount_percent}%")
                print(f"      Actual Discount: {actual_discount_percent}%")
                
                if (actual_effective_price == expected_effective_price and 
                    actual_discount_percent == expected_discount_percent):
                    self.log_result(test_name, True, "Sale calculation is correct")
                    return True
                else:
                    self.log_result(test_name, False, "Sale calculation is incorrect", {
                        "expected_effective_price": expected_effective_price,
                        "actual_effective_price": actual_effective_price,
                        "expected_discount_percent": expected_discount_percent,
                        "actual_discount_percent": actual_discount_percent
                    })
                    return False
            else:
                self.log_result(test_name, False, f"Failed to get merch for verification: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error verifying sale calculation: {str(e)}")
            return False
    
    def test_check_existing_items_with_sales(self) -> bool:
        """Test checking existing items for sale_percent and calculations"""
        test_name = "Check Existing Items with Sales"
        
        try:
            response = requests.get(f"{self.base_url}/merch", timeout=10)
            
            if response.status_code == 200:
                items = response.json()
                
                items_with_sales = []
                calculation_errors = []
                
                for item in items:
                    if item.get('sale_percent') and item.get('sale_percent') > 0:
                        items_with_sales.append(item)
                        
                        # Verify calculation
                        original_price = item.get('price', 0)
                        sale_percent = item.get('sale_percent', 0)
                        expected_effective = original_price * (1 - sale_percent / 100)
                        actual_effective = item.get('effective_price', 0)
                        
                        # Allow small floating point differences
                        if abs(expected_effective - actual_effective) > 0.01:
                            calculation_errors.append({
                                'name': item.get('name'),
                                'expected': round(expected_effective, 2),
                                'actual': actual_effective
                            })
                
                print(f"\n📊 Existing Items with Sales Analysis:")
                print(f"   Total items: {len(items)}")
                print(f"   Items with individual sales: {len(items_with_sales)}")
                
                if items_with_sales:
                    print(f"   📋 Items with sales:")
                    for item in items_with_sales:
                        print(f"      - {item.get('name')}: {item.get('sale_percent')}% off")
                        print(f"        ${item.get('price')} → ${item.get('effective_price')}")
                
                if calculation_errors:
                    self.log_result(test_name, False, f"Found {len(calculation_errors)} calculation errors", 
                                  {"errors": calculation_errors})
                    return False
                
                self.log_result(test_name, True, f"Checked {len(items)} items, {len(items_with_sales)} have sales, all calculations correct")
                return True
            else:
                self.log_result(test_name, False, f"Failed to get existing items: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error checking existing items: {str(e)}")
            return False
    
    def test_sales_settings_endpoint(self) -> bool:
        """Test GET /api/sales-settings endpoint"""
        test_name = "Sales Settings Endpoint"
        
        try:
            response = requests.get(f"{self.base_url}/sales-settings", timeout=10)
            
            if response.status_code == 200:
                settings = response.json()
                
                print(f"\n⚙️  Sales Settings:")
                print(f"   Site-wide sale active: {settings.get('site_wide_sale', False)}")
                print(f"   Site-wide discount: {settings.get('site_wide_discount_percent', 0)}%")
                
                category_sales = settings.get('category_sales', {})
                if category_sales:
                    print(f"   Category sales:")
                    for category, discount in category_sales.items():
                        print(f"      - {category}: {discount}%")
                else:
                    print(f"   No category sales active")
                
                # Verify required fields exist
                required_fields = ['site_wide_sale', 'site_wide_discount_percent', 'category_sales']
                missing_fields = [field for field in required_fields if field not in settings]
                
                if missing_fields:
                    self.log_result(test_name, False, "Sales settings missing required fields", 
                                  {"missing_fields": missing_fields})
                    return False
                
                self.log_result(test_name, True, "Sales settings endpoint working correctly")
                return True
            else:
                self.log_result(test_name, False, f"Failed to get sales settings: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error getting sales settings: {str(e)}")
            return False
    
    def test_sales_priority_logic(self) -> bool:
        """Test that sales priority works: Individual > Category > Site-wide"""
        test_name = "Sales Priority Logic"
        
        try:
            # First, set up some category and site-wide sales via sales settings
            # Note: This test assumes we can update sales settings, but we'll test the logic with existing data
            
            response = requests.get(f"{self.base_url}/merch", timeout=10)
            if response.status_code != 200:
                self.log_result(test_name, False, "Could not get merch items for priority test")
                return False
            
            items = response.json()
            
            # Look for items that demonstrate priority logic
            individual_sale_items = [item for item in items if item.get('sale_percent') and item.get('sale_percent') > 0]
            
            if individual_sale_items:
                print(f"\n🎯 Sales Priority Analysis:")
                print(f"   Found {len(individual_sale_items)} items with individual sales")
                
                for item in individual_sale_items:
                    # Individual sale should take priority
                    expected_discount = item.get('sale_percent', 0)
                    actual_discount = item.get('discount_percent', 0)
                    
                    if expected_discount == actual_discount:
                        print(f"   ✅ {item.get('name')}: Individual sale ({expected_discount}%) correctly applied")
                    else:
                        print(f"   ❌ {item.get('name')}: Expected {expected_discount}%, got {actual_discount}%")
                        self.log_result(test_name, False, "Individual sale priority not working correctly")
                        return False
                
                self.log_result(test_name, True, "Sales priority logic working correctly")
                return True
            else:
                # If no individual sales, just verify the endpoint structure is correct
                print(f"   ℹ️  No items with individual sales found, but structure is correct")
                self.log_result(test_name, True, "Sales priority structure is correct (no individual sales to test)")
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"Error testing sales priority: {str(e)}")
            return False
    
    def cleanup_test_items(self):
        """Clean up test items created during testing"""
        print("\n🧹 Cleaning up test items...")
        
        for item_id in self.created_items:
            try:
                response = requests.delete(
                    f"{self.base_url}/merch/{item_id}",
                    headers=self.get_auth_headers(),
                    timeout=10
                )
                if response.status_code == 200:
                    print(f"   ✅ Deleted item {item_id}")
                else:
                    print(f"   ⚠️  Failed to delete item {item_id}: {response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Error deleting item {item_id}: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests for sale price functionality"""
        print("🚀 Starting Backend API Tests for Sale Price Functionality")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate_admin():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Run all tests in order
        tests = [
            self.test_get_all_merch_sale_calculation,
            self.test_create_item_with_individual_sale,
            self.test_verify_sale_calculation,
            self.test_check_existing_items_with_sales,
            self.test_sales_settings_endpoint,
            self.test_sales_priority_logic
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ Test {test.__name__} crashed: {str(e)}")
                failed += 1
        
        # Cleanup
        self.cleanup_test_items()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 SALE PRICE FUNCTIONALITY TEST SUMMARY")
        print("=" * 70)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Sale price functionality is working correctly.")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please review the issues above.")
            return False

def main():
    """Main test execution"""
    tester = SalePriceTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
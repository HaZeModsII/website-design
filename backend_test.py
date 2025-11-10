#!/usr/bin/env python3
"""
Backend API Testing for Triple Barrel Racing - Sizes Field Implementation
Tests the new optional sizes field for merch items
"""

import requests
import json
import sys
from typing import Dict, Any, Optional, List

# Configuration
BASE_URL = "https://missing-size-field.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class BackendTester:
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
    
    def test_create_merch_with_sizes(self) -> bool:
        """Test creating merch item WITH sizes"""
        test_name = "Create Merch Item WITH Sizes"
        
        merch_data = {
            "name": "Racing T-Shirt with Sizes",
            "description": "Premium racing t-shirt available in multiple sizes",
            "price": 29.99,
            "image_url": "https://example.com/racing-tshirt.jpg",
            "category": "Apparel",
            "stock": 50,
            "sizes": ["S", "M", "L", "XL"]
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
                
                # Verify sizes field is present and correct
                if "sizes" in item and item["sizes"] == ["S", "M", "L", "XL"]:
                    self.log_result(test_name, True, "Item created successfully with sizes")
                    return True
                else:
                    self.log_result(test_name, False, "Item created but sizes field incorrect", 
                                  {"expected_sizes": ["S", "M", "L", "XL"], "actual_sizes": item.get("sizes")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to create item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error creating item with sizes: {str(e)}")
            return False
    
    def test_create_merch_without_sizes(self) -> bool:
        """Test creating merch item WITHOUT sizes"""
        test_name = "Create Merch Item WITHOUT Sizes"
        
        merch_data = {
            "name": "Racing Sticker Pack",
            "description": "Collection of racing stickers - no size needed",
            "price": 9.99,
            "image_url": "https://example.com/sticker-pack.jpg",
            "category": "Accessories",
            "stock": 100
            # Note: No sizes field included
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
                
                # Verify sizes field is None or not present
                sizes = item.get("sizes")
                if sizes is None or sizes == []:
                    self.log_result(test_name, True, "Item created successfully without sizes")
                    return True
                else:
                    self.log_result(test_name, False, "Item created but has unexpected sizes field", 
                                  {"unexpected_sizes": sizes})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to create item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error creating item without sizes: {str(e)}")
            return False
    
    def test_create_merch_with_null_sizes(self) -> bool:
        """Test creating merch item with explicit null sizes"""
        test_name = "Create Merch Item WITH Null Sizes"
        
        merch_data = {
            "name": "Racing Keychain",
            "description": "Metal racing keychain - one size fits all",
            "price": 12.99,
            "image_url": "https://example.com/keychain.jpg",
            "category": "Accessories",
            "stock": 75,
            "sizes": None
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
                
                # Verify sizes field is None
                if item.get("sizes") is None:
                    self.log_result(test_name, True, "Item created successfully with null sizes")
                    return True
                else:
                    self.log_result(test_name, False, "Item created but sizes not null", 
                                  {"actual_sizes": item.get("sizes")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to create item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error creating item with null sizes: {str(e)}")
            return False
    
    def test_update_item_add_sizes(self) -> bool:
        """Test updating existing item to add sizes"""
        test_name = "Update Item to Add Sizes"
        
        # First create an item without sizes
        merch_data = {
            "name": "Racing Hoodie",
            "description": "Warm racing hoodie",
            "price": 49.99,
            "image_url": "https://example.com/hoodie.jpg",
            "category": "Apparel",
            "stock": 30
        }
        
        try:
            # Create item
            response = requests.post(
                f"{self.base_url}/merch",
                json=merch_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result(test_name, False, "Failed to create initial item for update test")
                return False
            
            item = response.json()
            item_id = item["id"]
            self.created_items.append(item_id)
            
            # Now update to add sizes
            update_data = {
                "sizes": ["XS", "XXL", "XXXL"]
            }
            
            response = requests.put(
                f"{self.base_url}/merch/{item_id}",
                json=update_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                updated_item = response.json()
                
                if updated_item.get("sizes") == ["XS", "XXL", "XXXL"]:
                    self.log_result(test_name, True, "Successfully added sizes to existing item")
                    return True
                else:
                    self.log_result(test_name, False, "Update succeeded but sizes incorrect", 
                                  {"expected": ["XS", "XXL", "XXXL"], "actual": updated_item.get("sizes")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to update item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error updating item to add sizes: {str(e)}")
            return False
    
    def test_update_item_remove_sizes(self) -> bool:
        """Test updating existing item to remove sizes"""
        test_name = "Update Item to Remove Sizes"
        
        # First create an item with sizes
        merch_data = {
            "name": "Racing Jacket",
            "description": "Professional racing jacket",
            "price": 89.99,
            "image_url": "https://example.com/jacket.jpg",
            "category": "Apparel",
            "stock": 20,
            "sizes": ["M", "L", "XL", "XXL"]
        }
        
        try:
            # Create item
            response = requests.post(
                f"{self.base_url}/merch",
                json=merch_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result(test_name, False, "Failed to create initial item for remove test")
                return False
            
            item = response.json()
            item_id = item["id"]
            self.created_items.append(item_id)
            
            # Now update to remove sizes (set to null)
            update_data = {
                "sizes": None
            }
            
            response = requests.put(
                f"{self.base_url}/merch/{item_id}",
                json=update_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                updated_item = response.json()
                
                if updated_item.get("sizes") is None:
                    self.log_result(test_name, True, "Successfully removed sizes from existing item")
                    return True
                else:
                    self.log_result(test_name, False, "Update succeeded but sizes not removed", 
                                  {"actual_sizes": updated_item.get("sizes")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to update item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error updating item to remove sizes: {str(e)}")
            return False
    
    def test_update_item_remove_sizes_empty_array(self) -> bool:
        """Test updating existing item to remove sizes using empty array"""
        test_name = "Update Item to Remove Sizes (Empty Array)"
        
        # First create an item with sizes
        merch_data = {
            "name": "Racing Cap",
            "description": "Adjustable racing cap",
            "price": 24.99,
            "image_url": "https://example.com/cap.jpg",
            "category": "Apparel",
            "stock": 40,
            "sizes": ["One Size", "Adjustable"]
        }
        
        try:
            # Create item
            response = requests.post(
                f"{self.base_url}/merch",
                json=merch_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result(test_name, False, "Failed to create initial item for empty array test")
                return False
            
            item = response.json()
            item_id = item["id"]
            self.created_items.append(item_id)
            
            # Now update to remove sizes (set to empty array)
            update_data = {
                "sizes": []
            }
            
            response = requests.put(
                f"{self.base_url}/merch/{item_id}",
                json=update_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                updated_item = response.json()
                
                sizes = updated_item.get("sizes")
                if sizes == [] or sizes is None:
                    self.log_result(test_name, True, "Successfully cleared sizes using empty array")
                    return True
                else:
                    self.log_result(test_name, False, "Update succeeded but sizes not cleared", 
                                  {"actual_sizes": sizes})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to update item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error updating item with empty array: {str(e)}")
            return False
    
    def test_get_all_merch_backward_compatibility(self) -> bool:
        """Test that GET /api/merch returns all items including those with and without sizes"""
        test_name = "GET All Merch - Backward Compatibility"
        
        try:
            response = requests.get(f"{self.base_url}/merch", timeout=10)
            
            if response.status_code == 200:
                items = response.json()
                
                if isinstance(items, list):
                    # Check that we can handle items with and without sizes
                    items_with_sizes = [item for item in items if item.get("sizes")]
                    items_without_sizes = [item for item in items if not item.get("sizes")]
                    
                    self.log_result(test_name, True, 
                                  f"Successfully retrieved {len(items)} items ({len(items_with_sizes)} with sizes, {len(items_without_sizes)} without sizes)")
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
    
    def test_various_size_formats(self) -> bool:
        """Test various size format scenarios"""
        test_name = "Various Size Formats"
        
        test_cases = [
            {
                "name": "Standard Clothing Sizes",
                "sizes": ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
                "description": "Standard clothing size range"
            },
            {
                "name": "Numeric Sizes",
                "sizes": ["32", "34", "36", "38", "40"],
                "description": "Numeric sizes for pants/waist"
            },
            {
                "name": "Mixed Format Sizes",
                "sizes": ["Small", "Medium", "Large", "X-Large"],
                "description": "Full word size descriptions"
            },
            {
                "name": "Single Size",
                "sizes": ["One Size Fits All"],
                "description": "Single size option"
            }
        ]
        
        success_count = 0
        
        for i, test_case in enumerate(test_cases):
            merch_data = {
                "name": f"Test Item {i+1} - {test_case['name']}",
                "description": test_case['description'],
                "price": 19.99 + i,
                "image_url": f"https://example.com/test-item-{i+1}.jpg",
                "category": "Test",
                "stock": 10,
                "sizes": test_case['sizes']
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
                    
                    if item.get("sizes") == test_case['sizes']:
                        success_count += 1
                        print(f"   ✅ {test_case['name']}: {test_case['sizes']}")
                    else:
                        print(f"   ❌ {test_case['name']}: Expected {test_case['sizes']}, got {item.get('sizes')}")
                else:
                    print(f"   ❌ {test_case['name']}: Failed to create item ({response.status_code})")
                    
            except Exception as e:
                print(f"   ❌ {test_case['name']}: Error - {str(e)}")
        
        if success_count == len(test_cases):
            self.log_result(test_name, True, f"All {len(test_cases)} size format tests passed")
            return True
        else:
            self.log_result(test_name, False, f"Only {success_count}/{len(test_cases)} size format tests passed")
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
        """Run all backend tests for sizes field implementation"""
        print("🚀 Starting Backend API Tests for Sizes Field Implementation")
        print("=" * 70)
        
        # Authenticate first
        if not self.authenticate_admin():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Run all tests
        tests = [
            self.test_create_merch_with_sizes,
            self.test_create_merch_without_sizes,
            self.test_create_merch_with_null_sizes,
            self.test_update_item_add_sizes,
            self.test_update_item_remove_sizes,
            self.test_update_item_remove_sizes_empty_array,
            self.test_get_all_merch_backward_compatibility,
            self.test_various_size_formats
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
        print("📊 TEST SUMMARY")
        print("=" * 70)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Sizes field implementation is working correctly.")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please review the issues above.")
            return False

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Backend API Testing for Triple Barrel Racing - Multiple Image Support & Product Detail Page
Tests multiple image support (image_urls array) and product detail page functionality
"""

import requests
import json
import sys
from typing import Dict, Any, Optional, List

# Configuration
BASE_URL = "https://size-selector-1.preview.emergentagent.com/api"
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
    
    def test_create_merch_with_multiple_images(self) -> bool:
        """Test creating merch item with multiple images in image_urls array"""
        test_name = "Create Merch Item with Multiple Images"
        
        merch_data = {
            "name": "Racing T-Shirt Multi-Photo",
            "description": "Premium racing t-shirt with multiple product photos",
            "price": 29.99,
            "image_urls": [
                "https://example.com/racing-tshirt-front.jpg",
                "https://example.com/racing-tshirt-back.jpg", 
                "https://example.com/racing-tshirt-detail.jpg"
            ],
            "category": "Apparel",
            "stock": 50,
            "sizes": {"S": 10, "M": 15, "L": 20, "XL": 5}
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
                
                # Verify image_urls field is array with correct URLs
                expected_images = [
                    "https://example.com/racing-tshirt-front.jpg",
                    "https://example.com/racing-tshirt-back.jpg", 
                    "https://example.com/racing-tshirt-detail.jpg"
                ]
                if "image_urls" in item and item["image_urls"] == expected_images:
                    self.log_result(test_name, True, "Item created successfully with multiple images")
                    return True
                else:
                    self.log_result(test_name, False, "Item created but image_urls field incorrect", 
                                  {"expected_images": expected_images, "actual_images": item.get("image_urls")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to create item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error creating item with multiple images: {str(e)}")
            return False
    
    def test_create_merch_with_empty_images(self) -> bool:
        """Test creating merch item with empty image_urls array"""
        test_name = "Create Merch Item with Empty Images Array"
        
        merch_data = {
            "name": "Racing Sticker Pack No Images",
            "description": "Collection of racing stickers - images to be added later",
            "price": 9.99,
            "image_urls": [],  # Empty array
            "category": "Accessories",
            "stock": 100
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
                
                # Verify image_urls field is empty array
                if "image_urls" in item and item["image_urls"] == []:
                    self.log_result(test_name, True, "Item created successfully with empty images array")
                    return True
                else:
                    self.log_result(test_name, False, "Item created but image_urls field incorrect", 
                                  {"expected": [], "actual": item.get("image_urls")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to create item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error creating item with empty images: {str(e)}")
            return False
    
    def test_get_single_merch_item_with_sale_calculation(self) -> bool:
        """Test GET /api/merch/{item_id} endpoint with sale price calculation"""
        test_name = "Get Single Merch Item with Sale Price Calculation"
        
        # First create an item with sale_percent
        merch_data = {
            "name": "Racing Jacket On Sale",
            "description": "Premium racing jacket with individual sale",
            "price": 100.00,
            "sale_percent": 20.0,  # 20% off
            "image_urls": [
                "https://example.com/jacket-main.jpg",
                "https://example.com/jacket-side.jpg"
            ],
            "category": "Apparel",
            "stock": 25,
            "sizes": {"M": 8, "L": 10, "XL": 7}
        }
        
        try:
            # Create the item first
            response = requests.post(
                f"{self.base_url}/merch",
                json=merch_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result(test_name, False, "Failed to create test item for single item test")
                return False
            
            item = response.json()
            item_id = item["id"]
            self.created_items.append(item_id)
            
            # Now test GET single item
            response = requests.get(f"{self.base_url}/merch/{item_id}", timeout=10)
            
            if response.status_code == 200:
                single_item = response.json()
                
                # Verify all required fields are present
                required_fields = ["id", "name", "description", "price", "image_urls", "category", "stock", "sizes"]
                sale_fields = ["effective_price", "discount_percent"]
                
                missing_fields = [field for field in required_fields if field not in single_item]
                missing_sale_fields = [field for field in sale_fields if field not in single_item]
                
                if missing_fields:
                    self.log_result(test_name, False, f"Missing required fields: {missing_fields}")
                    return False
                
                if missing_sale_fields:
                    self.log_result(test_name, False, f"Missing sale calculation fields: {missing_sale_fields}")
                    return False
                
                # Verify sale calculations
                expected_effective_price = 100.00 * (1 - 20.0 / 100)  # $80.00
                expected_discount_percent = 20.0
                
                if (abs(single_item["effective_price"] - expected_effective_price) < 0.01 and 
                    single_item["discount_percent"] == expected_discount_percent):
                    self.log_result(test_name, True, 
                                  f"Single item retrieved with correct sale calculations (${single_item['effective_price']}, {single_item['discount_percent']}% off)")
                    return True
                else:
                    self.log_result(test_name, False, "Sale calculations incorrect", 
                                  {"expected_price": expected_effective_price, "actual_price": single_item.get("effective_price"),
                                   "expected_discount": expected_discount_percent, "actual_discount": single_item.get("discount_percent")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to get single item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error getting single merch item: {str(e)}")
            return False
    
    def test_update_merch_images(self) -> bool:
        """Test updating merch item to add/remove images from image_urls"""
        test_name = "Update Merch Item Images"
        
        # First create an item with one image
        merch_data = {
            "name": "Racing Hoodie Photo Update",
            "description": "Hoodie that will get more photos",
            "price": 49.99,
            "image_urls": ["https://example.com/hoodie-original.jpg"],
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
                self.log_result(test_name, False, "Failed to create initial item for image update test")
                return False
            
            item = response.json()
            item_id = item["id"]
            self.created_items.append(item_id)
            
            # Now update to add more images
            update_data = {
                "image_urls": [
                    "https://example.com/hoodie-front.jpg",
                    "https://example.com/hoodie-back.jpg",
                    "https://example.com/hoodie-detail.jpg",
                    "https://example.com/hoodie-lifestyle.jpg"
                ]
            }
            
            response = requests.put(
                f"{self.base_url}/merch/{item_id}",
                json=update_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                updated_item = response.json()
                
                expected_images = [
                    "https://example.com/hoodie-front.jpg",
                    "https://example.com/hoodie-back.jpg",
                    "https://example.com/hoodie-detail.jpg",
                    "https://example.com/hoodie-lifestyle.jpg"
                ]
                
                if updated_item.get("image_urls") == expected_images:
                    self.log_result(test_name, True, "Successfully updated item images")
                    return True
                else:
                    self.log_result(test_name, False, "Update succeeded but images incorrect", 
                                  {"expected": expected_images, "actual": updated_item.get("image_urls")})
                    return False
            else:
                self.log_result(test_name, False, f"Failed to update item: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error updating item images: {str(e)}")
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
            
            # Now update to add sizes (dict format: size -> stock)
            update_data = {
                "sizes": {"XS": 5, "XXL": 8, "XXXL": 3}
            }
            
            response = requests.put(
                f"{self.base_url}/merch/{item_id}",
                json=update_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                updated_item = response.json()
                
                expected_sizes = {"XS": 5, "XXL": 8, "XXXL": 3}
                if updated_item.get("sizes") == expected_sizes:
                    self.log_result(test_name, True, "Successfully added sizes to existing item")
                    return True
                else:
                    self.log_result(test_name, False, "Update succeeded but sizes incorrect", 
                                  {"expected": expected_sizes, "actual": updated_item.get("sizes")})
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
            "sizes": {"M": 5, "L": 8, "XL": 4, "XXL": 3}
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
            "sizes": {"One Size": 20, "Adjustable": 20}
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
    
    def test_get_all_merch_with_image_urls(self) -> bool:
        """Test that GET /api/merch returns all items with image_urls array instead of image_url"""
        test_name = "GET All Merch - Image URLs Array Support"
        
        try:
            response = requests.get(f"{self.base_url}/merch", timeout=10)
            
            if response.status_code == 200:
                items = response.json()
                
                if isinstance(items, list):
                    # Check that all items have image_urls field (array) and effective_price/discount_percent
                    items_with_image_urls = 0
                    items_with_sale_fields = 0
                    
                    for item in items:
                        # Check for image_urls field
                        if "image_urls" in item and isinstance(item["image_urls"], list):
                            items_with_image_urls += 1
                        
                        # Check for sale calculation fields
                        if "effective_price" in item and "discount_percent" in item:
                            items_with_sale_fields += 1
                    
                    if len(items) > 0:
                        image_urls_percentage = (items_with_image_urls / len(items)) * 100
                        sale_fields_percentage = (items_with_sale_fields / len(items)) * 100
                        
                        if image_urls_percentage == 100 and sale_fields_percentage == 100:
                            self.log_result(test_name, True, 
                                          f"All {len(items)} items have image_urls array and sale calculation fields")
                            return True
                        else:
                            self.log_result(test_name, False, 
                                          f"Not all items have required fields: {image_urls_percentage:.1f}% have image_urls, {sale_fields_percentage:.1f}% have sale fields")
                            return False
                    else:
                        self.log_result(test_name, True, "No items in database - test passed by default")
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
    
    def test_backward_compatibility_existing_items(self) -> bool:
        """Test backward compatibility with existing items that might have old image_url field"""
        test_name = "Backward Compatibility with Existing Items"
        
        try:
            response = requests.get(f"{self.base_url}/merch", timeout=10)
            
            if response.status_code == 200:
                items = response.json()
                
                if isinstance(items, list) and len(items) > 0:
                    # Check that all items work properly regardless of whether they were created with old or new schema
                    compatibility_issues = []
                    
                    for item in items:
                        # Each item should have image_urls (array), not image_url (string)
                        if "image_url" in item and "image_urls" not in item:
                            compatibility_issues.append(f"Item {item.get('id', 'unknown')} has old image_url field")
                        
                        # Each item should have effective_price and discount_percent
                        if "effective_price" not in item:
                            compatibility_issues.append(f"Item {item.get('id', 'unknown')} missing effective_price")
                        
                        if "discount_percent" not in item:
                            compatibility_issues.append(f"Item {item.get('id', 'unknown')} missing discount_percent")
                    
                    if not compatibility_issues:
                        self.log_result(test_name, True, f"All {len(items)} existing items are compatible with new schema")
                        return True
                    else:
                        self.log_result(test_name, False, f"Found {len(compatibility_issues)} compatibility issues", 
                                      {"issues": compatibility_issues[:5]})  # Show first 5 issues
                        return False
                else:
                    self.log_result(test_name, True, "No existing items to check - test passed")
                    return True
            else:
                self.log_result(test_name, False, f"Failed to get merch items: {response.status_code}", 
                              {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Error checking backward compatibility: {str(e)}")
            return False
    
    def test_various_size_formats(self) -> bool:
        """Test various size format scenarios"""
        test_name = "Various Size Formats"
        
        test_cases = [
            {
                "name": "Standard Clothing Sizes",
                "sizes": {"XS": 5, "S": 10, "M": 15, "L": 12, "XL": 8, "XXL": 5, "XXXL": 2},
                "description": "Standard clothing size range with stock"
            },
            {
                "name": "Numeric Sizes",
                "sizes": {"32": 8, "34": 12, "36": 15, "38": 10, "40": 6},
                "description": "Numeric sizes for pants/waist with stock"
            },
            {
                "name": "Mixed Format Sizes",
                "sizes": {"Small": 10, "Medium": 15, "Large": 12, "X-Large": 8},
                "description": "Full word size descriptions with stock"
            },
            {
                "name": "Single Size",
                "sizes": {"One Size Fits All": 25},
                "description": "Single size option with stock"
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
        """Run all backend tests for multiple image support and product detail page"""
        print("🚀 Starting Backend API Tests for Multiple Image Support & Product Detail Page")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate_admin():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Run all tests
        tests = [
            self.test_create_merch_with_multiple_images,
            self.test_create_merch_with_empty_images,
            self.test_get_single_merch_item_with_sale_calculation,
            self.test_update_merch_images,
            self.test_create_merch_without_sizes,
            self.test_create_merch_with_null_sizes,
            self.test_update_item_add_sizes,
            self.test_update_item_remove_sizes,
            self.test_update_item_remove_sizes_empty_array,
            self.test_get_all_merch_with_image_urls,
            self.test_backward_compatibility_existing_items,
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
            print("\n🎉 ALL TESTS PASSED! Multiple image support and product detail page functionality is working correctly.")
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
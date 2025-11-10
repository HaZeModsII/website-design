#!/usr/bin/env python3
"""
Debug test for the update issue with None values
"""

import requests
import json

BASE_URL = "https://missing-size-field.preview.emergentagent.com/api"
ADMIN_TOKEN = "admin:admin123"

def get_auth_headers():
    return {"Authorization": f"Bearer {ADMIN_TOKEN}"}

def test_update_with_none():
    """Test what happens when we try to update with None values"""
    
    # First create an item with sizes
    merch_data = {
        "name": "Debug Test Item",
        "description": "Test item for debugging update behavior",
        "price": 19.99,
        "image_url": "https://example.com/debug.jpg",
        "category": "Test",
        "stock": 10,
        "sizes": ["S", "M", "L"]
    }
    
    print("1. Creating item with sizes...")
    response = requests.post(
        f"{BASE_URL}/merch",
        json=merch_data,
        headers=get_auth_headers()
    )
    
    if response.status_code != 200:
        print(f"Failed to create item: {response.status_code}")
        return
    
    item = response.json()
    item_id = item["id"]
    print(f"   Created item {item_id} with sizes: {item.get('sizes')}")
    
    # Test 1: Try to update with None
    print("\n2. Trying to update sizes to None...")
    update_data = {"sizes": None}
    response = requests.put(
        f"{BASE_URL}/merch/{item_id}",
        json=update_data,
        headers=get_auth_headers()
    )
    
    if response.status_code == 200:
        updated_item = response.json()
        print(f"   Update response sizes: {updated_item.get('sizes')}")
    else:
        print(f"   Update failed: {response.status_code}")
    
    # Test 2: Try to update with empty array
    print("\n3. Trying to update sizes to empty array...")
    update_data = {"sizes": []}
    response = requests.put(
        f"{BASE_URL}/merch/{item_id}",
        json=update_data,
        headers=get_auth_headers()
    )
    
    if response.status_code == 200:
        updated_item = response.json()
        print(f"   Update response sizes: {updated_item.get('sizes')}")
    else:
        print(f"   Update failed: {response.status_code}")
    
    # Test 3: Check what's actually in the database
    print("\n4. Getting item from database...")
    response = requests.get(f"{BASE_URL}/merch")
    if response.status_code == 200:
        items = response.json()
        debug_item = next((item for item in items if item["id"] == item_id), None)
        if debug_item:
            print(f"   Database item sizes: {debug_item.get('sizes')}")
        else:
            print("   Item not found in database")
    
    # Cleanup
    print(f"\n5. Cleaning up item {item_id}...")
    response = requests.delete(
        f"{BASE_URL}/merch/{item_id}",
        headers=get_auth_headers()
    )
    if response.status_code == 200:
        print("   Item deleted successfully")
    else:
        print(f"   Failed to delete item: {response.status_code}")

if __name__ == "__main__":
    test_update_with_none()
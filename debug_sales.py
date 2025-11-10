#!/usr/bin/env python3
"""
Debug script to check sales calculation issue
"""

import requests
import json

BASE_URL = "https://missing-size-field.preview.emergentagent.com/api"

def debug_sales():
    print("🔍 Debugging Sales Calculation Issue")
    print("=" * 50)
    
    # Check sales settings
    print("\n1. Checking sales settings...")
    try:
        response = requests.get(f"{BASE_URL}/sales-settings", timeout=10)
        if response.status_code == 200:
            settings = response.json()
            print(f"   ✅ Sales settings found: {json.dumps(settings, indent=2)}")
        else:
            print(f"   ❌ Failed to get sales settings: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Check merch items
    print("\n2. Checking merch items...")
    try:
        response = requests.get(f"{BASE_URL}/merch", timeout=10)
        if response.status_code == 200:
            items = response.json()
            print(f"   ✅ Found {len(items)} merch items")
            
            for item in items:
                print(f"\n   📦 Item: {item.get('name')}")
                print(f"      Price: ${item.get('price')}")
                print(f"      Sale Percent: {item.get('sale_percent')}")
                print(f"      Effective Price: {item.get('effective_price')}")
                print(f"      Discount Percent: {item.get('discount_percent')}")
                
                # Check if fields are missing
                missing = []
                if 'effective_price' not in item:
                    missing.append('effective_price')
                if 'discount_percent' not in item:
                    missing.append('discount_percent')
                if missing:
                    print(f"      ❌ Missing fields: {missing}")
        else:
            print(f"   ❌ Failed to get merch: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

if __name__ == "__main__":
    debug_sales()
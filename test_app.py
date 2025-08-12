#!/usr/bin/env python3
"""
Simple test script for the Flask profile API
"""
import requests
import json

def test_profile_api():
    """Test the profile endpoint"""
    base_url = "http://localhost:5000"
    
    # Test with a sample username
    test_username = "testuser"
    url = f"{base_url}/profile/{test_username}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            profile = response.json()
            print(f"✅ Profile API test successful!")
            print(f"Username: {profile['username']}")
            print(f"Display Name: {profile['display_name']}")
            print(f"Level: {profile['level']}")
            print(f"XP: {profile['xp_current']}/{profile['xp_needed']}")
            print(f"Total XP: {profile['total_xp']}")
        else:
            print(f"❌ API test failed with status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the Flask app. Make sure it's running on port 5000.")
    except Exception as e:
        print(f"❌ Error during test: {e}")

if __name__ == "__main__":
    print("Testing Flask Profile API...")
    test_profile_api()
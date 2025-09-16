#!/usr/bin/env python3
"""
Script debug login issue
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

import bcrypt

def test_bcrypt():
    """Test bcrypt functionality"""
    password = "123456"
    hashed = "$2b$12$nLN8gS9tW6XMb5JzNVRNKu4TOp26Cx7BrN.J42jm7tsBzLxi4cATO"

    print(f"Testing password: {password}")
    print(f"Stored hash: {hashed}")

    try:
        result = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        print(f"bcrypt.checkpw result: {result}")
        return result
    except Exception as e:
        print(f"bcrypt.checkpw error: {e}")
        return False

def test_database():
    """Test database connection"""
    try:
        from supabase_client import supabase
        print("Testing database connection...")

        # Check if employees table exists and has data
        result = supabase.table('employees').select('*').limit(5).execute()
        print(f"Employees table query result: {len(result.data)} records")

        if result.data:
            user = result.data[0]
            print(f"Sample user: {user.get('email')} - hash starts with: {user.get('hashed_password', '')[:20]}...")

        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 DEBUG LOGIN ISSUE")
    print("=" * 30)

    print("\n1. Testing bcrypt functionality:")
    bcrypt_ok = test_bcrypt()

    print("\n2. Testing database connection:")
    db_ok = test_database()

    print("\n📊 SUMMARY:")
    print(f"bcrypt working: {bcrypt_ok}")
    print(f"database working: {db_ok}")

    if bcrypt_ok and db_ok:
        print("✅ Both components working - login should work!")
    else:
        print("❌ Issues detected - check logs above")
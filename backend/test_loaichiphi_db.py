#!/usr/bin/env python3
"""
Test script to check database connection and loaichiphi data
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from supabase_client import supabase

def test_database():
    """Test database connection and check loaichiphi data"""
    try:
        print("🔍 Testing database connection...")

        # Test connection by selecting from loaichiphi table
        result = supabase.table('loaichiphi').select('*').execute()

        print("✅ Database connection successful!")
        print(f"📊 Found {len(result.data)} expense categories in database")

        if result.data:
            print("\n📋 Sample data:")
            for i, item in enumerate(result.data[:5], 1):
                tenchiphi = item.get('tenchiphi', 'N/A')
                loaichiphi = item.get('loaichiphi', 'N/A')
                print(f"  {i}. {tenchiphi} ({loaichiphi})")
        else:
            print("\n⚠️  No data found in loaichiphi table")
            print("💡 You may need to run the sample data creation script")

        return True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_database()

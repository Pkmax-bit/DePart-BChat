#!/usr/bin/env python3
"""
Test script to check database tables
"""
from supabase_client import supabase

try:
    print("Testing loaichiphi table...")
    result = supabase.table('loaichiphi').select('*').execute()
    print('loaichiphi table data:', result.data)

    print("\nTesting quanly_chiphi table...")
    result2 = supabase.table('quanly_chiphi').select('*').execute()
    print('quanly_chiphi table data:', result2.data)

    print("\nDatabase test completed successfully!")
except Exception as e:
    print('Error:', str(e))

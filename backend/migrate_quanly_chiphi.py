#!/usr/bin/env python3
"""
Migration script to add missing columns to quanly_chiphi table
This script provides the SQL commands needed to fix the schema.
"""
import os
import sys

def print_migration_sql():
    """Print the SQL commands needed for migration"""
    print("=== MIGRATION SQL FOR quanly_chiphi TABLE ===")
    print()
    print("Run these SQL commands in your Supabase SQL Editor:")
    print()
    print("-- Add parent_id column for hierarchical expenses")
    print("ALTER TABLE quanly_chiphi ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES quanly_chiphi(id);")
    print()
    print("-- Add updated_at column for tracking updates")
    print("ALTER TABLE quanly_chiphi ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
    print()
    print("-- Create index for parent_id for better performance")
    print("CREATE INDEX IF NOT EXISTS idx_quanly_chiphi_parent_id ON quanly_chiphi(parent_id);")
    print()
    print("-- Add ti_le column for storing percentage ratio of total expenses")
    print("ALTER TABLE quanly_chiphi ADD COLUMN IF NOT EXISTS ti_le DECIMAL(5,2) DEFAULT 0;")
    print()

def test_columns():
    """Test if the required columns exist by trying to access them"""
    try:
        from supabase_client import supabase

        print("Testing if required columns exist...")

        # Try to select the columns that should exist
        result = supabase.table('quanly_chiphi').select('id, parent_id, updated_at').limit(1).execute()

        if result.data:
            print("✓ All required columns (parent_id, updated_at) appear to exist!")
            return True
        else:
            print("✗ Required columns are missing. Please run the migration SQL above.")
            return False

    except Exception as e:
        print(f"✗ Error testing columns: {e}")
        print("This likely means the columns are missing. Please run the migration SQL above.")
        return False

if __name__ == "__main__":
    print("Quanly Chiphi Table Migration Helper")
    print("=" * 40)
    print()

    # Always show the SQL first
    print_migration_sql()
    print()

    # Test if columns exist
    columns_exist = test_columns()

    if columns_exist:
        print("Migration appears to be complete!")
        sys.exit(0)
    else:
        print("Please run the SQL commands above in your Supabase dashboard to complete the migration.")
        sys.exit(1)
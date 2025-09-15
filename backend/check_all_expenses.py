#!/usr/bin/env python3
"""
Script to check all expenses in database
"""

from supabase_client import supabase

def check_all_expenses():
    result = supabase.table('quanly_chiphi').select('id, mo_ta, giathanh, ti_le, parent_id, thang').execute()

    print('All expenses in database:')
    total = 0
    for exp in result.data:
        print(f'ID {exp["id"]}: {exp.get("mo_ta", "N/A")} - {exp.get("giathanh", 0):,} VND - Ratio: {exp.get("ti_le")}% - Month: {exp.get("thang")} - Parent: {exp.get("parent_id")}')
        total += exp.get('giathanh', 0)
    print(f'\nTotal: {total:,} VND')

if __name__ == "__main__":
    check_all_expenses()
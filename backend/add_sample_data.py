#!/usr/bin/env python3
"""
Script to add sample expense categories
"""
from supabase_client import supabase

try:
    # Add sample expense categories
    sample_categories = [
        {'tenchiphi': 'Chi phí văn phòng phẩm', 'loaichiphi': 'biến phí'},
        {'tenchiphi': 'Chi phí điện nước', 'loaichiphi': 'cố định'},
        {'tenchiphi': 'Chi phí marketing', 'loaichiphi': 'biến phí'},
        {'tenchiphi': 'Chi phí nhân công', 'loaichiphi': 'cố định'},
        {'tenchiphi': 'Chi phí vận chuyển', 'loaichiphi': 'biến phí'},
        {'tenchiphi': 'Chi phí bảo trì', 'loaichiphi': 'biến phí'}
    ]

    for category in sample_categories:
        result = supabase.table('loaichiphi').insert(category).execute()
        print(f'Added category: {category["tenchiphi"]}')

    print('Sample categories added successfully!')
except Exception as e:
    print('Error:', str(e))

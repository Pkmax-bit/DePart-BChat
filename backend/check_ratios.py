#!/usr/bin/env python3
"""
Script to check current expense ratios
"""

from supabase_client import supabase

def check_expense_ratios():
    # Query all expenses with their ratios
    result = supabase.table('quanly_chiphi').select('id, mo_ta, giathanh, ti_le, parent_id, created_at').execute()

    print('=== CHI TIẾT TẤT CẢ CHI PHÍ ===')
    print()

    for expense in result.data:
        expense_type = 'Chi phí con' if expense.get('parent_id') else 'Chi phí cha'
        ratio = expense.get('ti_le')
        amount = expense.get('giathanh', 0)
        parent_id = expense.get('parent_id')
        created_date = expense.get('created_at', 'N/A')

        print(f'{expense_type} (ID: {expense["id"]}):')
        print(f'  Mô tả: {expense.get("mo_ta", "N/A")}')
        print(f'  Số tiền: {amount:,} VND')
        print(f'  Tỷ lệ: {ratio}%')
        print(f'  Parent ID: {parent_id}')
        print(f'  Ngày tạo: {created_date[:10] if created_date != "N/A" else "N/A"}')
        print()

if __name__ == "__main__":
    check_expense_ratios()
if __name__ == "__main__":
    check_expense_ratios()
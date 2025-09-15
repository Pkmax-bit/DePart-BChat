#!/usr/bin/env python3
"""
Script to show expense hierarchy and ratios
"""

from supabase_client import supabase

def show_expense_hierarchy():
    # Query all expenses
    result = supabase.table('quanly_chiphi').select('id, mo_ta, giathanh, ti_le, parent_id').execute()

    # Calculate total expenses for the month
    total_expenses = sum(exp.get('giathanh', 0) for exp in result.data)

    print('=== CẤU TRÚC CÂY CHI PHÍ VÀ TỶ LỆ ===')
    print(f'Tổng chi phí tháng: {total_expenses:,} VND')
    print()

    def build_hierarchy(parent_id=None, level=0):
        children = [exp for exp in result.data if exp.get('parent_id') == parent_id]
        if not children:
            return []

        hierarchy_result = []
        for child in children:
            child_info = {
                'id': child['id'],
                'mo_ta': child.get('mo_ta', 'N/A'),
                'giathanh': child.get('giathanh', 0),
                'ti_le': child.get('ti_le'),
                'level': level,
                'children': build_hierarchy(child['id'], level + 1)
            }
            hierarchy_result.append(child_info)
        return hierarchy_result

    # Get root expenses (no parent)
    root_expenses = build_hierarchy()

    def print_hierarchy(expenses, total_expenses):
        for exp in expenses:
            indent = '  ' * exp['level']
            print(f'{indent}📁 Chi phí ID {exp["id"]}: {exp["mo_ta"]}')
            print(f'{indent}   💰 Số tiền: {exp["giathanh"]:,} VND')
            print(f'{indent}   📊 Tỷ lệ: {exp["ti_le"]}% của tổng chi phí')
            print()

            if exp['children']:
                print_hierarchy(exp['children'], total_expenses)

    print_hierarchy(root_expenses, total_expenses)

if __name__ == "__main__":
    show_expense_hierarchy()
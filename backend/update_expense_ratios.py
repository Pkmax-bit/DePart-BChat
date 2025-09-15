#!/usr/bin/env python3
"""
Script để cập nhật tỷ lệ phần trăm của từng chi phí so với tổng chi phí tháng
- Chi phí cha: tỷ lệ so với tổng chi phí tháng
- Chi phí con: tỷ lệ so với chi phí cha
Lưu tỷ lệ vào cột ti_le của bảng quanly_chiphi
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from supabase_client import supabase
from datetime import datetime
from collections import defaultdict

def update_expense_ratios(month=None):
    """Update expense ratios for all expenses in specified month or all months"""
    try:
        print("Starting expense ratio update...")

        # Build query to get data
        query = supabase.table('quanly_chiphi').select('*')

        if month:
            # Filter by month if specified
            start_date = f"{month}-01"
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month_num + 1:02d}-01"

            query = query.gte('created_at', start_date).lt('created_at', end_date)

        result = query.execute()

        if not result.data:
            print("No expenses found to update ratios.")
            return {"success": True, "updated_count": 0}

        # Group expenses by month
        expenses_by_month = defaultdict(list)

        for expense in result.data:
            created_at = expense.get('created_at')
            if created_at:
                if isinstance(created_at, str):
                    expense_month = created_at[:7]  # YYYY-MM
                else:
                    expense_month = created_at.strftime('%Y-%m')
            else:
                # Skip if no created_at
                continue

            expenses_by_month[expense_month].append(expense)

        updated_count = 0

        # Update ratios for each month
        for month_key, month_expenses in expenses_by_month.items():
            print(f"Processing month {month_key}...")

            # Calculate total expenses for the month (ALL expenses, not just parents)
            total_month_expenses = sum(
                expense['giathanh'] or 0
                for expense in month_expenses
            )

            if total_month_expenses == 0:
                print(f"  Month {month_key} has no parent expenses, skipping.")
                continue

            print(f"  Total expenses for month {month_key}: {total_month_expenses}")

            # Group expenses by parent_id to handle hierarchical ratios
            expenses_by_parent = defaultdict(list)
            parent_expenses = {}

            for expense in month_expenses:
                parent_id = expense.get('parent_id')
                if parent_id:
                    expenses_by_parent[parent_id].append(expense)
                else:
                    parent_expenses[expense['id']] = expense

            # Update ratio for each expense (relative to root parent)
            def update_all_ratios_recursive(expense_id, root_total, indent_level=1):
                nonlocal updated_count
                expense = next((e for e in month_expenses if e['id'] == expense_id), None)
                if expense:
                    expense_amount = expense['giathanh'] or 0
                    ratio = (expense_amount / root_total) * 100 if root_total > 0 else 0

                    # Round to 2 decimal places
                    ratio_rounded = round(ratio, 2)

                    # Update ratio in database
                    supabase.table('quanly_chiphi').update({
                        'ti_le': ratio_rounded
                    }).eq('id', expense['id']).execute()

                    indent = "    " * indent_level
                    parent_info = "of root total" if indent_level == 1 else "of root total"
                    print(f"{indent}Expense ID {expense['id']}: {expense_amount} -> {ratio_rounded}% {parent_info}")
                    updated_count += 1

                    # Recursively update all children with same root total
                    child_expenses = expenses_by_parent.get(expense_id, [])
                    for child_expense in child_expenses:
                        update_all_ratios_recursive(child_expense['id'], root_total, indent_level + 1)

            # Update ratios for all root expenses and their children
            for parent_id, parent_expense in parent_expenses.items():
                root_total = parent_expense['giathanh'] or 0
                update_all_ratios_recursive(parent_id, root_total)

        print(f"Completed! Updated ratios for {updated_count} expenses.")
        return {"success": True, "updated_count": updated_count}

    except Exception as e:
        print(f"Error updating ratios: {e}")
        return {"success": False, "error": str(e)}

def get_root_total(expense, all_expenses):
    """Get the total amount of the root parent for an expense"""
    current = expense
    while current.get('parent_id'):
        parent = next((e for e in all_expenses if e['id'] == current['parent_id']), None)
        if not parent:
            break
        current = parent
    return current['giathanh'] or 0

def verify_expense_ratios(month=None):
    """Verify the accuracy of expense ratios"""
    try:
        print("Verifying expense ratio accuracy...")

        # Build query
        query = supabase.table('quanly_chiphi').select('*')

        if month:
            start_date = f"{month}-01"
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month_num + 1:02d}-01"

            query = query.gte('created_at', start_date).lt('created_at', end_date)

        result = query.execute()

        if not result.data:
            print("No expenses found to verify.")
            return 0

        # Group by month
        expenses_by_month = defaultdict(list)

        for expense in result.data:
            created_at = expense.get('created_at')
            if created_at:
                if isinstance(created_at, str):
                    expense_month = created_at[:7]
                else:
                    expense_month = created_at.strftime('%Y-%m')
            else:
                continue

            expenses_by_month[expense_month].append(expense)

        issues_found = 0

        for month_key, month_expenses in expenses_by_month.items():
            # Calculate total expenses for the month (ALL expenses)
            total_month_expenses = sum(
                expense['giathanh'] or 0
                for expense in month_expenses
            )

            if total_month_expenses == 0:
                continue

            # Group expenses by parent
            expenses_by_parent = defaultdict(list)
            parent_expenses = {}

            for expense in month_expenses:
                parent_id = expense.get('parent_id')
                if parent_id:
                    expenses_by_parent[parent_id].append(expense)
                else:
                    parent_expenses[expense['id']] = expense

            # Check that all expenses have correct ratios relative to their root parent
            for expense in month_expenses:
                # Find root parent for this expense
                root_total = get_root_total(expense, month_expenses)
                expense_amount = expense['giathanh'] or 0
                expected_ratio = (expense_amount / root_total) * 100 if root_total > 0 else 0
                actual_ratio = expense.get('ti_le') or 0

                if abs(actual_ratio - expected_ratio) > 0.01:
                    print(f"ISSUE: Expense ID {expense['id']}: Expected {expected_ratio:.2f}%, Actual {actual_ratio}%")
                    issues_found += 1

        if issues_found == 0:
            print("All expense ratios are accurate!")
        else:
            print(f"Found {issues_found} issues that need fixing.")

        return issues_found

    except Exception as e:
        print(f"Error verifying ratios: {e}")
        return -1

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Update expense ratios in database')
    parser.add_argument('--verify', action='store_true', help='Only verify, do not update')
    parser.add_argument('--month', help='Only update expenses for specific month (YYYY-MM)')

    args = parser.parse_args()

    if args.verify:
        issues = verify_expense_ratios(args.month)
        if issues > 0:
            print(f"\nFound {issues} issues. Run script again without --verify to fix.")
        sys.exit(0 if issues == 0 else 1)

    # Update ratios
    result = update_expense_ratios(args.month)

    if result['success']:
        print(f"\nUpdate successful! Updated ratios for {result['updated_count']} expenses.")

        # Verify again
        print("\nVerifying after update:")
        verify_expense_ratios(args.month)
    else:
        print(f"\nUpdate failed: {result['error']}")
        sys.exit(1)
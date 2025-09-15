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

            # Calculate total expenses for the month (only parent expenses, not children)
            total_month_expenses = sum(
                expense['giathanh'] or 0
                for expense in month_expenses
                if not expense.get('parent_id')  # Only count parent expenses
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

            # Update ratio for each parent expense
            for parent_id, parent_expense in parent_expenses.items():
                expense_amount = parent_expense['giathanh'] or 0
                ratio = (expense_amount / total_month_expenses) * 100 if total_month_expenses > 0 else 0

                # Round to 2 decimal places
                ratio_rounded = round(ratio, 2)

                # Update ratio in database
                supabase.table('quanly_chiphi').update({
                    'ti_le': ratio_rounded
                }).eq('id', parent_expense['id']).execute()

                print(f"    Parent Expense ID {parent_expense['id']}: {expense_amount} -> {ratio_rounded}% of total")
                updated_count += 1

                # Update ratios for child expenses of this parent
                child_expenses = expenses_by_parent.get(parent_id, [])
                if child_expenses:
                    parent_total = expense_amount
                    if parent_total > 0:
                        for child_expense in child_expenses:
                            child_amount = child_expense['giathanh'] or 0
                            child_ratio = (child_amount / parent_total) * 100

                            # Round to 2 decimal places
                            child_ratio_rounded = round(child_ratio, 2)

                            # Update child ratio in database
                            supabase.table('quanly_chiphi').update({
                                'ti_le': child_ratio_rounded
                            }).eq('id', child_expense['id']).execute()

                            print(f"      Child Expense ID {child_expense['id']}: {child_amount} -> {child_ratio_rounded}% of parent")
                            updated_count += 1

        print(f"Completed! Updated ratios for {updated_count} expenses.")
        return {"success": True, "updated_count": updated_count}

    except Exception as e:
        print(f"Error updating ratios: {e}")
        return {"success": False, "error": str(e)}

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
            # Calculate total parent expenses
            total_month_expenses = sum(
                expense['giathanh'] or 0
                for expense in month_expenses
                if not expense.get('parent_id')
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

            # Check parent expense ratios sum to 100%
            total_parent_ratio = sum(
                expense.get('ti_le') or 0
                for expense in parent_expenses.values()
            )

            if abs(total_parent_ratio - 100.0) > 0.01:
                print(f"ISSUE: Month {month_key} - Parent expenses total ratio: {total_parent_ratio}%, should be 100%")
                issues_found += 1

                for expense in parent_expenses.values():
                    expected_ratio = ((expense['giathanh'] or 0) / total_month_expenses) * 100
                    actual_ratio = expense.get('ti_le') or 0
                    if abs(actual_ratio - expected_ratio) > 0.01:
                        print(f"    Parent Expense ID {expense['id']}: Expected {expected_ratio:.2f}%, Actual {actual_ratio}%")

            # Check child expense ratios for each parent
            for parent_id, parent_expense in parent_expenses.items():
                child_expenses = expenses_by_parent.get(parent_id, [])
                if child_expenses:
                    parent_amount = parent_expense['giathanh'] or 0
                    if parent_amount > 0:
                        total_child_ratio = sum(
                            child.get('ti_le') or 0
                            for child in child_expenses
                        )

                        if abs(total_child_ratio - 100.0) > 0.01:
                            print(f"ISSUE: Parent {parent_id} - Child expenses total ratio: {total_child_ratio}%, should be 100%")
                            issues_found += 1

                            for child in child_expenses:
                                expected_ratio = ((child['giathanh'] or 0) / parent_amount) * 100
                                actual_ratio = child.get('ti_le') or 0
                                if abs(actual_ratio - expected_ratio) > 0.01:
                                    print(f"      Child Expense ID {child['id']}: Expected {expected_ratio:.2f}%, Actual {actual_ratio}%")

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
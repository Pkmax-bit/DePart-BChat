#!/usr/bin/env python3
"""
Script để cập nhật lại tỷ lệ tổng chi phí trong database
Cập nhật giá trị giathanh của chi phí cha dựa trên tổng chi phí con TRONG CÙNG THÁNG
QUY TẮC QUAN TRỌNG: Chỉ tính tổng chi phí con trong cùng tháng với chi phí cha
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from supabase_client import supabase
from datetime import datetime

def update_all_parent_expenses():
    """Cap nhat lai tat ca chi phi cha dua tren tong chi phi con trong cung thang"""
    try:
        print("Bat dau cap nhat ty le tong chi phi...")

        # Lay tat ca chi phi
        all_expenses = supabase.table('quanly_chiphi').select('*').execute()

        # Loc chi phi cha (khong co parent_id)
        parent_expenses_data = [expense for expense in all_expenses.data if expense.get('parent_id') is None]

        updated_count = 0

        for parent in parent_expenses_data:
            parent_id = parent['id']

            # Lay thang cua chi phi cha
            parent_created_at = parent.get('created_at')
            if parent_created_at:
                # Chuyen doi thanh datetime va lay YYYY-MM
                if isinstance(parent_created_at, str):
                    parent_month = parent_created_at[:7]  # YYYY-MM
                else:
                    parent_month = parent_created_at.strftime('%Y-%m')
            else:
                # Neu khong co created_at, bo qua
                print(f"Bo qua chi phi cha ID {parent_id} - khong co ngay tao")
                continue

            # Lay tat ca chi phi con truc tiep trong cung thang
            children_result = supabase.table('quanly_chiphi').select('giathanh, created_at').eq('parent_id', parent_id).execute()

            # Loc chi phi con trong cung thang
            same_month_children = []
            for child in children_result.data:
                child_created_at = child.get('created_at')
                if child_created_at:
                    if isinstance(child_created_at, str):
                        child_month = child_created_at[:7]  # YYYY-MM
                    else:
                        child_month = child_created_at.strftime('%Y-%m')

                    if child_month == parent_month:
                        same_month_children.append(child)

            # Tinh tong chi phi con trong cung thang
            total_children = sum(child['giathanh'] or 0 for child in same_month_children)

            # Cap nhat gia tri cua chi phi cha
            if total_children != (parent['giathanh'] or 0):
                supabase.table('quanly_chiphi').update({
                    'giathanh': total_children
                }).eq('id', parent_id).execute()

                print(f"Da cap nhat chi phi cha ID {parent_id} (thang {parent_month}): {parent['giathanh'] or 0} -> {total_children}")
                updated_count += 1
            else:
                print(f"Chi phi cha ID {parent_id} (thang {parent_month}) da chinh xac: {total_children}")

        print(f"Hoan thanh! Da cap nhat {updated_count} chi phi cha.")

        # Cap nhat de quy cho cac cap cao hon
        print("Cap nhat cac cap cha cao hon...")
        update_higher_level_parents()

        return {"success": True, "updated_count": updated_count}

    except Exception as e:
        print(f"Loi khi cap nhat: {e}")
        return {"success": False, "error": str(e)}

def update_higher_level_parents():
    """Cap nhat de quy cac cap cha cao hon"""
    try:
        # Lay tat ca chi phi co parent_id
        child_expenses = supabase.table('quanly_chiphi').select('parent_id').neq('parent_id', None).execute()

        # Lay danh sach parent_id duy nhat
        parent_ids = list(set(child['parent_id'] for child in child_expenses.data if child['parent_id'] is not None))

        for parent_id in parent_ids:
            # Kiem tra xem parent_id nay co phai la con cua ai khong
            parent_check = supabase.table('quanly_chiphi').select('parent_id').eq('id', parent_id).execute()

            if parent_check.data and parent_check.data[0].get('parent_id'):
                # Day la chi phi con cua mot chi phi khac, can cap nhat cha cua no
                grandparent_id = parent_check.data[0]['parent_id']
                update_parent_giathanh(grandparent_id)

    except Exception as e:
        print(f"Loi khi cap nhat cap cao hon: {e}")

def update_parent_giathanh(parent_id: int):
    """Cap nhat gia tri giathanh cua mot chi phi cha - chi tinh tong con trong cung thang"""
    try:
        # Lay thong tin chi phi cha
        parent_result = supabase.table('quanly_chiphi').select('created_at').eq('id', parent_id).execute()
        if not parent_result.data:
            print(f"Khong tim thay chi phi cha ID {parent_id}")
            return

        parent_data = parent_result.data[0]
        parent_created_at = parent_data.get('created_at')

        if not parent_created_at:
            print(f"Chi phi cha ID {parent_id} khong co ngay tao")
            return

        # Lay thang cua chi phi cha
        if isinstance(parent_created_at, str):
            parent_month = parent_created_at[:7]  # YYYY-MM
        else:
            parent_month = parent_created_at.strftime('%Y-%m')

        # Lay tat ca chi phi con truc tiep
        children_result = supabase.table('quanly_chiphi').select('giathanh, created_at').eq('parent_id', parent_id).execute()

        # Loc chi phi con trong cung thang
        same_month_children = []
        for child in children_result.data:
            child_created_at = child.get('created_at')
            if child_created_at:
                if isinstance(child_created_at, str):
                    child_month = child_created_at[:7]  # YYYY-MM
                else:
                    child_month = child_created_at.strftime('%Y-%m')

                if child_month == parent_month:
                    same_month_children.append(child)

        # Tinh tong chi phi con trong cung thang
        total_children = sum(child['giathanh'] or 0 for child in same_month_children)

        # Cap nhat gia tri cua chi phi cha
        supabase.table('quanly_chiphi').update({
            'giathanh': total_children
        }).eq('id', parent_id).execute()

        print(f"Da cap nhat chi phi cha ID {parent_id} (thang {parent_month}): {total_children}")

        # De quy cap nhat cha cua cha nay
        parent_result = supabase.table('quanly_chiphi').select('parent_id').eq('id', parent_id).execute()
        if parent_result.data and parent_result.data[0].get('parent_id'):
            update_parent_giathanh(parent_result.data[0]['parent_id'])

    except Exception as e:
        print(f"Loi khi cap nhat chi phi cha {parent_id}: {e}")

def verify_expense_totals():
    """Kiem tra tinh chinh xac cua cac tong chi phi - theo quy tac cung thang"""
    try:
        print("Kiem tra tinh chinh xac cua cac tong chi phi...")

        # Lay tat ca chi phi
        all_expenses = supabase.table('quanly_chiphi').select('*').execute()

        # Loc chi phi cha (khong co parent_id)
        parent_expenses_data = [expense for expense in all_expenses.data if expense.get('parent_id') is None]

        issues_found = 0

        for parent in parent_expenses_data:
            parent_id = parent['id']

            # Lay thang cua chi phi cha
            parent_created_at = parent.get('created_at')
            if parent_created_at:
                if isinstance(parent_created_at, str):
                    parent_month = parent_created_at[:7]  # YYYY-MM
                else:
                    parent_month = parent_created_at.strftime('%Y-%m')
            else:
                print(f"Bo qua chi phi cha ID {parent_id} - khong co ngay tao")
                continue

            # Lay tat ca chi phi con truc tiep
            children_result = supabase.table('quanly_chiphi').select('giathanh, created_at').eq('parent_id', parent_id).execute()

            # Loc chi phi con trong cung thang
            same_month_children = []
            for child in children_result.data:
                child_created_at = child.get('created_at')
                if child_created_at:
                    if isinstance(child_created_at, str):
                        child_month = child_created_at[:7]  # YYYY-MM
                    else:
                        child_month = child_created_at.strftime('%Y-%m')

                    if child_month == parent_month:
                        same_month_children.append(child)

            # Tinh tong chi phi con trong cung thang
            total_children = sum(child['giathanh'] or 0 for child in same_month_children)
            parent_amount = parent['giathanh'] or 0

            if total_children != parent_amount:
                print(f"VAN DE: Chi phi cha ID {parent_id} (thang {parent_month}) - Tong con: {total_children}, Gia tri cha: {parent_amount}")
                issues_found += 1

        if issues_found == 0:
            print("Tat ca chi phi cha deu chinh xac!")
        else:
            print(f"Tim thay {issues_found} van de can sua.")

        return issues_found

    except Exception as e:
        print(f"Loi khi kiem tra: {e}")
        return -1

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Cập nhật tỷ lệ tổng chi phí trong database')
    parser.add_argument('--verify', action='store_true', help='Chi kiem tra khong cap nhat')
    parser.add_argument('--month', help='Chi cap nhat chi phi cua thang cu the (YYYY-MM)')

    args = parser.parse_args()

    if args.verify:
        issues = verify_expense_totals()
        if issues > 0:
            print(f"\nCo {issues} van de. Chay lai script ma khong co --verify de sua.")
        sys.exit(0 if issues == 0 else 1)

    # Cap nhat tat ca
    result = update_all_parent_expenses()

    if result['success']:
        print(f"\nCap nhat thanh cong! Da sua {result['updated_count']} chi phi cha.")

        # Kiem tra lai
        print("\nKiem tra lai sau khi cap nhat:")
        verify_expense_totals()
    else:
        print(f"\nCap nhat that bai: {result['error']}")
        sys.exit(1)
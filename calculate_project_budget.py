#!/usr/bin/env python3
"""
Function để tính toán và cập nhật ngân sách kế hoạch cho công trình
ngan_sach_ke_hoach = tổng invoices_quote + tổng chiphi_quote của công trình
"""

import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
sys.path.append(backend_path)

# Load environment variables from backend/.env
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(backend_path, '.env'))

try:
    from backend.supabase_client import supabase
    print('=== NGÂN SÁCH KẾ HOẠCH CALCULATION ===')
    print()

    def calculate_project_budget_plan(project_id=None):
        """
        Tính toán ngân sách kế hoạch cho một công trình cụ thể hoặc tất cả công trình

        Args:
            project_id (int, optional): ID của công trình. Nếu None, tính cho tất cả công trình
        """
        try:
            # Lấy danh sách công trình cần tính
            if project_id:
                projects_result = supabase.table('cong_trinh').select('id, name_congtrinh').eq('id', project_id).execute()
            else:
                projects_result = supabase.table('cong_trinh').select('id, name_congtrinh').execute()

            updated_count = 0

            for project in projects_result.data:
                project_id = project['id']
                project_name = project['name_congtrinh']

                # Tính tổng invoices_quote cho công trình này
                invoices_result = supabase.table('invoices_quote').select('ngan_sach_ke_hoach').eq('id_congtrinh', project_id).execute()
                total_invoices = sum(invoice['ngan_sach_ke_hoach'] or 0 for invoice in invoices_result.data)

                # Tính tổng chiphi_quote cho công trình này
                chiphi_result = supabase.table('chiphi_quote').select('giathanh').eq('id_congtrinh', project_id).execute()
                total_chiphi = sum(chiphi['giathanh'] or 0 for chiphi in chiphi_result.data)

                # Tính ngân sách kế hoạch
                ngan_sach_ke_hoach = total_invoices + total_chiphi

                # Cập nhật vào database
                supabase.table('cong_trinh').update({
                    'ngan_sach_ke_hoach': ngan_sach_ke_hoach
                }).eq('id', project_id).execute()

                print(f"✅ Cập nhật công trình '{project_name}' (ID: {project_id}):")
                print(f"   - Tổng invoices_quote: {total_invoices:,.0f} VND")
                print(f"   - Tổng chiphi_quote: {total_chiphi:,.0f} VND")
                print(f"   - Ngân sách kế hoạch: {ngan_sach_ke_hoach:,.0f} VND")
                print()

                updated_count += 1

            print(f"🎉 Đã cập nhật ngân sách kế hoạch cho {updated_count} công trình")
            return {"success": True, "updated_count": updated_count}

        except Exception as e:
            print(f"❌ Lỗi khi tính toán ngân sách kế hoạch: {e}")
            return {"success": False, "error": str(e)}

    def update_project_budget_on_invoice_change(invoice_data):
        """
        Cập nhật ngân sách kế hoạch khi có thay đổi trong invoices_quote

        Args:
            invoice_data (dict): Dữ liệu invoice đã thay đổi
        """
        try:
            project_id = invoice_data.get('id_congtrinh')
            if project_id:
                print(f"📝 Cập nhật ngân sách kế hoạch cho công trình ID {project_id} do thay đổi invoice")
                return calculate_project_budget_plan(project_id)
            return {"success": True, "message": "Không có project_id trong invoice_data"}
        except Exception as e:
            print(f"❌ Lỗi khi cập nhật ngân sách từ invoice: {e}")
            return {"success": False, "error": str(e)}

    def update_project_budget_on_expense_change(expense_data):
        """
        Cập nhật ngân sách kế hoạch khi có thay đổi trong chiphi_quote

        Args:
            expense_data (dict): Dữ liệu expense đã thay đổi
        """
        try:
            project_id = expense_data.get('id_congtrinh')
            if project_id:
                print(f"📝 Cập nhật ngân sách kế hoạch cho công trình ID {project_id} do thay đổi chi phí")
                return calculate_project_budget_plan(project_id)
            return {"success": True, "message": "Không có project_id trong expense_data"}
        except Exception as e:
            print(f"❌ Lỗi khi cập nhật ngân sách từ expense: {e}")
            return {"success": False, "error": str(e)}

    if __name__ == "__main__":
        import argparse

        parser = argparse.ArgumentParser(description='Tính toán ngân sách kế hoạch cho công trình')
        parser.add_argument('--project_id', type=int, help='ID của công trình cụ thể (tùy chọn)')
        parser.add_argument('--all', action='store_true', help='Tính toán cho tất cả công trình')

        args = parser.parse_args()

        if args.project_id:
            result = calculate_project_budget_plan(args.project_id)
        elif args.all:
            result = calculate_project_budget_plan()
        else:
            print("Vui lòng sử dụng --project_id <id> hoặc --all")
            sys.exit(1)

        if result.get('success'):
            print("✅ Hoàn thành thành công!")
        else:
            print(f"❌ Có lỗi xảy ra: {result.get('error')}")
            sys.exit(1)

except ImportError as e:
    print(f'❌ Lỗi import: {e}')
    print('💡 Đảm bảo backend đang chạy và SUPABASE_URL, SUPABASE_SERVICE_KEY đã được thiết lập')
except Exception as e:
    print(f'❌ Lỗi không xác định: {e}')
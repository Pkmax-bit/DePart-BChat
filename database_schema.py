#!/usr/bin/env python3
"""
Database Schema Overview Script
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

try:
    from supabase_client import supabase
    print('=== DATABASE SCHEMA OVERVIEW ===')
    print()

    # List of tables to check
    tables = [
        'employees', 'departments', 'department_members', 'chatflows',
        'activity_logs', 'feedback', 'chat_history', 'user_chat_sessions',
        'user_chat', 'bang_cham_cong', 'luong_san_pham',
        'phieu_luong', 'invoices', 'quanly_chiphi', 'loaichiphi'
    ]

    print('=== TABLE STATUS ===')
    for table in tables:
        try:
            result = supabase.table(table).select('*').limit(1).execute()
            print(f'✅ {table}: Available ({len(result.data)} sample records)')
        except Exception as e:
            print(f'❌ {table}: Error - {str(e)}')

    print()
    print('=== DETAILED SCHEMA ===')
    print()
    print('1. USERS SYSTEM:')
    print('   - employees: User accounts and authentication')
    print('   - departments: Department management')
    print('   - department_members: User-department relationships')
    print('   - activity_logs: User activity tracking')
    print()
    print('2. CHAT SYSTEM:')
    print('   - chatflows: Chatbot configurations')
    print('   - chat_history: Chat conversation logs')
    print('   - user_chat_sessions: User chat sessions')
    print('   - user_chat: User chat mappings with email')
    print()
    print('3. PAYROLL SYSTEM:')
    print('   - employees: Employee information (mã NV, họ tên, chức vụ, lương,...)')
    print('   - bang_cham_cong: Timesheets/attendance (ngày công, OT,...)')
    print('   - luong_san_pham: Product-based salary (sản phẩm, số lượng, đơn giá)')
    print('   - phieu_luong: Salary slips/payslips (tổng thu nhập, khấu trừ,...)')
    print()
    print('4. FINANCIAL SYSTEM:')
    print('   - invoices: Revenue records (doanh thu)')
    print('   - quanly_chiphi: Expense management (chi phí)')
    print('   - loaichiphi: Expense categories (loại chi phí)')
    print()
    print('5. FEEDBACK SYSTEM:')
    print('   - feedback: User feedback and support')
    print()
    print('=== PAYROLL TABLES DETAIL ===')
    print()
    print('EMPLOYEES (Employees):')
    print('  - id: Auto-increment primary key')
    print('  - ma_nv: Employee code (unique)')
    print('  - ho_ten: Full name')
    print('  - chuc_vu: Position')
    print('  - phong_ban: Department')
    print('  - luong_hop_dong: Contract salary')
    print('  - muc_luong_dong_bhxh: BHXH salary level')
    print('  - so_nguoi_phu_thuoc: Number of dependents')
    print('  - username, hashed_password: Login credentials')
    print('  - email, dien_thoai, dia_chi: Contact info')
    print('  - ngay_vao_lam: Start date')
    print('  - role_id, department_id: Foreign keys')
    print()
    print('BANG_CHAM_CONG (Timesheets):')
    print('  - ma_nv: Employee code (Foreign Key)')
    print('  - ky_tinh_luong: Payroll period (YYYY-MM)')
    print('  - ngay_cong_chuan: Standard working days')
    print('  - ngay_cong_thuc_te: Actual working days')
    print('  - gio_ot_ngay_thuong: Regular OT hours')
    print('  - gio_ot_cuoi_tuan: Weekend OT hours')
    print('  - gio_ot_le_tet: Holiday OT hours')
    print('  - ghi_chu: Notes')
    print()
    print('LUONG_SAN_PHAM (Product Salary):')
    print('  - ma_nv: Employee code')
    print('  - ky_tinh_luong: Payroll period')
    print('  - san_pham_id: Product ID')
    print('  - ten_san_pham: Product name')
    print('  - so_luong: Quantity')
    print('  - don_gia: Unit price')
    print('  - thanh_tien: Total amount (calculated)')
    print()
    print('PHIEU_LUONG (Payslips):')
    print('  - ma_nv: Employee code')
    print('  - ky_tinh_luong: Payroll period')
    print('  - tong_thu_nhap: Total income')
    print('  - tong_khau_tru: Total deductions')
    print('  - luong_thuc_nhan: Net salary')
    print('  - chi_tiet_thu_nhap: Income breakdown (JSON)')
    print('  - chi_tiet_khau_tru: Deduction breakdown (JSON)')
    print('  - trang_thai: Status')
    print('  - ngay_tao, ngay_duyet, nguoi_duyet: Timestamps')

except Exception as e:
    print(f'❌ Error connecting to database: {e}')
    print('💡 Make sure:')
    print('   1. Backend is running')
    print('   2. SUPABASE_URL and SUPABASE_SERVICE_KEY are set')
    print('   3. Database connection is working')
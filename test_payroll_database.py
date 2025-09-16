#!/usr/bin/env python3
"""
Payroll Database Test Script
Kiểm tra kết nối và hiển thị dữ liệu payroll
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

try:
    from supabase_client import supabase
    print('🔍 KIỂM TRA DATABASE PAYROLL')
    print('=' * 50)

    # Test tables
    tables = ['employees', 'bang_cham_cong', 'luong_san_pham', 'phieu_luong']

    for table in tables:
        try:
            result = supabase.table(table).select('*').execute()
            print(f'✅ {table}: {len(result.data)} records')

            # Show sample data
            if result.data:
                print(f'   Sample: {result.data[0]}')
            print()

        except Exception as e:
            print(f'❌ {table}: Error - {str(e)}')
            print()

    print('📊 THỐNG KÊ TỔNG QUAN')
    print('-' * 30)

    # Employee stats
    try:
        employees = supabase.table('employees').select('*').execute()
        active_employees = [e for e in employees.data if e.get('is_active', True)]
        print(f'👥 Tổng nhân viên: {len(employees.data)}')
        print(f'✅ Nhân viên active: {len(active_employees)}')

        # Department stats
        departments = {}
        for emp in employees.data:
            dept = emp.get('phong_ban', 'Chưa phân loại')
            departments[dept] = departments.get(dept, 0) + 1

        print('🏢 Phân bố theo phòng ban:')
        for dept, count in departments.items():
            print(f'   - {dept}: {count} người')

    except Exception as e:
        print(f'❌ Lỗi thống kê nhân viên: {e}')

    print()

    # Timesheet stats
    try:
        timesheets = supabase.table('bang_cham_cong').select('*').execute()
        print(f'📅 Tổng bảng chấm công: {len(timesheets.data)}')

        # Group by period
        periods = {}
        for ts in timesheets.data:
            period = ts.get('ky_tinh_luong', 'Unknown')
            periods[period] = periods.get(period, 0) + 1

        print('📆 Phân bố theo kỳ:')
        for period, count in periods.items():
            print(f'   - {period}: {count} bản ghi')

    except Exception as e:
        print(f'❌ Lỗi thống kê chấm công: {e}')

    print()

    # Product salary stats
    try:
        products = supabase.table('luong_san_pham').select('*').execute()
        print(f'📦 Tổng lương sản phẩm: {len(products.data)}')

        total_value = sum(p.get('thanh_tien', 0) for p in products.data)
        print(f'💵 Tổng giá trị: {total_value:,.0f} VND')

    except Exception as e:
        print(f'❌ Lỗi thống kê lương sản phẩm: {e}')

    print()

    # Payslip stats
    try:
        payslips = supabase.table('phieu_luong').select('*').execute()
        print(f'💰 Tổng phiếu lương: {len(payslips.data)}')

        if payslips.data:
            total_salary = sum(p.get('luong_thuc_nhan', 0) for p in payslips.data)
            avg_salary = total_salary / len(payslips.data)
            print(f'💵 Tổng lương: {total_salary:,.0f} VND')
            print(f'📈 Lương TB: {avg_salary:,.0f} VND')

    except Exception as e:
        print(f'❌ Lỗi thống kê phiếu lương: {e}')

    print()
    print('✅ Hoàn thành kiểm tra database!')

except Exception as e:
    print(f'❌ Lỗi kết nối database: {e}')
    print('💡 Hãy kiểm tra:')
    print('   1. SUPABASE_URL và SUPABASE_SERVICE_KEY')
    print('   2. File backend/supabase_client.py')
    print('   3. Backend server đang chạy')
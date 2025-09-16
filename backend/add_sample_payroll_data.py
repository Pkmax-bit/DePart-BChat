#!/usr/bin/env python3
"""
Script to add sample payroll data for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from datetime import datetime

try:
    print("Adding sample payroll data...")

    # 1. Add sample employees
    print("\n1. Adding sample employees...")
    sample_employees = [
        {
            'ma_nv': 'NV001',
            'ho_ten': 'Nguyễn Văn A',
            'chuc_vu': 'Nhân viên kinh doanh',
            'phong_ban': 'Kinh doanh',
            'luong_hop_dong': 15000000,
            'muc_luong_dong_bhxh': 14000000,
            'so_nguoi_phu_thuoc': 1,
            'email': 'nguyenvana@company.com',
            'dien_thoai': '0901234567',
            'dia_chi': '123 Đường ABC, Quận 1, TP.HCM',
            'ngay_vao_lam': '2023-01-15',
            'is_active': True
        },
        {
            'ma_nv': 'NV002',
            'ho_ten': 'Trần Thị B',
            'chuc_vu': 'Nhân viên hành chính',
            'phong_ban': 'Hành chính',
            'luong_hop_dong': 12000000,
            'muc_luong_dong_bhxh': 11000000,
            'so_nguoi_phu_thuoc': 0,
            'email': 'tranthib@company.com',
            'dien_thoai': '0902345678',
            'dia_chi': '456 Đường XYZ, Quận 2, TP.HCM',
            'ngay_vao_lam': '2023-03-01',
            'is_active': True
        },
        {
            'ma_nv': 'NV003',
            'ho_ten': 'Lê Văn C',
            'chuc_vu': 'Kỹ sư phần mềm',
            'phong_ban': 'Công nghệ',
            'luong_hop_dong': 20000000,
            'muc_luong_dong_bhxh': 19000000,
            'so_nguoi_phu_thuoc': 2,
            'email': 'levanc@company.com',
            'dien_thoai': '0903456789',
            'dia_chi': '789 Đường DEF, Quận 3, TP.HCM',
            'ngay_vao_lam': '2022-11-10',
            'is_active': True
        },
        {
            'ma_nv': 'NV004',
            'ho_ten': 'Phạm Thị D',
            'chuc_vu': 'Nhân viên marketing',
            'phong_ban': 'Marketing',
            'luong_hop_dong': 13000000,
            'muc_luong_dong_bhxh': 12000000,
            'so_nguoi_phu_thuoc': 1,
            'email': 'phamthid@company.com',
            'dien_thoai': '0904567890',
            'dia_chi': '321 Đường GHI, Quận 4, TP.HCM',
            'ngay_vao_lam': '2023-05-20',
            'is_active': True
        }
    ]

    for employee in sample_employees:
        result = supabase.table('employees').insert(employee).execute()
        print(f'Added employee: {employee["ho_ten"]} ({employee["ma_nv"]})')

    # 2. Add sample timesheets for current month
    print("\n2. Adding sample timesheets...")
    current_month = datetime.now().strftime('%Y-%m')
    sample_timesheets = [
        {
            'ma_nv': 'NV001',
            'ky_tinh_luong': current_month,
            'ngay_cong_chuan': 22.0,
            'ngay_cong_thuc_te': 20.5,
            'gio_ot_ngay_thuong': 5.0,
            'gio_ot_cuoi_tuan': 8.0,
            'gio_ot_le_tet': 0.0,
            'ghi_chu': 'Đi công tác 1.5 ngày'
        },
        {
            'ma_nv': 'NV002',
            'ky_tinh_luong': current_month,
            'ngay_cong_chuan': 22.0,
            'ngay_cong_thuc_te': 22.0,
            'gio_ot_ngay_thuong': 2.0,
            'gio_ot_cuoi_tuan': 0.0,
            'gio_ot_le_tet': 0.0,
            'ghi_chu': ''
        },
        {
            'ma_nv': 'NV003',
            'ky_tinh_luong': current_month,
            'ngay_cong_chuan': 22.0,
            'ngay_cong_thuc_te': 21.0,
            'gio_ot_ngay_thuong': 12.0,
            'gio_ot_cuoi_tuan': 16.0,
            'gio_ot_le_tet': 0.0,
            'ghi_chu': 'Hoàn thành dự án quan trọng'
        },
        {
            'ma_nv': 'NV004',
            'ky_tinh_luong': current_month,
            'ngay_cong_chuan': 22.0,
            'ngay_cong_thuc_te': 19.0,
            'gio_ot_ngay_thuong': 3.0,
            'gio_ot_cuoi_tuan': 4.0,
            'gio_ot_le_tet': 0.0,
            'ghi_chu': 'Nghỉ ốm 3 ngày'
        }
    ]

    for timesheet in sample_timesheets:
        result = supabase.table('bang_cham_cong').insert(timesheet).execute()
        print(f'Added timesheet for: {timesheet["ma_nv"]} - {timesheet["ky_tinh_luong"]}')

    # 3. Add sample product salary data
    print("\n3. Adding sample product salary data...")
    current_year = datetime.now().year
    current_month_num = datetime.now().month

    sample_products = [
        {
            'ma_nv': 'NV001',
            'ky_tinh_luong': current_month,
            'san_pham_id': 'SP001',
            'ten_san_pham': 'Dịch vụ tư vấn A',
            'so_luong': 5,
            'don_gia': 2000000,
            'ghi_chu': 'Hoàn thành 5 hợp đồng tư vấn'
        },
        {
            'ma_nv': 'NV001',
            'ky_tinh_luong': current_month,
            'san_pham_id': 'SP002',
            'ten_san_pham': 'Dịch vụ tư vấn B',
            'so_luong': 3,
            'don_gia': 1500000,
            'ghi_chu': 'Hợp đồng nhỏ'
        },
        {
            'ma_nv': 'NV003',
            'ky_tinh_luong': current_month,
            'san_pham_id': 'SP003',
            'ten_san_pham': 'Phát triển phần mềm',
            'so_luong': 2,
            'don_gia': 5000000,
            'ghi_chu': 'Dự án website doanh nghiệp'
        },
        {
            'ma_nv': 'NV004',
            'ky_tinh_luong': current_month,
            'san_pham_id': 'SP004',
            'ten_san_pham': 'Chiến dịch marketing',
            'so_luong': 1,
            'don_gia': 3000000,
            'ghi_chu': 'Chiến dịch quảng cáo sản phẩm mới'
        }
    ]

    for product in sample_products:
        result = supabase.table('luong_san_pham').insert({
            'ma_nv': product['ma_nv'],
            'ky_tinh_luong': product['ky_tinh_luong'],
            'san_pham_id': product['san_pham_id'],
            'ten_san_pham': product['ten_san_pham'],
            'so_luong': product['so_luong'],
            'don_gia': product['don_gia'],
            'ghi_chu': product.get('ghi_chu', '')
        }).execute()
        print(f'Added product salary for: {product["ma_nv"]} - {product["ten_san_pham"]}')

    print("\n✅ Sample payroll data added successfully!")
    print(f"📊 Added {len(sample_employees)} employees")
    print(f"📅 Added {len(sample_timesheets)} timesheets")
    print(f"📦 Added {len(sample_products)} product salary records")
    print(f"\n💡 You can now test the payroll management features in the salary page tabs!")

except Exception as e:
    print(f'❌ Error: {str(e)}')
    import traceback
    traceback.print_exc()
#!/usr/bin/env python3
"""
Script để tạo dữ liệu mẫu cho payroll database
"""
import sys
import os
from datetime import datetime, date

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

from supabase_client import supabase

def insert_sample_data():
    """Insert dữ liệu mẫu vào các bảng payroll"""
    try:
        print("🧪 TẠO DỮ LIỆU MẪU PAYROLL")
        print("=" * 40)

        # Sample employees
        employees = [
            {
                'ma_nv': 'NV001',
                'ho_ten': 'Nguyễn Văn A',
                'chuc_vu': 'Nhân viên kinh doanh',
                'phong_ban': 'Kinh Doanh',
                'luong_hop_dong': 15000000,
                'muc_luong_dong_bhxh': 12000000,
                'so_nguoi_phu_thuoc': 2,
                'email': 'nguyenvana@company.com',
                'dien_thoai': '0901234567',
                'dia_chi': '123 Đường ABC, Quận 1, TP.HCM',
                'ngay_vao_lam': '2023-01-15',
                'username': 'nguyenvana',
                'hashed_password': '$2b$12$nLN8gS9tW6XMb5JzNVRNKu4TOp26Cx7BrN.J42jm7tsBzLxi4cATO',  # Default password
                'role_id': 2,  # Regular user
                'is_active': True
            },
            {
                'ma_nv': 'NV002',
                'ho_ten': 'Trần Thị B',
                'chuc_vu': 'Kế toán',
                'phong_ban': 'Kế Toán',
                'luong_hop_dong': 12000000,
                'muc_luong_dong_bhxh': 10000000,
                'so_nguoi_phu_thuoc': 1,
                'email': 'tranthib@company.com',
                'dien_thoai': '0902345678',
                'dia_chi': '456 Đường XYZ, Quận 2, TP.HCM',
                'ngay_vao_lam': '2023-03-01',
                'username': 'tranthib',
                'hashed_password': '$2b$12$nLN8gS9tW6XMb5JzNVRNKu4TOp26Cx7BrN.J42jm7tsBzLxi4cATO',
                'role_id': 2,
                'is_active': True
            },
            {
                'ma_nv': 'NV003',
                'ho_ten': 'Lê Văn C',
                'chuc_vu': 'Nhân viên sản xuất',
                'phong_ban': 'Sản Xuất',
                'luong_hop_dong': 10000000,
                'muc_luong_dong_bhxh': 9000000,
                'so_nguoi_phu_thuoc': 0,
                'email': 'levanc@company.com',
                'dien_thoai': '0903456789',
                'dia_chi': '789 Đường DEF, Quận 3, TP.HCM',
                'ngay_vao_lam': '2023-06-15',
                'username': 'levanc',
                'hashed_password': '$2b$12$nLN8gS9tW6XMb5JzNVRNKu4TOp26Cx7BrN.J42jm7tsBzLxi4cATO',
                'role_id': 2,
                'is_active': True
            }
        ]

        # Insert employees
        for emp in employees:
            result = supabase.table('employees').insert(emp).execute()
            print(f"✅ Đã tạo nhân viên: {emp['ho_ten']}")

        # Sample timesheets
        timesheets = [
            {
                'ma_nv': 'NV001',
                'ky_tinh_luong': '2024-09',
                'ngay_cong_chuan': 22,
                'ngay_cong_thuc_te': 22,
                'gio_ot_ngay_thuong': 8,
                'gio_ot_cuoi_tuan': 4,
                'gio_ot_le_tet': 0,
                'ghi_chu': 'Hoàn thành tốt KPI tháng'
            },
            {
                'ma_nv': 'NV002',
                'ky_tinh_luong': '2024-09',
                'ngay_cong_chuan': 22,
                'ngay_cong_thuc_te': 20,
                'gio_ot_ngay_thuong': 0,
                'gio_ot_cuoi_tuan': 0,
                'gio_ot_le_tet': 0,
                'ghi_chu': 'Nghỉ 2 ngày có phép'
            },
            {
                'ma_nv': 'NV003',
                'ky_tinh_luong': '2024-09',
                'ngay_cong_chuan': 22,
                'ngay_cong_thuc_te': 22,
                'gio_ot_ngay_thuong': 12,
                'gio_ot_cuoi_tuan': 8,
                'gio_ot_le_tet': 0,
                'ghi_chu': 'Tăng ca nhiều do sản xuất'
            }
        ]

        # Insert timesheets
        for ts in timesheets:
            result = supabase.table('bang_cham_cong').insert(ts).execute()
            print(f"✅ Đã tạo bảng chấm công: {ts['ma_nv']} - {ts['ky_tinh_luong']}")

        # Sample product salaries
        product_salaries = [
            {
                'ma_nv': 'NV001',
                'ky_tinh_luong': '2024-09',
                'san_pham_id': 'SP001',
                'ten_san_pham': 'Dịch vụ tư vấn A',
                'so_luong': 5,
                'don_gia': 2000000
            },
            {
                'ma_nv': 'NV001',
                'ky_tinh_luong': '2024-09',
                'san_pham_id': 'SP002',
                'ten_san_pham': 'Dịch vụ tư vấn B',
                'so_luong': 3,
                'don_gia': 1500000
            },
            {
                'ma_nv': 'NV003',
                'ky_tinh_luong': '2024-09',
                'san_pham_id': 'SP003',
                'ten_san_pham': 'Sản phẩm X',
                'so_luong': 100,
                'don_gia': 50000
            }
        ]

        # Insert product salaries
        for ps in product_salaries:
            result = supabase.table('luong_san_pham').insert(ps).execute()
            print(f"✅ Đã tạo lương sản phẩm: {ps['ma_nv']} - {ps['ten_san_pham']}")

        # Sample payslips
        payslips = [
            {
                'ma_nv': 'NV001',
                'ky_tinh_luong': '2024-09',
                'tong_thu_nhap': 25000000,
                'tong_khau_tru': 1500000,
                'luong_thuc_nhan': 23500000,
                'chi_tiet_thu_nhap': {
                    'luong_co_ban': 15000000,
                    'luong_san_pham': 9000000,
                    'tien_ot': 1000000
                },
                'chi_tiet_khau_tru': {
                    'bhxh': 800000,
                    'bhyt': 300000,
                    'bhtn': 200000,
                    'thue_tncn': 200000
                },
                'trang_thai': 'approved',
                'ngay_duyet': '2024-09-30',
                'nguoi_duyet': 'Admin'
            },
            {
                'ma_nv': 'NV002',
                'ky_tinh_luong': '2024-09',
                'tong_thu_nhap': 12000000,
                'tong_khau_tru': 800000,
                'luong_thuc_nhan': 11200000,
                'chi_tiet_thu_nhap': {
                    'luong_co_ban': 12000000
                },
                'chi_tiet_khau_tru': {
                    'bhxh': 500000,
                    'bhyt': 150000,
                    'bhtn': 100000,
                    'thue_tncn': 50000
                },
                'trang_thai': 'approved',
                'ngay_duyet': '2024-09-30',
                'nguoi_duyet': 'Admin'
            }
        ]

        # Insert payslips
        for ps in payslips:
            result = supabase.table('phieu_luong').insert(ps).execute()
            print(f"✅ Đã tạo phiếu lương: {ps['ma_nv']} - {ps['ky_tinh_luong']}")

        print("\n✅ HOÀN THÀNH TẠO DỮ LIỆU MẪU!")

    except Exception as e:
        print(f"❌ Lỗi tạo dữ liệu mẫu: {e}")

if __name__ == "__main__":
    insert_sample_data()
import pytest
from payroll_models import NhanVien, BangChamCong, LuongSanPham
from payroll_service import tinh_luong, tinh_thue_theo_bieu_luy_tien, load_config

def test_tinh_thue_theo_bieu_luy_tien():
    config = load_config()
    bieu_thue = config['bieu_thue_tncn']

    # Test case 1: Thu nhập dưới 5 triệu
    assert tinh_thue_theo_bieu_luy_tien(4000000, bieu_thue) == 200000

    # Test case 2: Thu nhập trên 5 triệu
    assert tinh_thue_theo_bieu_luy_tien(8000000, bieu_thue) == 550000

    # Test case 3: Thu nhập cao
    assert tinh_thue_theo_bieu_luy_tien(50000000, bieu_thue) == 9250000

def test_tinh_luong_basic():
    config = load_config()

    nhan_vien = NhanVien(
        ma_nv="NV001",
        ho_ten="Nguyễn Văn A",
        chuc_vu="Nhân viên",
        phong_ban="IT",
        luong_hop_dong=30000000,
        muc_luong_dong_bhxh=25000000,
        so_nguoi_phu_thuoc=1
    )

    cham_cong = BangChamCong(
        ma_nv="NV001",
        ky_tinh_luong="2024-10",
        ngay_cong_chuan=22,
        ngay_cong_thuc_te=22,
        gio_ot_ngay_thuong=0,
        gio_ot_cuoi_tuan=0,
        gio_ot_le_tet=0
    )

    luong_san_pham = []

    phieu_luong = tinh_luong(nhan_vien, cham_cong, luong_san_pham, config)

    assert phieu_luong.ma_nv == "NV001"
    assert phieu_luong.tong_thu_nhap == 30000000
    assert phieu_luong.luong_thuc_nhan > 0

def test_tinh_luong_with_ot():
    config = load_config()

    nhan_vien = NhanVien(
        ma_nv="NV002",
        ho_ten="Trần Thị B",
        chuc_vu="Nhân viên",
        phong_ban="HR",
        luong_hop_dong=25000000,
        muc_luong_dong_bhxh=20000000,
        so_nguoi_phu_thuoc=0
    )

    cham_cong = BangChamCong(
        ma_nv="NV002",
        ky_tinh_luong="2024-10",
        ngay_cong_chuan=22,
        ngay_cong_thuc_te=20,
        gio_ot_ngay_thuong=10,
        gio_ot_cuoi_tuan=5,
        gio_ot_le_tet=0
    )

    luong_san_pham = [
        LuongSanPham("NV002", "2024-10", "SP001", 100, 50000)
    ]

    phieu_luong = tinh_luong(nhan_vien, cham_cong, luong_san_pham, config)

    # Kiểm tra lương tăng ca
    luong_gio = 25000000 / (22 * 8)
    expected_ot = luong_gio * 10 * 1.5 + luong_gio * 5 * 2.0
    assert abs(phieu_luong.chi_tiet_thu_nhap['luong_tang_ca'] - expected_ot) < 1

    # Kiểm tra lương sản phẩm
    assert phieu_luong.chi_tiet_thu_nhap['luong_san_pham'] == 5000000
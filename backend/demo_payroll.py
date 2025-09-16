from payroll_models import NhanVien, BangChamCong, LuongSanPham
from payroll_service import tinh_luong, load_config

def main():
    # Load config
    config = load_config()

    # Tạo dữ liệu mẫu
    nhan_vien = NhanVien(
        ma_nv="NV001",
        ho_ten="Nguyễn Văn A",
        chuc_vu="Nhân viên IT",
        phong_ban="Công nghệ thông tin",
        luong_hop_dong=30000000,
        muc_luong_dong_bhxh=25000000,
        so_nguoi_phu_thuoc=1
    )

    cham_cong = BangChamCong(
        ma_nv="NV001",
        ky_tinh_luong="2024-10",
        ngay_cong_chuan=22,
        ngay_cong_thuc_te=22,
        gio_ot_ngay_thuong=5,
        gio_ot_cuoi_tuan=2,
        gio_ot_le_tet=0
    )

    luong_san_pham = [
        LuongSanPham("NV001", "2024-10", "SP001", 50, 100000),
        LuongSanPham("NV001", "2024-10", "SP002", 30, 150000)
    ]

    # Tính lương
    phieu_luong = tinh_luong(nhan_vien, cham_cong, luong_san_pham, config, phu_cap_khac=500000, thuong_kpi=2000000)

    # In kết quả
    print("=== PHIẾU LƯƠNG ===")
    print(f"Mã NV: {phieu_luong.ma_nv}")
    print(f"Họ tên: {phieu_luong.ho_ten}")
    print(f"Kỳ tính lương: {phieu_luong.ky_tinh_luong}")
    print("\n--- CHI TIẾT THU NHẬP ---")
    for k, v in phieu_luong.chi_tiet_thu_nhap.items():
        print(f"{k}: {v:,.0f} VND")
    print(f"Tổng thu nhập: {phieu_luong.tong_thu_nhap:,.0f} VND")
    print("\n--- CHI TIẾT KHẤU TRỪ ---")
    for k, v in phieu_luong.chi_tiet_khau_tru.items():
        print(f"{k}: {v:,.0f} VND")
    print(f"Tổng khấu trừ: {phieu_luong.tong_khau_tru:,.0f} VND")
    print(f"\nLương thực nhận: {phieu_luong.luong_thuc_nhan:,.0f} VND")

if __name__ == "__main__":
    main()
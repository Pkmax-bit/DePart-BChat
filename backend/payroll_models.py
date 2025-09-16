from dataclasses import dataclass
from typing import List

@dataclass
class NhanVien:
    ma_nv: str
    ho_ten: str
    chuc_vu: str
    phong_ban: str
    luong_hop_dong: float
    muc_luong_dong_bhxh: float
    so_nguoi_phu_thuoc: int

@dataclass
class BangChamCong:
    ma_nv: str
    ky_tinh_luong: str
    ngay_cong_chuan: float
    ngay_cong_thuc_te: float
    gio_ot_ngay_thuong: float
    gio_ot_cuoi_tuan: float
    gio_ot_le_tet: float

@dataclass
class LuongSanPham:
    ma_nv: str
    ky_tinh_luong: str
    san_pham_id: str
    so_luong: float
    gia_thanh: float
    ty_le: float

@dataclass
class PhieuLuong:
    ma_nv: str
    ho_ten: str
    ky_tinh_luong: str
    chi_tiet_thu_nhap: dict
    tong_thu_nhap: float
    chi_tiet_khau_tru: dict
    tong_khau_tru: float
    luong_thuc_nhan: float
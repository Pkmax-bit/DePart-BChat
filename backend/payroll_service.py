import json
from typing import List, Dict, Any
from payroll_models import NhanVien, BangChamCong, LuongSanPham, PhieuLuong

def load_config() -> Dict[str, Any]:
    with open('payroll_config.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def tinh_thue_theo_bieu_luy_tien(thu_nhap_tinh_thue: float, bieu_thue: List[Dict[str, float]]) -> float:
    if thu_nhap_tinh_thue <= 0:
        return 0

    # Tìm bậc thuế phù hợp
    bac_phu_hop = None
    for bac in reversed(bieu_thue):
        if thu_nhap_tinh_thue > bac['muc_thu_nhap']:
            bac_phu_hop = bac
            break

    if bac_phu_hop is None:
        bac_phu_hop = bieu_thue[0]  # Bậc đầu tiên

    thue = thu_nhap_tinh_thue * bac_phu_hop['thue_suat'] - bac_phu_hop['so_tien_giam_tru']
    return round(thue)

def tinh_luong(nhan_vien: NhanVien, cham_cong: BangChamCong, luong_san_pham: List[LuongSanPham], config: Dict[str, Any], phu_cap_khac: float = 0, thuong_kpi: float = 0) -> PhieuLuong:
    # Tính lương theo ngày công
    luong_thuc_te = round((nhan_vien.luong_hop_dong / cham_cong.ngay_cong_chuan) * cham_cong.ngay_cong_thuc_te)

    # Tính lương tăng ca
    luong_gio = nhan_vien.luong_hop_dong / (cham_cong.ngay_cong_chuan * 8)
    tien_ot = round(luong_gio * cham_cong.gio_ot_ngay_thuong * config['he_so_ot_ngay_thuong'] +
               luong_gio * cham_cong.gio_ot_cuoi_tuan * config['he_so_ot_cuoi_tuan'] +
               luong_gio * cham_cong.gio_ot_le_tet * config['he_so_ot_le_tet'])

    # Tính lương sản phẩm
    tien_luong_sp = round(sum(sp.so_luong * sp.don_gia * (sp.ty_le / 100) for sp in luong_san_pham))

    # Tổng thu nhập
    tong_thu_nhap = round(luong_thuc_te + tien_ot + tien_luong_sp + phu_cap_khac + thuong_kpi)

    # Tính bảo hiểm
    tien_bhxh = round(nhan_vien.muc_luong_dong_bhxh * config['ty_le_bhxh_nv'])
    tien_bhyt = round(nhan_vien.muc_luong_dong_bhxh * config['ty_le_bhyt_nv'])
    tien_bhtn = round(nhan_vien.muc_luong_dong_bhxh * config['ty_le_bhtn_nv'])
    tong_bao_hiem = round(tien_bhxh + tien_bhyt + tien_bhtn)

    # Tính thuế TNCN
    thu_nhap_chiu_thue = tong_thu_nhap  # Giả sử không có khoản miễn thuế khác
    giam_tru_tong_cong = round(config['giam_tru_gia_canh_ban_than'] +
                          nhan_vien.so_nguoi_phu_thuoc * config['giam_tru_nguoi_phu_thuoc'] +
                          tong_bao_hiem)
    thu_nhap_tinh_thue = max(0, thu_nhap_chiu_thue - giam_tru_tong_cong)
    thue_tncn = tinh_thue_theo_bieu_luy_tien(thu_nhap_tinh_thue, config['bieu_thue_tncn'])

    # Tổng khấu trừ
    tong_khau_tru = round(tong_bao_hiem + thue_tncn)

    # Lương thực nhận
    luong_thuc_nhan = round(tong_thu_nhap - tong_khau_tru)

    chi_tiet_thu_nhap = {
        "luong_theo_ngay_cong": luong_thuc_te,
        "luong_tang_ca": tien_ot,
        "luong_san_pham": tien_luong_sp,
        "phu_cap_khac": phu_cap_khac
    }

    chi_tiet_khau_tru = {
        "bhxh": tien_bhxh,
        "bhyt": tien_bhyt,
        "bhtn": tien_bhtn,
        "thue_tncn": thue_tncn,
        "tam_ung": 0  # Có thể thêm sau
    }

    return PhieuLuong(
        ma_nv=nhan_vien.ma_nv,
        ho_ten=nhan_vien.ho_ten,
        ky_tinh_luong=cham_cong.ky_tinh_luong,
        chi_tiet_thu_nhap=chi_tiet_thu_nhap,
        tong_thu_nhap=tong_thu_nhap,
        chi_tiet_khau_tru=chi_tiet_khau_tru,
        tong_khau_tru=tong_khau_tru,
        luong_thuc_nhan=luong_thuc_nhan
    )
from fastapi import APIRouter, HTTPException, Query, Depends
from supabase_client import supabase, SUPABASE_AVAILABLE
from models import *
from payroll_service import tinh_luong, load_config
from payroll_models import NhanVien as PayrollNhanVien, BangChamCong as PayrollBangChamCong, LuongSanPham as PayrollLuongSanPham
from typing import List, Optional
import json

router = APIRouter(prefix="/payroll", tags=["payroll"])

# ===== NHÂN VIÊN ENDPOINTS =====

@router.post("/nhan-vien", response_model=NhanVienResponse)
def create_nhan_vien(nhan_vien: NhanVienCreate):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra mã NV đã tồn tại
        existing = supabase.table('nhan_vien').select('ma_nv').eq('ma_nv', nhan_vien.ma_nv).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Mã nhân viên đã tồn tại")

        # Insert vào database
        data = nhan_vien.dict()
        result = supabase.table('nhan_vien').insert(data).execute()

        return NhanVienResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo nhân viên: {str(e)}")

@router.get("/nhan-vien", response_model=List[NhanVienResponse])
def get_nhan_vien_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    phong_ban: Optional[str] = None
):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        query = supabase.table('nhan_vien').select('*')

        if search:
            query = query.or_(f'ho_ten.ilike.%{search}%,ma_nv.ilike.%{search}%')

        if phong_ban:
            query = query.eq('phong_ban', phong_ban)

        result = query.range(skip, skip + limit - 1).order('created_at', desc=True).execute()

        return [NhanVienResponse(**item) for item in result.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy danh sách nhân viên: {str(e)}")

@router.get("/nhan-vien/{ma_nv}", response_model=NhanVienResponse)
def get_nhan_vien(ma_nv: str):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        result = supabase.table('nhan_vien').select('*').eq('ma_nv', ma_nv).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")

        return NhanVienResponse(**result.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy thông tin nhân viên: {str(e)}")

@router.put("/nhan-vien/{ma_nv}", response_model=NhanVienResponse)
def update_nhan_vien(ma_nv: str, update_data: NhanVienUpdate):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra tồn tại
        existing = supabase.table('nhan_vien').select('ma_nv').eq('ma_nv', ma_nv).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")

        # Cập nhật
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        if update_dict:
            result = supabase.table('nhan_vien').update(update_dict).eq('ma_nv', ma_nv).execute()
            return NhanVienResponse(**result.data[0])
        else:
            return get_nhan_vien(ma_nv)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật nhân viên: {str(e)}")

@router.delete("/nhan-vien/{ma_nv}")
def delete_nhan_vien(ma_nv: str):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        result = supabase.table('nhan_vien').delete().eq('ma_nv', ma_nv).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")

        return {"message": "Đã xóa nhân viên thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xóa nhân viên: {str(e)}")

# ===== CHẤM CÔNG ENDPOINTS =====

@router.post("/bang-cham-cong", response_model=BangChamCongResponse)
def create_cham_cong(cham_cong: BangChamCongCreate):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra nhân viên tồn tại
        nv = supabase.table('nhan_vien').select('ma_nv').eq('ma_nv', cham_cong.ma_nv).execute()
        if not nv.data:
            raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")

        # Kiểm tra đã có dữ liệu cho kỳ này chưa
        existing = supabase.table('bang_cham_cong').select('id').eq('ma_nv', cham_cong.ma_nv).eq('ky_tinh_luong', cham_cong.ky_tinh_luong).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Đã có dữ liệu chấm công cho kỳ này")

        # Insert
        result = supabase.table('bang_cham_cong').insert(cham_cong.dict()).execute()

        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Tạo bảng chấm công thất bại")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/bang-cham-cong", response_model=List[BangChamCongResponse])
def get_cham_cong_list(
    ma_nv: Optional[str] = None,
    ky_tinh_luong: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        query = supabase.table('bang_cham_cong').select('*')

        if ma_nv:
            query = query.eq('ma_nv', ma_nv)

        if ky_tinh_luong:
            query = query.eq('ky_tinh_luong', ky_tinh_luong)

        query = query.range(skip, skip + limit - 1).order('ky_tinh_luong', desc=True).order('ma_nv')

        result = query.execute()
        return result.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/bang-cham-cong/{id}", response_model=BangChamCongResponse)
def update_cham_cong(id: int, update_data: BangChamCongUpdate):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra tồn tại
        existing = supabase.table('bang_cham_cong').select('id').eq('id', id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Dữ liệu chấm công không tồn tại")

        # Cập nhật
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        if update_dict:
            update_dict['updated_at'] = 'now()'

            result = supabase.table('bang_cham_cong').update(update_dict).eq('id', id).execute()

            if result.data:
                return result.data[0]
            else:
                raise HTTPException(status_code=500, detail="Cập nhật thất bại")

        # Nếu không có gì để cập nhật, lấy dữ liệu hiện tại
        result = supabase.table('bang_cham_cong').select('*').eq('id', id).execute()
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/bang-cham-cong/{id}")
def delete_cham_cong(id: int):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra tồn tại
        existing = supabase.table('bang_cham_cong').select('id').eq('id', id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Dữ liệu chấm công không tồn tại")

        # Xóa
        result = supabase.table('bang_cham_cong').delete().eq('id', id).execute()

        if result.data:
            return {"message": "Xóa thành công"}
        else:
            raise HTTPException(status_code=500, detail="Xóa thất bại")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ===== LƯƠNG SẢN PHẨM ENDPOINTS =====

@router.post("/luong-san-pham", response_model=LuongSanPhamResponse)
def create_luong_san_pham(luong_sp: LuongSanPhamCreate):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra nhân viên tồn tại
        nv = supabase.table('nhan_vien').select('ma_nv').eq('ma_nv', luong_sp.ma_nv).execute()
        if not nv.data:
            raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")

        # Insert
        insert_data = luong_sp.dict()
        # Remove thanh_tien from insert data since it's a generated column
        insert_data.pop('thanh_tien', None)

        result = supabase.table('luong_san_pham').insert(insert_data).execute()

        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Tạo thất bại")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/luong-san-pham", response_model=List[LuongSanPhamResponse])
def get_luong_san_pham_list(
    ma_nv: Optional[str] = None,
    ky_tinh_luong: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        query = supabase.table('luong_san_pham').select('*')

        if ma_nv:
            query = query.eq('ma_nv', ma_nv)

        if ky_tinh_luong:
            query = query.eq('ky_tinh_luong', ky_tinh_luong)

        result = query.order('ky_tinh_luong', desc=True).order('ma_nv').range(skip, skip + limit - 1).execute()

        return result.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/luong-san-pham/{id}", response_model=LuongSanPhamResponse)
def update_luong_san_pham(id: int, update_data: LuongSanPhamUpdate):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra tồn tại
        existing = supabase.table('luong_san_pham').select('id').eq('id', id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Dữ liệu lương sản phẩm không tồn tại")

        # Cập nhật
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        if update_dict:
            update_dict['updated_at'] = 'now()'

            result = supabase.table('luong_san_pham').update(update_dict).eq('id', id).execute()

            if result.data:
                return result.data[0]
            else:
                raise HTTPException(status_code=500, detail="Cập nhật thất bại")

        # Nếu không có gì để cập nhật, lấy dữ liệu hiện tại
        result = supabase.table('luong_san_pham').select('*').eq('id', id).execute()
        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/luong-san-pham/{id}")
def delete_luong_san_pham(id: int):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Kiểm tra tồn tại
        existing = supabase.table('luong_san_pham').select('id').eq('id', id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Dữ liệu lương sản phẩm không tồn tại")

        # Xóa
        result = supabase.table('luong_san_pham').delete().eq('id', id).execute()

        if result.data:
            return {"message": "Xóa thành công"}
        else:
            raise HTTPException(status_code=500, detail="Xóa thất bại")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ===== TÍNH LƯƠNG ENDPOINT =====

@router.post("/tinh-luong", response_model=PhieuLuongResponse)
def tinh_luong_endpoint(request: TinhLuongRequest):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Lấy dữ liệu nhân viên
        nv_result = supabase.table('nhan_vien').select('ma_nv, ho_ten, chuc_vu, phong_ban, luong_hop_dong, muc_luong_dong_bhxh, so_nguoi_phu_thuoc').eq('ma_nv', request.ma_nv).execute()
        if not nv_result.data:
            raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")

        nhan_vien = PayrollNhanVien(**nv_result.data[0])

        # Lấy dữ liệu chấm công
        cc_result = supabase.table('bang_cham_cong').select('ma_nv, ky_tinh_luong, ngay_cong_chuan, ngay_cong_thuc_te, gio_ot_ngay_thuong, gio_ot_cuoi_tuan, gio_ot_le_tet').eq('ma_nv', request.ma_nv).eq('ky_tinh_luong', request.ky_tinh_luong).execute()
        if not cc_result.data:
            raise HTTPException(status_code=404, detail="Không có dữ liệu chấm công cho kỳ này")

        cham_cong = PayrollBangChamCong(**cc_result.data[0])

        # Lấy dữ liệu lương sản phẩm
        sp_results = supabase.table('luong_san_pham').select('ma_nv, ky_tinh_luong, san_pham_id, so_luong, don_gia, ty_le').eq('ma_nv', request.ma_nv).eq('ky_tinh_luong', request.ky_tinh_luong).execute()
        luong_san_pham = [PayrollLuongSanPham(**row) for row in sp_results.data]

        # Tính lương
        config = load_config()
        phieu_luong = tinh_luong(nhan_vien, cham_cong, luong_san_pham, config,
                                request.phu_cap_khac, request.thuong_kpi)

        # Lưu vào database
        upsert_data = {
            "ma_nv": phieu_luong.ma_nv,
            "ky_tinh_luong": phieu_luong.ky_tinh_luong,
            "tong_thu_nhap": phieu_luong.tong_thu_nhap,
            "tong_khau_tru": phieu_luong.tong_khau_tru,
            "luong_thuc_nhan": phieu_luong.luong_thuc_nhan,
            "chi_tiet_thu_nhap": json.dumps(phieu_luong.chi_tiet_thu_nhap),
            "chi_tiet_khau_tru": json.dumps(phieu_luong.chi_tiet_khau_tru)
        }

        result = supabase.table('phieu_luong').upsert(upsert_data, on_conflict='ma_nv,ky_tinh_luong').execute()

        # Return response từ object phieu_luong đã tính toán
        return PhieuLuongResponse(
            id=result.data[0]['id'] if result.data else None,
            ma_nv=phieu_luong.ma_nv,
            ky_tinh_luong=phieu_luong.ky_tinh_luong,
            tong_thu_nhap=phieu_luong.tong_thu_nhap,
            tong_khau_tru=phieu_luong.tong_khau_tru,
            luong_thuc_nhan=phieu_luong.luong_thuc_nhan,
            chi_tiet_thu_nhap=phieu_luong.chi_tiet_thu_nhap,
            chi_tiet_khau_tru=phieu_luong.chi_tiet_khau_tru,
            trang_thai=result.data[0].get('trang_thai') if result.data else None,
            ngay_tao=result.data[0].get('ngay_tao') if result.data else None,
            ngay_duyet=result.data[0].get('ngay_duyet') if result.data else None,
            nguoi_duyet=result.data[0].get('nguoi_duyet') if result.data else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tính lương: {str(e)}")

@router.get("/phieu-luong", response_model=List[PhieuLuongResponse])
def get_phieu_luong_list(
    ma_nv: Optional[str] = None,
    ky_tinh_luong: Optional[str] = None,
    trang_thai: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    if not SUPABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        query = supabase.table('phieu_luong').select('*')

        if ma_nv:
            query = query.eq('ma_nv', ma_nv)

        if ky_tinh_luong:
            query = query.eq('ky_tinh_luong', ky_tinh_luong)

        if trang_thai:
            query = query.eq('trang_thai', trang_thai)

        result = query.order('ky_tinh_luong', desc=True).order('ma_nv').range(skip, skip + limit - 1).execute()

        response_list = []
        for row in result.data:
            # Parse JSON fields trước khi tạo response object
            parsed_row = dict(row)
            try:
                parsed_row['chi_tiet_thu_nhap'] = json.loads(row['chi_tiet_thu_nhap']) if row['chi_tiet_thu_nhap'] else {}
            except (json.JSONDecodeError, TypeError):
                parsed_row['chi_tiet_thu_nhap'] = {}
            try:
                parsed_row['chi_tiet_khau_tru'] = json.loads(row['chi_tiet_khau_tru']) if row['chi_tiet_khau_tru'] else {}
            except (json.JSONDecodeError, TypeError):
                parsed_row['chi_tiet_khau_tru'] = {}
            
            item = PhieuLuongResponse(**parsed_row)
            response_list.append(item)

        return response_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
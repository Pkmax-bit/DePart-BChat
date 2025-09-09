from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from typing import List

router = APIRouter()

@router.get("/loainhom/")
async def get_loainhom():
    """Lấy danh sách loại nhôm"""
    try:
        result = supabase.table('loainhom').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loainhom: {str(e)}")

@router.get("/loaikinh/")
async def get_loaikinh():
    """Lấy danh sách loại kính"""
    try:
        result = supabase.table('loaikinh').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loaikinh: {str(e)}")

@router.get("/loaitaynam/")
async def get_loaitaynam():
    """Lấy danh sách loại tay nắm"""
    try:
        result = supabase.table('loaitaynam').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loaitaynam: {str(e)}")

@router.get("/bophan/")
async def get_bophan():
    """Lấy danh sách bộ phận"""
    try:
        result = supabase.table('bophan').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bophan: {str(e)}")

@router.get("/sanpham/")
async def get_sanpham():
    """Lấy danh sách sản phẩm"""
    try:
        result = supabase.table('sanpham').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sanpham: {str(e)}")

@router.get("/chitietsanpham/")
async def get_chitietsanpham():
    """Lấy danh sách chi tiết sản phẩm"""
    try:
        result = supabase.table('chitietsanpham').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chitietsanpham: {str(e)}")

@router.post("/invoices/")
async def create_invoice(invoice_data: dict):
    """Tạo hóa đơn mới"""
    try:
        # Tạo hóa đơn chính
        invoice_result = supabase.table('invoices').insert({
            'customer_name': invoice_data['customer_name'],
            'invoice_date': invoice_data['invoice_date'],
            'total_amount': invoice_data['total_amount']
        }).execute()

        invoice_id = invoice_result.data[0]['id']

        # Thêm chi tiết hóa đơn
        for item in invoice_data['items']:
            supabase.table('invoice_items').insert({
                'invoice_id': invoice_id,
                'id_nhom': item['id_nhom'],
                'id_kinh': item['id_kinh'],
                'id_taynam': item['id_taynam'],
                'id_bophan': item['id_bophan'],
                'sanpham_id': item['sanpham_id'],
                'ngang': item['ngang'],
                'cao': item['cao'],
                'sau': item['sau'],
                'so_luong': item['so_luong'],
                'don_gia': item['don_gia'],
                'dien_tich_ke_hoach': item['dien_tich_ke_hoach'],
                'dien_tich_thuc_te': item['dien_tich_thuc_te'],
                'ti_le': item['ti_le'],
                'thanh_tien': item['thanh_tien']
            }).execute()

        return {"message": "Invoice created successfully", "invoice_id": invoice_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating invoice: {str(e)}")
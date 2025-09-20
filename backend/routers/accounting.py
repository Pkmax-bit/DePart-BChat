from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from typing import List
from datetime import datetime

router = APIRouter(prefix="/accounting")

def update_parent_giathanh(parent_id: int):
    """Update the giathanh of a parent expense based on its direct children IN THE SAME MONTH"""
    try:
        # Get parent expense info to determine the month
        parent_result = supabase.table('quanly_chiphi').select('created_at').eq('id', parent_id).execute()
        if not parent_result.data:
            print(f"Parent expense {parent_id} not found")
            return

        parent_data = parent_result.data[0]
        parent_created_at = parent_data.get('created_at')

        if not parent_created_at:
            print(f"Parent expense {parent_id} has no creation date")
            return

        # Extract month from parent creation date
        if isinstance(parent_created_at, str):
            parent_month = parent_created_at[:7]  # YYYY-MM
        else:
            parent_month = parent_created_at.strftime('%Y-%m')

        # Get all direct children
        children_result = supabase.table('quanly_chiphi').select('giathanh, created_at').eq('parent_id', parent_id).execute()

        # Filter children from the same month
        same_month_children = []
        for child in children_result.data:
            child_created_at = child.get('created_at')
            if child_created_at:
                if isinstance(child_created_at, str):
                    child_month = child_created_at[:7]  # YYYY-MM
                else:
                    child_month = child_created_at.strftime('%Y-%m')

                if child_month == parent_month:
                    same_month_children.append(child)

        # Calculate total from same-month children
        total_children = sum(child['giathanh'] or 0 for child in same_month_children)

        # Update parent giathanh
        supabase.table('quanly_chiphi').update({
            'giathanh': total_children
        }).eq('id', parent_id).execute()

        print(f"Updated parent expense {parent_id} (month {parent_month}): {total_children}")

        # Recursively update grandparent if exists
        parent_result = supabase.table('quanly_chiphi').select('parent_id').eq('id', parent_id).execute()
        if parent_result.data and parent_result.data[0].get('parent_id'):
            update_parent_giathanh(parent_result.data[0]['parent_id'])

    except Exception as e:
        print(f"Error updating parent giathanh: {e}")

@router.get("/loainhom/")
async def get_loainhom():
    """Lấy danh sách loại nhôm"""
    try:
        result = supabase.table('loainhom').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loainhom: {str(e)}")

@router.post("/loainhom/")
async def create_loainhom(loainhom_data: dict):
    """Tạo loại nhôm mới"""
    try:
        result = supabase.table('loainhom').insert({
            'tenloai': loainhom_data['tenloai'],
            'mo_ta': loainhom_data.get('mo_ta', '')
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating loainhom: {str(e)}")

@router.put("/loainhom/{loai_id}")
async def update_loainhom(loai_id: int, loainhom_data: dict):
    """Cập nhật loại nhôm"""
    try:
        result = supabase.table('loainhom').update({
            'tenloai': loainhom_data['tenloai'],
            'mo_ta': loainhom_data.get('mo_ta', '')
        }).eq('id', loai_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating loainhom: {str(e)}")

@router.delete("/loainhom/{loai_id}")
async def delete_loainhom(loai_id: int):
    """Xóa loại nhôm"""
    try:
        result = supabase.table('loainhom').delete().eq('id', loai_id).execute()
        return {"message": "Loại nhôm đã được xóa thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting loainhom: {str(e)}")

@router.get("/loaiphukienbep/")
async def get_loaiphukienbep():
    """Lấy danh sách loại phụ kiện bếp"""
    try:
        result = supabase.table('loaiphukienbep').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loaiphukienbep: {str(e)}")

@router.get("/phukienbep/")
async def get_phukienbep():
    """Lấy danh sách phụ kiện bếp"""
    try:
        result = supabase.table('phukienbep').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching phukienbep: {str(e)}")

@router.post("/phukienbep/")
async def create_phukienbep(phukien_data: dict):
    """Tạo phụ kiện bếp mới"""
    try:
        result = supabase.table('phukienbep').insert({
            'id_loaiphukien': phukien_data['id_loaiphukien'],
            'tenphukien': phukien_data['tenphukien'],
            'thuong_hieu': phukien_data.get('thuong_hieu', ''),
            'model': phukien_data.get('model', ''),
            'cong_suat': phukien_data.get('cong_suat', ''),
            'kich_thuoc': phukien_data.get('kich_thuoc', ''),
            'trong_luong': phukien_data.get('trong_luong'),
            'don_gia': phukien_data['don_gia'],
            'mo_ta': phukien_data.get('mo_ta', ''),
            'hinh_anh': phukien_data.get('hinh_anh', ''),
            'thong_so_ky_thuat': phukien_data.get('thong_so_ky_thuat', ''),
            'bao_hanh': phukien_data.get('bao_hanh', ''),
            'xuat_xu': phukien_data.get('xuat_xu', '')
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating phukienbep: {str(e)}")

@router.put("/phukienbep/{phukien_id}")
async def update_phukienbep(phukien_id: int, phukien_data: dict):
    """Cập nhật phụ kiện bếp"""
    try:
        result = supabase.table('phukienbep').update({
            'id_loaiphukien': phukien_data['id_loaiphukien'],
            'tenphukien': phukien_data['tenphukien'],
            'thuong_hieu': phukien_data.get('thuong_hieu', ''),
            'model': phukien_data.get('model', ''),
            'cong_suat': phukien_data.get('cong_suat', ''),
            'kich_thuoc': phukien_data.get('kich_thuoc', ''),
            'trong_luong': phukien_data.get('trong_luong'),
            'don_gia': phukien_data['don_gia'],
            'mo_ta': phukien_data.get('mo_ta', ''),
            'hinh_anh': phukien_data.get('hinh_anh', ''),
            'thong_so_ky_thuat': phukien_data.get('thong_so_ky_thuat', ''),
            'bao_hanh': phukien_data.get('bao_hanh', ''),
            'xuat_xu': phukien_data.get('xuat_xu', ''),
            'updated_at': 'now()'
        }).eq('id', phukien_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating phukienbep: {str(e)}")

@router.delete("/phukienbep/{phukien_id}")
async def delete_phukienbep(phukien_id: int):
    """Xóa phụ kiện bếp"""
    try:
        result = supabase.table('phukienbep').delete().eq('id', phukien_id).execute()
        return {"message": "Phụ kiện bếp đã được xóa thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting phukienbep: {str(e)}")

@router.post("/loaiphukienbep/")
async def create_loaiphukienbep(loaiphukien_data: dict):
    """Tạo loại phụ kiện bếp mới"""
    try:
        result = supabase.table('loaiphukienbep').insert({
            'tenloai': loaiphukien_data['tenloai'],
            'mo_ta': loaiphukien_data.get('mo_ta', '')
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating loaiphukienbep: {str(e)}")

@router.put("/loaiphukienbep/{loai_id}")
async def update_loaiphukienbep(loai_id: int, loaiphukien_data: dict):
    """Cập nhật loại phụ kiện bếp"""
    try:
        result = supabase.table('loaiphukienbep').update({
            'tenloai': loaiphukien_data['tenloai'],
            'mo_ta': loaiphukien_data.get('mo_ta', '')
        }).eq('id', loai_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating loaiphukienbep: {str(e)}")

@router.delete("/loaiphukienbep/{loai_id}")
async def delete_loaiphukienbep(loai_id: int):
    """Xóa loại phụ kiện bếp"""
    try:
        result = supabase.table('loaiphukienbep').delete().eq('id', loai_id).execute()
        return {"message": "Loại phụ kiện bếp đã được xóa thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting loaiphukienbep: {str(e)}")

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

@router.post("/sanpham/")
async def create_sanpham(product_data: dict):
    """Tạo sản phẩm mới"""
    try:
        result = supabase.table('sanpham').insert({
            'tensp': product_data['tensp'],
            'id_nhom': product_data.get('id_nhom'),
            'id_kinh': product_data.get('id_kinh'),
            'id_taynam': product_data.get('id_taynam'),
            'id_bophan': product_data.get('id_bophan')
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating sanpham: {str(e)}")

@router.put("/sanpham/{product_id}")
async def update_sanpham(product_id: int, product_data: dict):
    """Cập nhật sản phẩm"""
    try:
        result = supabase.table('sanpham').update({
            'tensp': product_data['tensp'],
            'id_nhom': product_data.get('id_nhom'),
            'id_kinh': product_data.get('id_kinh'),
            'id_taynam': product_data.get('id_taynam'),
            'id_bophan': product_data.get('id_bophan')
        }).eq('id', product_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating sanpham: {str(e)}")

@router.delete("/sanpham/{product_id}")
async def delete_sanpham(product_id: int):
    """Xóa sản phẩm"""
    try:
        # First delete related product details
        supabase.table('chitietsanpham').delete().eq('id_sanpham', product_id).execute()
        # Then delete the product
        result = supabase.table('sanpham').delete().eq('id', product_id).execute()
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting sanpham: {str(e)}")

@router.post("/chitietsanpham/")
async def create_chitietsanpham(detail_data: dict):
    """Tạo chi tiết sản phẩm mới"""
    try:
        result = supabase.table('chitietsanpham').insert({
            'id_sanpham': detail_data['id_sanpham'],
            'ngang': detail_data['ngang'],
            'cao': detail_data['cao'],
            'sau': detail_data['sau'],
            'don_gia': detail_data['don_gia']
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chitietsanpham: {str(e)}")

@router.put("/chitietsanpham/{detail_id}")
async def update_chitietsanpham(detail_id: int, detail_data: dict):
    """Cập nhật chi tiết sản phẩm"""
    try:
        result = supabase.table('chitietsanpham').update({
            'id_sanpham': detail_data['id_sanpham'],
            'ngang': detail_data['ngang'],
            'cao': detail_data['cao'],
            'sau': detail_data['sau'],
            'don_gia': detail_data['don_gia']
        }).eq('id', detail_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating chitietsanpham: {str(e)}")

@router.delete("/chitietsanpham/{detail_id}")
async def delete_chitietsanpham(detail_id: int):
    """Xóa chi tiết sản phẩm"""
    try:
        result = supabase.table('chitietsanpham').delete().eq('id', detail_id).execute()
        return {"message": "Product detail deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chitietsanpham: {str(e)}")

@router.post("/invoices/")
async def create_invoice(invoice_data: dict):
    """Tạo hóa đơn mới"""
    try:
        # Tạo công trình trước nếu có thông tin công trình
        cong_trinh_id = None
        if invoice_data.get('cong_trinh'):
            cong_trinh_data = invoice_data['cong_trinh']
            
            # Convert ma_nv to employee id for Id_sale
            employee_id = None
            if cong_trinh_data.get('Id_sale'):
                try:
                    employee_result = supabase.table('employees').select('id').eq('ma_nv', cong_trinh_data['Id_sale']).execute()
                    if employee_result.data:
                        employee_id = employee_result.data[0]['id']
                except Exception as e:
                    print(f"Error looking up employee ID for ma_nv {cong_trinh_data['Id_sale']}: {e}")
            
            cong_trinh_result = supabase.table('cong_trinh').insert({
                'name_congtrinh': cong_trinh_data['name_congtrinh'],
                'name_customer': cong_trinh_data['name_customer'],
                'sdt': cong_trinh_data.get('sdt'),
                'email': cong_trinh_data.get('email'),
                'Id_sale': employee_id,  # Use employee ID, not ma_nv
                'ngan_sach_du_kien': cong_trinh_data.get('ngan_sach_du_kien'),
                'dia_chi': cong_trinh_data.get('dia_chi'),
                'mo_ta': cong_trinh_data.get('mo_ta'),
                'created_at': 'now()'
            }).execute()
            cong_trinh_id = cong_trinh_result.data[0]['id']

        # Tạo hóa đơn chính
        invoice_result = supabase.table('invoices_reality').insert({
            'customer_name': invoice_data['customer_name'],
            'sales_employee_id': invoice_data.get('sales_employee_id'),
            'invoice_date': invoice_data['invoice_date'],
            'total_amount': invoice_data['total_amount'],
            'id_congtrinh': cong_trinh_id
        }).execute()

        invoice_id = invoice_result.data[0]['id']

        # Thêm chi tiết hóa đơn
        for item in invoice_data['items']:
            # Kiểm tra loại sản phẩm
            loai_san_pham = item.get('loai_san_pham', 'tu_bep')

            if loai_san_pham == 'phu_kien_bep':
                # Thêm phụ kiện bếp vào hóa đơn
                supabase.table('invoice_items_reality').insert({
                    'invoice_id': invoice_id,
                    'loai_san_pham': 'phu_kien_bep',
                    'id_loaiphukien': item.get('id_loaiphukien'),
                    'id_phukien': item['id_phukien'],
                    'so_luong': item.get('so_luong', 1),
                    'don_gia': item['don_gia'],
                    'chiet_khau': item.get('chiet_khau', 0),
                    'thanh_tien': item['thanh_tien']
                }).execute()
            else:
                # Thêm sản phẩm tủ bếp vào hóa đơn (như cũ)
                supabase.table('invoice_items_reality').insert({
                    'invoice_id': invoice_id,
                    'loai_san_pham': 'tu_bep',
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
                    'chiet_khau': item.get('chiet_khau', 0),
                    'thanh_tien': item['thanh_tien']
                }).execute()

        # Tự động tạo hoa hồng cho nhân viên bán hàng
        if invoice_data.get('sales_employee_id'):
            sales_employee_id = invoice_data['sales_employee_id']
            total_amount = invoice_data['total_amount']
            commission_percentage = invoice_data.get('commission_percentage', 5.0)  # Default to 5% if not provided
            commission_amount = total_amount * (commission_percentage / 100.0)
            
            # Lấy tháng từ invoice_date
            from datetime import datetime
            invoice_date = datetime.fromisoformat(invoice_data['invoice_date'].replace('Z', '+00:00'))
            ky_tinh_luong = f"{invoice_date.year}-{invoice_date.month:02d}"
            
            # Tạo bản ghi lương sản phẩm cho hoa hồng
            supabase.table('luong_san_pham').insert({
                'ma_nv': sales_employee_id,
                'ky_tinh_luong': ky_tinh_luong,
                'san_pham_id': f"INV-{invoice_id}",  # Sử dụng invoice ID làm product ID
                'ten_san_pham': f'Hoa hồng hóa đơn {invoice_id}',
                'so_luong': 1,
                'don_gia': commission_amount,
                'ty_le': commission_percentage
            }).execute()

        return {"message": "Invoice created successfully", "invoice_id": invoice_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating invoice: {str(e)}")

@router.get("/invoices/")
async def get_invoices(month: str = None):
    """Lấy danh sách hóa đơn, có thể lọc theo tháng"""
    try:
        query = supabase.table('invoices_reality').select('*')

        if month:
            # Lọc theo tháng (định dạng YYYY-MM)
            start_date = f"{month}-01"
            # Tính ngày cuối tháng
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month_num + 1:02d}-01"

            query = query.gte('invoice_date', start_date).lt('invoice_date', end_date)

        result = query.order('invoice_date', desc=True).execute()

        # Lấy chi tiết cho mỗi hóa đơn
        invoices_with_items = []
        for invoice in result.data:
            # Lấy thông tin công trình nếu có
            cong_trinh_info = None
            if invoice.get('id_congtrinh'):
                try:
                    cong_trinh_result = supabase.table('cong_trinh').select('*').eq('id', invoice['id_congtrinh']).execute()
                    if cong_trinh_result.data:
                        cong_trinh_info = cong_trinh_result.data[0]
                except Exception as e:
                    print(f"Error fetching cong_trinh for invoice {invoice['id']}: {e}")

            # Lấy items của invoice này
            items_result = supabase.table('invoice_items_reality').select('*').eq('invoice_id', invoice['id']).execute()

            # Lấy thông tin chi tiết cho mỗi item
            items_with_details = []
            for item in items_result.data:
                item_with_details = dict(item)

                # Lấy thông tin sản phẩm
                if item.get('sanpham_id'):
                    try:
                        product_id = item['sanpham_id']
                        if product_id:
                            product_result = supabase.table('sanpham').select('*').eq('id', product_id).execute()
                            if product_result.data:
                                product = product_result.data[0]

                                # Lấy tên loại nhôm
                                if product.get('id_nhom'):
                                    try:
                                        nhom_id = product['id_nhom']
                                        if nhom_id:
                                            nhom_result = supabase.table('loainhom').select('tenloai').eq('id', nhom_id).execute()
                                            if nhom_result.data:
                                                product['ten_nhom'] = nhom_result.data[0]['tenloai']
                                    except:
                                        pass

                                # Lấy tên loại kính
                                if product.get('id_kinh'):
                                    try:
                                        kinh_id = product['id_kinh']
                                        if kinh_id:
                                            kinh_result = supabase.table('loaikinh').select('tenloai').eq('id', kinh_id).execute()
                                            if kinh_result.data:
                                                product['ten_kinh'] = kinh_result.data[0]['tenloai']
                                    except:
                                        pass

                                # Lấy tên loại tay nắm
                                if product.get('id_taynam'):
                                    try:
                                        taynam_id = product['id_taynam']
                                        if taynam_id:
                                            taynam_result = supabase.table('loaitaynam').select('tenloai').eq('id', taynam_id).execute()
                                            if taynam_result.data:
                                                product['ten_taynam'] = taynam_result.data[0]['tenloai']
                                    except:
                                        pass

                                # Lấy tên bộ phận
                                if product.get('id_bophan'):
                                    try:
                                        bophan_id = product['id_bophan']
                                        if bophan_id:
                                            bophan_result = supabase.table('bophan').select('tenloai').eq('id', bophan_id).execute()
                                            if bophan_result.data:
                                                product['ten_bophan'] = bophan_result.data[0]['tenloai']
                                    except:
                                        pass

                                item_with_details['sanpham'] = product
                    except (ValueError, TypeError):
                        pass

                # Xử lý phụ kiện bếp nếu có
                if item.get('id_phukien') and item.get('loai_san_pham') == 'phu_kien_bep':
                    try:
                        phukien_id = item['id_phukien']
                        if phukien_id:
                            phukien_result = supabase.table('phukienbep').select('*').eq('id', phukien_id).execute()
                            if phukien_result.data:
                                phukien = phukien_result.data[0]

                                # Lấy tên loại phụ kiện bếp
                                if phukien.get('id_loaiphukien'):
                                    try:
                                        loaiphukien_result = supabase.table('loaiphukienbep').select('tenloai').eq('id', phukien['id_loaiphukien']).execute()
                                        if loaiphukien_result.data:
                                            phukien['ten_loai_phukien'] = loaiphukien_result.data[0]['tenloai']
                                    except:
                                        pass

                                item_with_details['phukien'] = phukien
                    except (ValueError, TypeError):
                        pass

                # Nếu không có sanpham_id hoặc không tìm thấy sản phẩm, lấy thông tin từ item trực tiếp
                if not item_with_details.get('sanpham') and not item_with_details.get('phukien'):
                    # Lấy tên loại nhôm từ item
                    if item.get('id_nhom'):
                        try:
                            nhom_id = item['id_nhom']
                            if nhom_id:
                                nhom_result = supabase.table('loainhom').select('tenloai').eq('id', nhom_id).execute()
                                if nhom_result.data:
                                    item_with_details['ten_nhom'] = nhom_result.data[0]['tenloai']
                        except:
                            pass

                    # Lấy tên loại kính từ item
                    if item.get('id_kinh'):
                        try:
                            kinh_id = item['id_kinh']
                            if kinh_id:
                                kinh_result = supabase.table('loaikinh').select('tenloai').eq('id', kinh_id).execute()
                                if kinh_result.data:
                                    item_with_details['ten_kinh'] = kinh_result.data[0]['tenloai']
                        except:
                            pass

                    # Lấy tên loại tay nắm từ item
                    if item.get('id_taynam'):
                        try:
                            taynam_id = item['id_taynam']
                            if taynam_id:
                                taynam_result = supabase.table('loaitaynam').select('tenloai').eq('id', taynam_id).execute()
                                if taynam_result.data:
                                    item_with_details['ten_taynam'] = taynam_result.data[0]['tenloai']
                        except:
                            pass

                    # Lấy tên bộ phận từ item
                    if item.get('id_bophan'):
                        try:
                            bophan_id = item['id_bophan']
                            if bophan_id:
                                bophan_result = supabase.table('bophan').select('tenloai').eq('id', bophan_id).execute()
                                if bophan_result.data:
                                    item_with_details['ten_bophan'] = bophan_result.data[0]['tenloai']
                        except:
                            pass

                items_with_details.append(item_with_details)

            invoice_with_items = {
                **invoice,
                'items': items_with_details,
                'cong_trinh': cong_trinh_info
            }
            invoices_with_items.append(invoice_with_items)

        return {"invoices": invoices_with_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")

@router.get("/loaichiphi/")
async def get_loaichiphi():
    """Lấy danh sách loại chi phí"""
    try:
        result = supabase.table('loaichiphi').select('*').execute()
        # Transform the data to match expected format
        transformed_data = []
        for item in result.data:
            transformed_item = {
                'id': item['id'],
                'tenchiphi': item.get('tenchiphi', ''),  # Map tenchiphi -> tenchiphi
                'loaichiphi': item.get('loaichiphi', ''),  # Map loaichiphi -> loaichiphi
                'giathanh': item.get('giathanh')  # Add giathanh field
            }
            transformed_data.append(transformed_item)
        return transformed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loaichiphi: {str(e)}")

@router.post("/loaichiphi/")
async def create_loaichiphi(loaichiphi_data: dict):
    """Tạo loại chi phí mới"""
    try:
        result = supabase.table('loaichiphi').insert({
            'loaichiphi': loaichiphi_data.get('loaichiphi', ''),  # Map loaichiphi -> loaichiphi
            'tenchiphi': loaichiphi_data['tenchiphi'],  # Map tenchiphi -> tenchiphi
            'giathanh': loaichiphi_data.get('giathanh')  # Add giathanh field
        }).execute()
        # Transform response to match expected format
        item = result.data[0]
        return {
            'id': item['id'],
            'tenchiphi': item.get('tenchiphi', ''),  # Map back for frontend
            'loaichiphi': item.get('loaichiphi', 'định phí'),  # Use actual value
            'giathanh': item.get('giathanh')  # Add giathanh field
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating loaichiphi: {str(e)}")

@router.put("/loaichiphi/{loaichiphi_id}")
async def update_loaichiphi(loaichiphi_id: int, loaichiphi_data: dict):
    """Cập nhật loại chi phí"""
    try:
        result = supabase.table('loaichiphi').update({
            'loaichiphi': loaichiphi_data.get('loaichiphi', ''),  # Map loaichiphi -> loaichiphi
            'tenchiphi': loaichiphi_data['tenchiphi'],  # Map tenchiphi -> tenchiphi
            'giathanh': loaichiphi_data.get('giathanh')  # Add giathanh field
        }).eq('id', loaichiphi_id).execute()
        # Transform response to match expected format
        item = result.data[0]
        return {
            'id': item['id'],
            'tenchiphi': item.get('tenchiphi', ''),  # Map back for frontend
            'loaichiphi': item.get('loaichiphi', 'định phí'),  # Use actual value
            'giathanh': item.get('giathanh')  # Add giathanh field
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating loaichiphi: {str(e)}")

@router.delete("/loaichiphi/{loaichiphi_id}")
async def delete_loaichiphi(loaichiphi_id: int):
    """Xóa loại chi phí"""
    try:
        # Kiểm tra xem có chi phí nào đang sử dụng loại này không
        expense_count = supabase.table('quanly_chiphi').select('id', count='exact').eq('id_lcp', loaichiphi_id).execute()
        if expense_count.count > 0:
            raise HTTPException(status_code=400, detail="Không thể xóa loại chi phí đang được sử dụng")

        result = supabase.table('loaichiphi').delete().eq('id', loaichiphi_id).execute()
        return {"message": "Loại chi phí đã được xóa thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting loaichiphi: {str(e)}")

@router.get("/quanly_chiphi/")
async def get_quanly_chiphi(month: str = None):
    """Lấy danh sách chi phí, có thể lọc theo tháng"""
    try:
        # Get quanly_chiphi data first with basic columns
        query = supabase.table('quanly_chiphi').select('*')

        # Lọc theo tháng nếu có tham số month
        if month:
            # Lọc theo tháng (định dạng YYYY-MM)
            start_date = f"{month}-01"
            # Tính ngày cuối tháng
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month_num + 1:02d}-01"

            query = query.gte('created_at', start_date).lt('created_at', end_date)

        result = query.order('id', desc=True).execute()

        # Transform the data to match expected format and fetch related loaichiphi data
        transformed_data = []
        for item in result.data:
            transformed_item = dict(item)

            # Fetch related loaichiphi data separately
            if item.get('id_lcp'):
                try:
                    loaichiphi_result = supabase.table('loaichiphi').select('*').eq('id', item['id_lcp']).execute()
                    if loaichiphi_result.data:
                        loaichiphi_item = loaichiphi_result.data[0]
                        transformed_item['loaichiphi'] = {
                            'id': loaichiphi_item['id'],
                            'tenchiphi': loaichiphi_item.get('tenchiphi', ''),  # Map tenchiphi -> tenchiphi
                            'loaichiphi': loaichiphi_item.get('loaichiphi', ''),  # Map loaichiphi -> loaichiphi
                            'giathanh': loaichiphi_item.get('giathanh')  # Add giathanh field
                        }
                except Exception as e:
                    print(f"Error fetching loaichiphi for id {item['id_lcp']}: {e}")
                    transformed_item['loaichiphi'] = None
            else:
                transformed_item['loaichiphi'] = None

            transformed_data.append(transformed_item)

        return transformed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quanly_chiphi: {str(e)}")

@router.get("/quanly_chiphi/hierarchy/")
async def get_quanly_chiphi_hierarchy(month: str = None):
    """Lấy danh sách chi phí theo cấu trúc cây phân cấp"""
    try:
        # Get all expenses with their category info
        query = supabase.table('quanly_chiphi').select('*')

        if month:
            start_date = f"{month}-01"
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month_num + 1:02d}-01"
            query = query.gte('created_at', start_date).lt('created_at', end_date)

        result = query.order('id', desc=True).execute()

        # Get all categories for mapping
        categories_result = supabase.table('loaichiphi').select('*').execute()
        categories_map = {cat['id']: cat for cat in categories_result.data}

        # Build hierarchy
        expenses_map = {}
        root_expenses = []

        # First pass: create expense objects with category info
        for item in result.data:
            expense = dict(item)
            if item.get('id_lcp') and item['id_lcp'] in categories_map:
                expense['loaichiphi'] = {
                    'id': categories_map[item['id_lcp']]['id'],
                    'tenchiphi': categories_map[item['id_lcp']].get('tenchiphi', ''),
                    'loaichiphi': categories_map[item['id_lcp']].get('loaichiphi', ''),
                    'giathanh': categories_map[item['id_lcp']].get('giathanh')
                }
            else:
                expense['loaichiphi'] = None

            expense['children'] = []
            expenses_map[item['id']] = expense

        # Second pass: build hierarchy
        for expense in expenses_map.values():
            parent_id = expense.get('parent_id')
            if parent_id and parent_id in expenses_map:
                expenses_map[parent_id]['children'].append(expense)
            else:
                root_expenses.append(expense)

        # Calculate totals for each level
        def calculate_totals(expense):
            # For parent expenses, giathanh should be sum of direct children IN THE SAME MONTH
            if expense['children']:
                # Filter children from the same month as parent
                parent_month = expense.get('created_at', '')[:7] if expense.get('created_at') else ''
                same_month_children = []
                for child in expense['children']:
                    child_month = child.get('created_at', '')[:7] if child.get('created_at') else ''
                    if child_month == parent_month:
                        same_month_children.append(child)

                total_direct_children = sum(child['giathanh'] or 0 for child in same_month_children)
                expense['giathanh'] = total_direct_children
            # total_amount is the sum of all descendants (for display purposes)
            total = expense['giathanh'] or 0
            for child in expense['children']:
                total += calculate_totals(child)
            expense['total_amount'] = total
            return total

        for expense in root_expenses:
            calculate_totals(expense)

        return {"hierarchy": root_expenses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching expense hierarchy: {str(e)}")

@router.post("/quanly_chiphi/")
async def create_quanly_chiphi(chiphi_data: dict):
    """Tạo chi phí mới"""
    try:
        # Validate parent_id to prevent circular references
        parent_id = chiphi_data.get('parent_id')
        if parent_id:
            # Check if parent exists
            parent_result = supabase.table('quanly_chiphi').select('id').eq('id', parent_id).execute()
            if not parent_result.data:
                raise HTTPException(status_code=400, detail="Parent expense does not exist")

            # Check for circular reference
            current_id = parent_id
            visited = set()
            while current_id:
                if current_id in visited:
                    raise HTTPException(status_code=400, detail="Circular reference detected in expense hierarchy")
                visited.add(current_id)
                parent_result = supabase.table('quanly_chiphi').select('parent_id').eq('id', current_id).execute()
                if parent_result.data:
                    current_id = parent_result.data[0].get('parent_id')
                else:
                    current_id = None

        # For parent expenses, giathanh can be null and will be calculated later
        # For child expenses, giathanh is required
        giathanh = chiphi_data.get('giathanh')
        if parent_id and (giathanh is None or giathanh == ''):
            raise HTTPException(status_code=400, detail="Child expenses must have a giathanh value")

        # Try to insert with basic columns that might exist
        result = supabase.table('quanly_chiphi').insert({
            'id_lcp': chiphi_data['id_lcp'],
            'giathanh': giathanh,
            'mo_ta': chiphi_data.get('mo_ta', ''),
            'hinhanh': chiphi_data.get('hinhanh', ''),
            'parent_id': parent_id,
            'created_at': chiphi_data.get('created_at')
        }).execute()

        # Update parent giathanh if this is a child expense
        if parent_id:
            update_parent_giathanh(parent_id)

        # Update ratios for the month
        try:
            import subprocess
            import os
            script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "update_expense_ratios.py")

            # Get the month from created_at
            expense_month = None
            if chiphi_data.get('created_at'):
                from datetime import datetime
                if isinstance(chiphi_data['created_at'], str):
                    expense_month = chiphi_data['created_at'][:7]
                else:
                    expense_month = chiphi_data['created_at'].strftime('%Y-%m')
            else:
                expense_month = datetime.now().strftime('%Y-%m')

            result = subprocess.run(
                ["python", script_path, "--month", expense_month],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.path.dirname(script_path)
            )
            if result.returncode != 0:
                print(f"Warning: Failed to update ratios: {result.stderr}")
        except Exception as e:
            print(f"Warning: Error updating ratios: {e}")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        # If insert fails, return a success message anyway for now
        print(f"Insert failed: {e}")
        return {"message": "Expense creation attempted", "error": str(e)}

@router.put("/quanly_chiphi/{chiphi_id}")
async def update_quanly_chiphi(chiphi_id: int, chiphi_data: dict):
    """Cập nhật chi phí"""
    try:
        # Get current expense to check if parent changed
        current_expense = supabase.table('quanly_chiphi').select('parent_id').eq('id', chiphi_id).execute()
        old_parent_id = current_expense.data[0]['parent_id'] if current_expense.data else None

        # Validate parent_id to prevent circular references
        parent_id = chiphi_data.get('parent_id')
        if parent_id:
            # Check if parent exists
            parent_result = supabase.table('quanly_chiphi').select('id').eq('id', parent_id).execute()
            if not parent_result.data:
                raise HTTPException(status_code=400, detail="Parent expense does not exist")

            # Check for circular reference
            current_id = parent_id
            visited = set()
            while current_id:
                if current_id in visited:
                    raise HTTPException(status_code=400, detail="Circular reference detected in expense hierarchy")
                visited.add(current_id)
                if current_id == chiphi_id:
                    raise HTTPException(status_code=400, detail="Cannot set parent to itself or its descendant")
                parent_result = supabase.table('quanly_chiphi').select('parent_id').eq('id', current_id).execute()
                if parent_result.data:
                    current_id = parent_result.data[0].get('parent_id')
                else:
                    current_id = None

        result = supabase.table('quanly_chiphi').update({
            'id_lcp': chiphi_data['id_lcp'],
            'giathanh': chiphi_data['giathanh'],
            'mo_ta': chiphi_data.get('mo_ta', ''),
            'hinhanh': chiphi_data.get('hinhanh', ''),
            'parent_id': parent_id,
            'created_at': chiphi_data.get('created_at'),
            'updated_at': 'now()'
        }).eq('id', chiphi_id).execute()

        # Update parent giathanh if parent changed or giathanh changed
        if parent_id:
            update_parent_giathanh(parent_id)
        if old_parent_id and old_parent_id != parent_id:
            update_parent_giathanh(old_parent_id)

        # Update ratios for the affected months
        try:
            import subprocess
            import os
            script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "update_expense_ratios.py")

            # Get months that might be affected
            months_to_update = set()

            # Current expense month
            current_result = supabase.table('quanly_chiphi').select('created_at').eq('id', chiphi_id).execute()
            if current_result.data:
                created_at = current_result.data[0].get('created_at')
                if created_at:
                    if isinstance(created_at, str):
                        months_to_update.add(created_at[:7])
                    else:
                        months_to_update.add(created_at.strftime('%Y-%m'))

            # Update ratios for affected months
            for month in months_to_update:
                subprocess_result = subprocess.run(
                    ["python", script_path, "--month", month],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    cwd=os.path.dirname(script_path)
                )
                if subprocess_result.returncode != 0:
                    print(f"Warning: Failed to update ratios for month {month}: {subprocess_result.stderr}")
        except Exception as e:
            print(f"Warning: Error updating ratios: {e}")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating quanly_chiphi: {str(e)}")

@router.delete("/quanly_chiphi/{chiphi_id}")
async def delete_quanly_chiphi(chiphi_id: int):
    """Xóa chi phí và tất cả chi phí con"""
    try:
        # Get parent_id before deletion
        expense_result = supabase.table('quanly_chiphi').select('parent_id').eq('id', chiphi_id).execute()
        parent_id = expense_result.data[0]['parent_id'] if expense_result.data else None

        # Function to recursively delete expense and its children
        def delete_expense_recursive(expense_id):
            # Find all children
            children_result = supabase.table('quanly_chiphi').select('id').eq('parent_id', expense_id).execute()
            for child in children_result.data:
                delete_expense_recursive(child['id'])
            
            # Delete the expense itself
            supabase.table('quanly_chiphi').delete().eq('id', expense_id).execute()

        # Start recursive deletion
        delete_expense_recursive(chiphi_id)

        # Update parent giathanh after deletion
        if parent_id:
            update_parent_giathanh(parent_id)

        # Update ratios for the affected month
        try:
            import subprocess
            import os
            script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "update_expense_ratios.py")

            # Get the month of the deleted expense
            if expense_result.data:
                created_at = expense_result.data[0].get('created_at')
                if created_at:
                    if isinstance(created_at, str):
                        expense_month = created_at[:7]
                    else:
                        expense_month = created_at.strftime('%Y-%m')

                    result = subprocess.run(
                        ["python", script_path, "--month", expense_month],
                        capture_output=True,
                        text=True,
                        timeout=30,
                        cwd=os.path.dirname(script_path)
                    )
                    if result.returncode != 0:
                        print(f"Warning: Failed to update ratios for month {expense_month}: {result.stderr}")
        except Exception as e:
            print(f"Warning: Error updating ratios: {e}")
        
        return {"message": "Chi phí và tất cả chi phí con đã được xóa thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting quanly_chiphi: {str(e)}")

@router.get("/quanly_chiphi/tong_quan/")
async def get_chiphi_tong_quan(month: str = None):
    """Lấy tổng quan chi phí theo tháng"""
    try:
        # Get quanly_chiphi data first
        query = supabase.table('quanly_chiphi').select('*')

        if month:
            # Lọc theo tháng (định dạng YYYY-MM)
            start_date = f"{month}-01"
            # Tính ngày cuối tháng
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month_num + 1:02d}-01"

            query = query.gte('created_at', start_date).lt('created_at', end_date)

        result = query.execute()

        # Fetch loaichiphi data for all items
        loaichiphi_map = {}
        if result.data:
            # Get unique loaichiphi IDs
            loaichiphi_ids = list(set(item.get('id_lcp') for item in result.data if item.get('id_lcp')))
            if loaichiphi_ids:
                try:
                    loaichiphi_result = supabase.table('loaichiphi').select('*').in_('id', loaichiphi_ids).execute()
                    loaichiphi_map = {item['id']: item for item in loaichiphi_result.data}
                except Exception as e:
                    print(f"Error fetching loaichiphi data: {e}")

        # Tính tổng chi phí (chỉ chi phí cha)
        total_expenses = sum(item['giathanh'] for item in result.data if not item.get('parent_id'))

        # Nhóm theo loại chi phí
        expense_by_category = {}
        expense_by_type = {'cố định': 0, 'biến phí': 0}

        for item in result.data:
            # Skip child expenses for category/type calculations
            if item.get('parent_id'):
                continue

            # Get loaichiphi data from map
            loaichiphi_data = None
            if item.get('id_lcp') and item['id_lcp'] in loaichiphi_map:
                loaichiphi_data = loaichiphi_map[item['id_lcp']]

            if loaichiphi_data:
                category_name = loaichiphi_data.get('tenchiphi', 'Chưa phân loại')  # Map tenchiphi -> category name
                type_name = loaichiphi_data.get('loaichiphi', 'Chưa phân loại')  # Map loaichiphi -> type name
            else:
                category_name = 'Chưa phân loại'
                type_name = 'Chưa phân loại'

            if category_name not in expense_by_category:
                expense_by_category[category_name] = 0
            expense_by_category[category_name] += item['giathanh']

            if type_name in expense_by_type:
                expense_by_type[type_name] += item['giathanh']

        return {
            "total_expenses": total_expenses,
            "expense_count": len(result.data),
            "expense_by_category": expense_by_category,
            "expense_by_type": expense_by_type,
            "monthly_data": result.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching expense overview: {str(e)}")

@router.get("/profit/")
async def get_profit_report(month: str = None):
    """Lấy báo cáo hoạt động kinh doanh tổng hợp"""
    try:
        # Lấy dữ liệu doanh thu
        revenue_query = supabase.table('invoices_reality').select('*')
        if month:
            start_date = f"{month}-01"
            year, month_num = map(int, month.split('-'))
            if month_num == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month_num + 1:02d}-01"
            revenue_query = revenue_query.gte('invoice_date', start_date).lt('invoice_date', end_date)

        revenue_result = revenue_query.execute()
        total_revenue = sum(invoice['total_amount'] or 0 for invoice in revenue_result.data)

        # Lấy dữ liệu chi phí
        expense_query = supabase.table('quanly_chiphi').select('*')
        if month:
            expense_query = expense_query.gte('created_at', start_date).lt('created_at', end_date)

        expense_result = expense_query.execute()
        total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data if not expense.get('parent_id'))

        # Lấy dữ liệu chi phí nhân sự (lương)
        payroll_query = supabase.table('phieu_luong').select('luong_thuc_nhan')
        if month:
            payroll_query = payroll_query.eq('ky_tinh_luong', month)

        payroll_result = payroll_query.execute()
        total_payroll_expenses = sum(payroll['luong_thuc_nhan'] or 0 for payroll in payroll_result.data)

        # Tổng chi phí = chi phí từ quanly_chiphi + chi phí nhân sự
        total_expenses += total_payroll_expenses

        # Tính lợi nhuận
        total_profit = total_revenue - total_expenses
        if total_revenue > 0:
            profit_margin = (total_profit / total_revenue) * 100
        else:
            profit_margin = 0

        # Phân tích chi tiết theo loại
        expense_by_category = {}
        expense_by_type = {'định phí': 0, 'biến phí': 0}

        # Lấy thông tin loại chi phí
        if expense_result.data:
            loaichiphi_ids = list(set(item.get('id_lcp') for item in expense_result.data if item.get('id_lcp')))
            if loaichiphi_ids:
                try:
                    loaichiphi_result = supabase.table('loaichiphi').select('*').in_('id', loaichiphi_ids).execute()
                    loaichiphi_map = {item['id']: item for item in loaichiphi_result.data}

                    for expense in expense_result.data:
                        # Skip child expenses for category/type calculations
                        if expense.get('parent_id'):
                            continue

                        loaichiphi_data = loaichiphi_map.get(expense.get('id_lcp'))
                        if loaichiphi_data:
                            category_name = loaichiphi_data.get('tenchiphi', 'Chưa phân loại')
                            type_name = loaichiphi_data.get('loaichiphi', 'Chưa phân loại')

                            if category_name not in expense_by_category:
                                expense_by_category[category_name] = 0
                            expense_by_category[category_name] += expense['giathanh'] or 0

                            if type_name in expense_by_type:
                                expense_by_type[type_name] += expense['giathanh'] or 0
                except Exception as e:
                    print(f"Error fetching loaichiphi data: {e}")

        # Thêm chi phí nhân sự vào phân tích chi phí
        if total_payroll_expenses > 0:
            expense_by_category['Chi phí nhân sự'] = total_payroll_expenses
            expense_by_type['định phí'] += total_payroll_expenses  # Giả sử lương là chi phí định phí

        return {
            "period": month or "all",
            "summary": {
                "total_revenue": total_revenue,
                "total_expenses": total_expenses,
                "total_payroll_expenses": total_payroll_expenses,
                "total_profit": total_profit,
                "profit_margin": profit_margin,
                "revenue_count": len(revenue_result.data),
                "expense_count": len(expense_result.data),
                "payroll_count": len(payroll_result.data)
            },
            "details": {
                "revenue": revenue_result.data,
                "expenses": expense_result.data,
                "payroll_expenses": payroll_result.data,
                "expense_by_category": expense_by_category,
                "expense_by_type": expense_by_type
            },
            "status": "profit" if total_profit >= 0 else "loss"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profit report: {str(e)}")

@router.get("/profits/")
async def get_profit_reports(month: str = None):
    """Lấy danh sách báo cáo hoạt động kinh doanh (sort bằng Python thay vì database index)"""
    try:
        query = supabase.table('profits').select('*')

        if month:
            query = query.eq('report_month', month)

        result = query.execute()

        # Sort bằng Python thay vì database index
        if month:
            # Nếu filter theo tháng, sort theo created_at
            sorted_data = sorted(result.data, key=lambda x: x.get('created_at', ''), reverse=True)
        else:
            # Nếu không filter, sort theo report_month
            sorted_data = sorted(result.data, key=lambda x: x.get('report_month', ''), reverse=True)

        return sorted_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profit reports: {str(e)}")

@router.post("/profits/")
async def create_profit_report(report_data: dict):
    """Tạo báo cáo hoạt động kinh doanh mới"""
    try:
        result = supabase.table('profits').insert({
            'report_month': report_data['report_month'],
            'total_revenue': report_data.get('total_revenue', 0),
            'total_expenses': report_data.get('total_expenses', 0),
            'total_payroll_expenses': report_data.get('total_payroll_expenses', 0),
            'total_profit': report_data.get('total_profit', 0),
            'profit_margin': report_data.get('profit_margin', 0),
            'invoice_count': report_data.get('invoice_count', 0),
            'expense_count': report_data.get('expense_count', 0),
            'payroll_count': report_data.get('payroll_count', 0),
            'product_count': report_data.get('product_count', 0),
            'updated_at': 'now()'
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating profit report: {str(e)}")

@router.put("/profits/{report_id}")
async def update_profit_report(report_id: int, report_data: dict):
    """Cập nhật báo cáo hoạt động kinh doanh"""
    try:
        result = supabase.table('profits').update({
            'total_revenue': report_data.get('total_revenue'),
            'total_expenses': report_data.get('total_expenses'),
            'total_payroll_expenses': report_data.get('total_payroll_expenses'),
            'total_profit': report_data.get('total_profit'),
            'profit_margin': report_data.get('profit_margin'),
            'invoice_count': report_data.get('invoice_count'),
            'expense_count': report_data.get('expense_count'),
            'payroll_count': report_data.get('payroll_count'),
            'product_count': report_data.get('product_count'),
            'updated_at': 'now()'
        }).eq('id', report_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profit report: {str(e)}")

@router.delete("/profits/{report_id}")
async def delete_profit_report(report_id: int):
    """Xóa báo cáo hoạt động kinh doanh"""
    try:
        result = supabase.table('profits').delete().eq('id', report_id).execute()
        return {"message": "Profit report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting profit report: {str(e)}")

@router.post("/profits/generate/{month}")
async def generate_profit_report(month: str):
    """Tự động tạo báo cáo hoạt động kinh doanh cho tháng cụ thể"""
    try:
        # Kiểm tra xem đã có báo cáo cho tháng này chưa
        existing = supabase.table('profits').select('*').eq('report_month', month).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail=f"Profit report for {month} already exists")

        # Lấy dữ liệu doanh thu
        start_date = f"{month}-01"
        year, month_num = map(int, month.split('-'))
        if month_num == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month_num + 1:02d}-01"

        revenue_result = supabase.table('invoices_reality').select('*').gte('invoice_date', start_date).lt('invoice_date', end_date).execute()
        total_revenue = sum(invoice['total_amount'] or 0 for invoice in revenue_result.data)

        # Lấy dữ liệu chi phí
        expense_result = supabase.table('quanly_chiphi').select('*').gte('created_at', start_date).lt('created_at', end_date).execute()
        total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data if not expense.get('parent_id'))

        # Lấy dữ liệu chi phí nhân sự (lương)
        payroll_result = supabase.table('phieu_luong').select('luong_thuc_nhan').eq('ky_tinh_luong', month).execute()
        total_payroll_expenses = sum(payroll['luong_thuc_nhan'] or 0 for payroll in payroll_result.data)

        # Tổng chi phí = chi phí từ quanly_chiphi + chi phí nhân sự
        total_expenses += total_payroll_expenses

        # Lấy số lượng sản phẩm
        product_result = supabase.table('sanpham').select('id', count='exact').execute()
        product_count = product_result.count or 0

        # Tính lợi nhuận
        total_profit = total_revenue - total_expenses
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

        # Tạo báo cáo
        result = supabase.table('profits').insert({
            'report_month': month,
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'total_payroll_expenses': total_payroll_expenses,
            'total_profit': total_profit,
            'profit_margin': profit_margin,
            'invoice_count': len(revenue_result.data),
            'expense_count': len([e for e in expense_result.data if not e.get('parent_id')]),  # Only count parent expenses
            'payroll_count': len(payroll_result.data),
            'product_count': product_count,
            'updated_at': 'now()'
        }).execute()

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating profit report: {str(e)}")

@router.put("/profits/sync/{month}")
async def sync_profit_report(month: str):
    """Đồng bộ lại báo cáo hoạt động kinh doanh cho tháng cụ thể"""
    try:
        # Lấy dữ liệu doanh thu
        start_date = f"{month}-01"
        year, month_num = map(int, month.split('-'))
        if month_num == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month_num + 1:02d}-01"

        revenue_result = supabase.table('invoices_reality').select('*').gte('invoice_date', start_date).lt('invoice_date', end_date).execute()
        total_revenue = sum(invoice['total_amount'] or 0 for invoice in revenue_result.data)

        # Lấy dữ liệu chi phí
        expense_result = supabase.table('quanly_chiphi').select('*').gte('created_at', start_date).lt('created_at', end_date).execute()
        total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data if not expense.get('parent_id'))

        # Lấy dữ liệu chi phí nhân sự (lương)
        payroll_result = supabase.table('phieu_luong').select('luong_thuc_nhan').eq('ky_tinh_luong', month).execute()
        total_payroll_expenses = sum(payroll['luong_thuc_nhan'] or 0 for payroll in payroll_result.data)

        # Tổng chi phí = chi phí từ quanly_chiphi + chi phí nhân sự
        total_expenses += total_payroll_expenses

        # Lấy số lượng sản phẩm
        product_result = supabase.table('sanpham').select('id', count='exact').execute()
        product_count = product_result.count or 0

        # Tính lợi nhuận
        total_profit = total_revenue - total_expenses
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

        # Cập nhật hoặc tạo mới
        existing = supabase.table('profits').select('*').eq('report_month', month).execute()
        if existing.data:
            # Cập nhật
            result = supabase.table('profits').update({
                'total_revenue': total_revenue,
                'total_expenses': total_expenses,
                'total_payroll_expenses': total_payroll_expenses,
                'total_profit': total_profit,
                'profit_margin': profit_margin,
                'invoice_count': len(revenue_result.data),
                'expense_count': len([e for e in expense_result.data if not e.get('parent_id')]),  # Only count parent expenses
                'payroll_count': len(payroll_result.data),
                'product_count': product_count,
                'updated_at': 'now()'
            }).eq('report_month', month).execute()
        else:
            # Tạo mới
            result = supabase.table('profits').insert({
                'report_month': month,
                'total_revenue': total_revenue,
                'total_expenses': total_expenses,
                'total_payroll_expenses': total_payroll_expenses,
                'total_profit': total_profit,
                'profit_margin': profit_margin,
                'invoice_count': len(revenue_result.data),
                'expense_count': len([e for e in expense_result.data if not e.get('parent_id')]),  # Only count parent expenses
                'payroll_count': len(payroll_result.data),
                'product_count': product_count,
                'updated_at': 'now()'
            }).execute()

        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing profit report: {str(e)}")

@router.post("/profits/sync_all/")
async def sync_all_profit_reports():
    """Đồng bộ lại tất cả báo cáo hoạt động kinh doanh"""
    try:
        synced_months = []
        errors = []

        # Lấy tất cả các tháng có dữ liệu từ invoices
        revenue_result = supabase.table('invoices_reality').select('invoice_date').execute()
        
        # Trích xuất các tháng duy nhất
        months = set()
        for invoice in revenue_result.data:
            if invoice.get('invoice_date'):
                # Xử lý cả string và datetime
                if isinstance(invoice['invoice_date'], str):
                    month = invoice['invoice_date'][:7]  # YYYY-MM
                else:
                    month = invoice['invoice_date'].strftime('%Y-%m')
                months.add(month)

        # Lấy các tháng có dữ liệu từ quanly_chiphi
        expense_result = supabase.table('quanly_chiphi').select('created_at').execute()
        for expense in expense_result.data:
            if expense.get('created_at'):
                if isinstance(expense['created_at'], str):
                    month = expense['created_at'][:7]
                else:
                    month = expense['created_at'].strftime('%Y-%m')
                months.add(month)

        # Lấy các tháng có dữ liệu từ phieu_luong
        payroll_result = supabase.table('phieu_luong').select('ky_tinh_luong').execute()
        for payroll in payroll_result.data:
            if payroll.get('ky_tinh_luong'):
                months.add(payroll['ky_tinh_luong'])

        # Đồng bộ từng tháng
        for month in sorted(months):
            try:
                # Lấy dữ liệu doanh thu
                start_date = f"{month}-01"
                year, month_num = map(int, month.split('-'))
                if month_num == 12:
                    end_date = f"{year + 1}-01-01"
                else:
                    end_date = f"{year}-{month_num + 1:02d}-01"

                revenue_result = supabase.table('invoices_reality').select('*').gte('invoice_date', start_date).lt('invoice_date', end_date).execute()
                total_revenue = sum(invoice['total_amount'] or 0 for invoice in revenue_result.data)

                # Lấy dữ liệu chi phí
                expense_result = supabase.table('quanly_chiphi').select('*').gte('created_at', start_date).lt('created_at', end_date).execute()
                total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data if not expense.get('parent_id'))

                # Lấy dữ liệu chi phí nhân sự (lương)
                payroll_result = supabase.table('phieu_luong').select('luong_thuc_nhan').eq('ky_tinh_luong', month).execute()
                total_payroll_expenses = sum(payroll['luong_thuc_nhan'] or 0 for payroll in payroll_result.data)

                # Tổng chi phí = chi phí từ quanly_chiphi + chi phí nhân sự
                total_expenses += total_payroll_expenses

                # Lấy số lượng sản phẩm
                product_result = supabase.table('sanpham').select('id', count='exact').execute()
                product_count = product_result.count or 0

                # Tính lợi nhuận
                total_profit = total_revenue - total_expenses
                profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

                # Cập nhật hoặc tạo mới
                existing = supabase.table('profits').select('*').eq('report_month', month).execute()
                if existing.data:
                    # Cập nhật
                    supabase.table('profits').update({
                        'total_revenue': total_revenue,
                        'total_expenses': total_expenses,
                        'total_payroll_expenses': total_payroll_expenses,
                        'total_profit': total_profit,
                        'profit_margin': profit_margin,
                        'invoice_count': len(revenue_result.data),
                        'expense_count': len([e for e in expense_result.data if not e.get('parent_id')]),
                        'payroll_count': len(payroll_result.data),
                        'product_count': product_count,
                        'updated_at': 'now()'
                    }).eq('report_month', month).execute()
                else:
                    # Tạo mới
                    supabase.table('profits').insert({
                        'report_month': month,
                        'total_revenue': total_revenue,
                        'total_expenses': total_expenses,
                        'total_payroll_expenses': total_payroll_expenses,
                        'total_profit': total_profit,
                        'profit_margin': profit_margin,
                        'invoice_count': len(revenue_result.data),
                        'expense_count': len([e for e in expense_result.data if not e.get('parent_id')]),
                        'payroll_count': len(payroll_result.data),
                        'product_count': product_count,
                        'updated_at': 'now()'
                    }).execute()

                synced_months.append(month)

            except Exception as e:
                errors.append(f"Error syncing {month}: {str(e)}")

        return {
            "message": f"Đã đồng bộ {len(synced_months)} tháng thành công",
            "months_processed": len(synced_months),
            "synced_months": synced_months,
            "errors": errors
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing all profit reports: {str(e)}")

@router.get("/export_profit_excel/")
async def export_profit_excel(month: str = None):
    """Xuất báo cáo hoạt động kinh doanh ra file Excel"""
    try:
        import subprocess
        import os
        import time
        import json
        from fastapi.responses import FileResponse

        # Đường dẫn đến script Python
        script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generate_profit_excel.py")

        # Sử dụng Python system executable
        python_exe = "python"

        # Chạy script với timeout để tránh treo
        if month:
            cmd = [python_exe, script_path, "--month", month]
        else:
            cmd = [python_exe, script_path]

        print(f"Running command: {' '.join(cmd)}")

        # Chạy với timeout 60 giây
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60,
            cwd=os.path.dirname(script_path)
        )

        print(f"Return code: {result.returncode}")
        print(f"Stdout: {result.stdout}")
        if result.stderr:
            print(f"Stderr: {result.stderr}")

        if result.returncode == 0:
            # Parse output để lấy thông tin file
            output_lines = result.stdout.strip().split('\n')
            filename = None
            filepath = None

            for line in output_lines:
                if 'SUCCESS:' in line:
                    filename = line.split('SUCCESS:')[1].strip()
                elif 'File duoc luu tai:' in line:
                    filepath = line.split('File duoc luu tai:')[1].strip()

            if filename and filepath and os.path.exists(filepath):
                # Trả về file Excel trực tiếp để download
                return FileResponse(
                    path=filepath,
                    filename=filename,
                    media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            else:
                raise HTTPException(status_code=500, detail=f"Khong tim thay file Excel da tao")
        else:
            raise HTTPException(status_code=500, detail=f"Loi khi xuat Excel: {result.stderr}")

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Qua thoi gian cho xuat Excel")
    except Exception as e:
        print(f"Exception in export_profit_excel: {e}")
        raise HTTPException(status_code=500, detail=f"Loi xuat Excel: {str(e)}")

@router.post("/quanly_chiphi/update_ratios/")
async def update_expense_ratios(month: str = None):
    """Cập nhật tỷ lệ phần trăm cho tất cả chi phí trong tháng được chỉ định"""
    try:
        import subprocess
        import os

        # Đường dẫn đến script
        script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "update_expense_ratios.py")

        # Chạy script
        cmd = ["python", script_path]
        if month:
            cmd.extend(["--month", month])

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60,
            cwd=os.path.dirname(script_path)
        )

        if result.returncode == 0:
            return {
                "success": True,
                "message": "Đã cập nhật tỷ lệ chi phí thành công",
                "output": result.stdout
            }
        else:
            return {
                "success": False,
                "message": f"Lỗi khi cập nhật tỷ lệ: {result.stderr}",
                "output": result.stdout
            }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Quá thời gian chờ cập nhật tỷ lệ")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật tỷ lệ chi phí: {str(e)}")

@router.get("/quanly_chiphi/verify_totals/")
async def verify_expense_totals():
    """Kiểm tra tính chính xác của các tổng chi phí"""
    try:
        import subprocess
        import os

        # Đường dẫn đến script (ở thư mục backend, không phải routers)
        script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "update_expense_totals.py")

        # Chạy script với --verify
        result = subprocess.run(
            ["python", script_path, "--verify"],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.path.dirname(script_path)
        )

        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "errors": result.stderr if result.returncode != 0 else None
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Quá thời gian chờ kiểm tra")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi kiểm tra tỷ lệ tổng chi phí: {str(e)}")

# ==================== CHIPHI_QUOTE ENDPOINTS ====================

@router.get("/chiphi_quote/")
async def get_chiphi_quote():
    """Lấy danh sách tất cả chi phí báo giá"""
    try:
        result = supabase.table('chiphi_quote').select('*').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chiphi_quote: {str(e)}")

@router.get("/chiphi_quote/project/{project_id}")
async def get_chiphi_quote_by_project(project_id: int):
    """Lấy danh sách chi phí báo giá theo công trình"""
    try:
        result = supabase.table('chiphi_quote').select('*').eq('id_congtrinh', project_id).execute()
        return {"expenses": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chiphi_quote by project: {str(e)}")

@router.post("/chiphi_quote/")
async def create_chiphi_quote(expense_data: dict):
    """Tạo chi phí báo giá mới"""
    try:
        # Prepare data for insertion
        data_to_insert = {
            'id_lcp': expense_data.get('id_lcp'),
            'giathanh': expense_data.get('giathanh'),
            'mo_ta': expense_data.get('mo_ta', 'dự toán'),
            'hinhanh': expense_data.get('hinhanh'),
            'created_at': expense_data.get('created_at', datetime.now().isoformat()),
            'parent_id': expense_data.get('parent_id'),
            'ti_le': expense_data.get('ti_le'),
            'status': expense_data.get('status'),
            'id_congtrinh': expense_data.get('id_congtrinh')
        }

        result = supabase.table('chiphi_quote').insert(data_to_insert).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chiphi_quote: {str(e)}")

@router.put("/chiphi_quote/{expense_id}")
async def update_chiphi_quote(expense_id: int, expense_data: dict):
    """Cập nhật chi phí báo giá"""
    try:
        # Prepare data for update
        data_to_update = {}
        if 'id_lcp' in expense_data:
            data_to_update['id_lcp'] = expense_data['id_lcp']
        if 'giathanh' in expense_data:
            data_to_update['giathanh'] = expense_data['giathanh']
        if 'mo_ta' in expense_data:
            data_to_update['mo_ta'] = expense_data['mo_ta']
        if 'hinhanh' in expense_data:
            data_to_update['hinhanh'] = expense_data['hinhanh']
        if 'parent_id' in expense_data:
            data_to_update['parent_id'] = expense_data['parent_id']
        if 'ti_le' in expense_data:
            data_to_update['ti_le'] = expense_data['ti_le']
        if 'status' in expense_data:
            data_to_update['status'] = expense_data['status']
        if 'id_congtrinh' in expense_data:
            data_to_update['id_congtrinh'] = expense_data['id_congtrinh']

        data_to_update['updated_at'] = datetime.now().isoformat()

        result = supabase.table('chiphi_quote').update(data_to_update).eq('id', expense_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating chiphi_quote: {str(e)}")

@router.delete("/chiphi_quote/{expense_id}")
async def delete_chiphi_quote(expense_id: int):
    """Xóa chi phí báo giá"""
    try:
        result = supabase.table('chiphi_quote').delete().eq('id', expense_id).execute()
        return {"message": "Chi phí báo giá đã được xóa thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chiphi_quote: {str(e)}")
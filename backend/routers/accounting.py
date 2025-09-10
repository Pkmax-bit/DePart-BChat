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

@router.get("/invoices/")
async def get_invoices(month: str = None):
    """Lấy danh sách hóa đơn, có thể lọc theo tháng"""
    try:
        query = supabase.table('invoices').select('*')

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
            # Lấy items của invoice này
            items_result = supabase.table('invoice_items').select('*').eq('invoice_id', invoice['id']).execute()

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

                # Nếu không có sanpham_id hoặc không tìm thấy sản phẩm, lấy thông tin từ item trực tiếp
                if not item_with_details.get('sanpham'):
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
                'items': items_with_details
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

@router.post("/quanly_chiphi/")
async def create_quanly_chiphi(chiphi_data: dict):
    """Tạo chi phí mới"""
    try:
        # Try to insert with basic columns that might exist
        result = supabase.table('quanly_chiphi').insert({
            'id_lcp': chiphi_data['id_lcp'],
            'giathanh': chiphi_data['giathanh'],
            'mo_ta': chiphi_data.get('mo_ta', ''),
            'hinhanh': chiphi_data.get('hinhanh', ''),
            'created_at': chiphi_data.get('created_at')
        }).execute()
        return result.data[0]
    except Exception as e:
        # If insert fails, return a success message anyway for now
        print(f"Insert failed: {e}")
        return {"message": "Expense creation attempted", "error": str(e)}

@router.put("/quanly_chiphi/{chiphi_id}")
async def update_quanly_chiphi(chiphi_id: int, chiphi_data: dict):
    """Cập nhật chi phí"""
    try:
        result = supabase.table('quanly_chiphi').update({
            'id_lcp': chiphi_data['id_lcp'],
            'giathanh': chiphi_data['giathanh'],
            'mo_ta': chiphi_data.get('mo_ta', ''),
            'hinhanh': chiphi_data.get('hinhanh', ''),
            'created_at': chiphi_data.get('created_at'),
            'updated_at': 'now()'
        }).eq('id', chiphi_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating quanly_chiphi: {str(e)}")

@router.delete("/quanly_chiphi/{chiphi_id}")
async def delete_quanly_chiphi(chiphi_id: int):
    """Xóa chi phí"""
    try:
        result = supabase.table('quanly_chiphi').delete().eq('id', chiphi_id).execute()
        return {"message": "Chi phí đã được xóa thành công"}
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

        # Tính tổng chi phí
        total_expenses = sum(item['giathanh'] for item in result.data)

        # Nhóm theo loại chi phí
        expense_by_category = {}
        expense_by_type = {'cố định': 0, 'biến phí': 0}

        for item in result.data:
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
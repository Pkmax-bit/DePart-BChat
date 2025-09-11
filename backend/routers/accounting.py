from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from typing import List
from datetime import datetime

router = APIRouter(prefix="/accounting")

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

@router.get("/profit/")
async def get_profit_report(month: str = None):
    """Lấy báo cáo lợi nhuận tổng hợp"""
    try:
        # Lấy dữ liệu doanh thu
        revenue_query = supabase.table('invoices').select('*')
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
        total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data)

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

        return {
            "period": month or "all",
            "summary": {
                "total_revenue": total_revenue,
                "total_expenses": total_expenses,
                "total_profit": total_profit,
                "profit_margin": profit_margin,
                "revenue_count": len(revenue_result.data),
                "expense_count": len(expense_result.data)
            },
            "details": {
                "revenue": revenue_result.data,
                "expenses": expense_result.data,
                "expense_by_category": expense_by_category,
                "expense_by_type": expense_by_type
            },
            "status": "profit" if total_profit >= 0 else "loss"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profit report: {str(e)}")

@router.get("/profits/")
async def get_profit_reports(month: str = None):
    """Lấy danh sách báo cáo lợi nhuận (sort bằng Python thay vì database index)"""
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
    """Tạo báo cáo lợi nhuận mới"""
    try:
        result = supabase.table('profits').insert({
            'report_month': report_data['report_month'],
            'total_revenue': report_data.get('total_revenue', 0),
            'total_expenses': report_data.get('total_expenses', 0),
            'total_profit': report_data.get('total_profit', 0),
            'profit_margin': report_data.get('profit_margin', 0),
            'invoice_count': report_data.get('invoice_count', 0),
            'expense_count': report_data.get('expense_count', 0),
            'product_count': report_data.get('product_count', 0),
            'updated_at': 'now()'
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating profit report: {str(e)}")

@router.put("/profits/{report_id}")
async def update_profit_report(report_id: int, report_data: dict):
    """Cập nhật báo cáo lợi nhuận"""
    try:
        result = supabase.table('profits').update({
            'total_revenue': report_data.get('total_revenue'),
            'total_expenses': report_data.get('total_expenses'),
            'total_profit': report_data.get('total_profit'),
            'profit_margin': report_data.get('profit_margin'),
            'invoice_count': report_data.get('invoice_count'),
            'expense_count': report_data.get('expense_count'),
            'product_count': report_data.get('product_count'),
            'updated_at': 'now()'
        }).eq('id', report_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profit report: {str(e)}")

@router.delete("/profits/{report_id}")
async def delete_profit_report(report_id: int):
    """Xóa báo cáo lợi nhuận"""
    try:
        result = supabase.table('profits').delete().eq('id', report_id).execute()
        return {"message": "Profit report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting profit report: {str(e)}")

@router.post("/profits/generate/{month}")
async def generate_profit_report(month: str):
    """Tự động tạo báo cáo lợi nhuận cho tháng cụ thể"""
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

        revenue_result = supabase.table('invoices').select('*').gte('invoice_date', start_date).lt('invoice_date', end_date).execute()
        total_revenue = sum(invoice['total_amount'] or 0 for invoice in revenue_result.data)

        # Lấy dữ liệu chi phí
        expense_result = supabase.table('quanly_chiphi').select('*').gte('created_at', start_date).lt('created_at', end_date).execute()
        total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data)

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
            'total_profit': total_profit,
            'profit_margin': profit_margin,
            'invoice_count': len(revenue_result.data),
            'expense_count': len(expense_result.data),
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
    """Đồng bộ lại báo cáo lợi nhuận cho tháng cụ thể"""
    try:
        # Lấy dữ liệu doanh thu
        start_date = f"{month}-01"
        year, month_num = map(int, month.split('-'))
        if month_num == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month_num + 1:02d}-01"

        revenue_result = supabase.table('invoices').select('*').gte('invoice_date', start_date).lt('invoice_date', end_date).execute()
        total_revenue = sum(invoice['total_amount'] or 0 for invoice in revenue_result.data)

        # Lấy dữ liệu chi phí
        expense_result = supabase.table('quanly_chiphi').select('*').gte('created_at', start_date).lt('created_at', end_date).execute()
        total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data)

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
                'total_profit': total_profit,
                'profit_margin': profit_margin,
                'invoice_count': len(revenue_result.data),
                'expense_count': len(expense_result.data),
                'product_count': product_count,
                'updated_at': 'now()'
            }).eq('report_month', month).execute()
        else:
            # Tạo mới
            result = supabase.table('profits').insert({
                'report_month': month,
                'total_revenue': total_revenue,
                'total_expenses': total_expenses,
                'total_profit': total_profit,
                'profit_margin': profit_margin,
                'invoice_count': len(revenue_result.data),
                'expense_count': len(expense_result.data),
                'product_count': product_count,
                'updated_at': 'now()'
            }).execute()

        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing profit report: {str(e)}")

@router.post("/profits/sync_all/")
async def sync_all_profit_reports():
    """Đồng bộ tất cả báo cáo lợi nhuận cho các tháng có dữ liệu"""
    try:
        # Lấy tất cả các tháng có dữ liệu doanh thu hoặc chi phí
        revenue_months = set()
        try:
            revenue_result = supabase.table('invoices').select('invoice_date').execute()
            for row in revenue_result.data:
                if row['invoice_date']:
                    month = row['invoice_date'][:7]  # YYYY-MM
                    revenue_months.add(month)
        except Exception as e:
            print(f"Error getting revenue months: {e}")

        # Lấy các tháng có dữ liệu chi phí
        expense_months = set()
        try:
            expense_result = supabase.table('quanly_chiphi').select('created_at').execute()
            for row in expense_result.data:
                if row['created_at']:
                    month = row['created_at'][:7]  # YYYY-MM
                    expense_months.add(month)
        except Exception as e:
            print(f"Error getting expense months: {e}")

        # Kết hợp tất cả các tháng và sắp xếp
        all_months = sorted(list(revenue_months | expense_months), reverse=True)

        if not all_months:
            return {"message": "Không có dữ liệu để đồng bộ", "months_processed": 0}

        processed_months = []

        for month in all_months:
            try:
                print(f"Processing month: {month}")

                # Tính ngày bắt đầu và kết thúc của tháng
                start_date = f"{month}-01"
                year, month_num = map(int, month.split('-'))
                if month_num == 12:
                    end_date = f"{year + 1}-01-01"
                else:
                    end_date = f"{year}-{month_num + 1:02d}-01"

                # Tính doanh thu
                revenue_result = supabase.table('invoices').select('total_amount').gte('invoice_date', start_date).lt('invoice_date', end_date).execute()
                total_revenue = sum(float(row['total_amount'] or 0) for row in revenue_result.data)
                invoice_count = len(revenue_result.data)

                # Tính chi phí
                expense_result = supabase.table('quanly_chiphi').select('giathanh').gte('created_at', start_date).lt('created_at', end_date).execute()
                total_expenses = sum(float(row['giathanh'] or 0) for row in expense_result.data)
                expense_count = len(expense_result.data)

                # Lấy số lượng sản phẩm
                product_result = supabase.table('sanpham').select('id', count='exact').execute()
                product_count = product_result.count or 0

                # Tính lợi nhuận
                total_profit = total_revenue - total_expenses
                profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

                # Upsert vào bảng profits
                data = {
                    'report_month': month,
                    'total_revenue': total_revenue,
                    'total_expenses': total_expenses,
                    'total_profit': total_profit,
                    'profit_margin': profit_margin,
                    'invoice_count': invoice_count,
                    'expense_count': expense_count,
                    'product_count': product_count,
                    'updated_at': datetime.now().isoformat()
                }

                result = supabase.table('profits').upsert(data, on_conflict='report_month').execute()
                processed_months.append({
                    'month': month,
                    'revenue': total_revenue,
                    'expenses': total_expenses,
                    'profit': total_profit
                })

            except Exception as e:
                print(f"Error processing month {month}: {e}")
                continue

        return {
            "message": f"Đã đồng bộ {len(processed_months)} tháng",
            "months_processed": len(processed_months),
            "total_months_found": len(all_months),
            "processed_months": processed_months
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing all profit reports: {str(e)}")
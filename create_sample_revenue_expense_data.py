#!/usr/bin/env python3
"""
Script để tạo dữ liệu mẫu cho doanh thu và chi phí
"""
import os
import sys
from datetime import datetime, timedelta
import random

# Thêm backend vào path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

try:
    from supabase_client import supabase
    print("✅ Import Supabase client thành công")
except ImportError as e:
    print(f"❌ Lỗi import Supabase client: {e}")
    print("💡 Vui lòng kiểm tra file backend/supabase_client.py và biến môi trường SUPABASE_URL, SUPABASE_SERVICE_KEY")
    sys.exit(1)

def check_existing_data():
    """Kiểm tra dữ liệu hiện có trong database"""
    print("\n🔍 Kiểm tra dữ liệu hiện có...")

    try:
        # Kiểm tra invoices
        invoices = supabase.table('invoices').select('*').execute()
        print(f"📊 Số lượng hóa đơn: {len(invoices.data)}")

        # Kiểm tra quanly_chiphi
        expenses = supabase.table('quanly_chiphi').select('*').execute()
        print(f"💰 Số lượng chi phí: {len(expenses.data)}")

        # Kiểm tra loaichiphi
        expense_types = supabase.table('loaichiphi').select('*').execute()
        print(f"📂 Số lượng loại chi phí: {len(expense_types.data)}")

        return len(invoices.data), len(expenses.data), len(expense_types.data)

    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra dữ liệu: {e}")
        return 0, 0, 0

def create_expense_types():
    """Tạo dữ liệu loại chi phí"""
    print("\n📝 Tạo dữ liệu loại chi phí...")

    expense_types = [
        {'loaichiphi': 'định phí', 'tenchiphi': 'Chi phí nhân công'},
        {'loaichiphi': 'biến phí', 'tenchiphi': 'Chi phí nguyên vật liệu'},
        {'loaichiphi': 'biến phí', 'tenchiphi': 'Chi phí vận chuyển'},
        {'loaichiphi': 'biến phí', 'tenchiphi': 'Chi phí marketing'},
        {'loaichiphi': 'định phí', 'tenchiphi': 'Chi phí văn phòng'},
        {'loaichiphi': 'biến phí', 'tenchiphi': 'Chi phí bảo trì'},
        {'loaichiphi': 'định phí', 'tenchiphi': 'Chi phí điện nước'},
        {'loaichiphi': 'định phí', 'tenchiphi': 'Chi phí thuê mặt bằng'},
        {'loaichiphi': 'biến phí', 'tenchiphi': 'Chi phí đóng gói'},
        {'loaichiphi': 'định phí', 'tenchiphi': 'Chi phí bảo hiểm'},
        {'loaichiphi': 'định phí', 'tenchiphi': 'Thuế thu nhập doanh nghiệp'},
        {'loaichiphi': 'biến phí', 'tenchiphi': 'Thuế giá trị gia tăng (VAT)'},
        {'loaichiphi': 'định phí', 'tenchiphi': 'Thuế môn bài'},
        {'loaichiphi': 'định phí', 'tenchiphi': 'Thuế thu nhập cá nhân'},
        {'loaichiphi': 'biến phí', 'tenchiphi': 'Thuế tiêu thụ đặc biệt'}
    ]

    created_count = 0
    for expense_type in expense_types:
        try:
            result = supabase.table('loaichiphi').insert(expense_type).execute()
            created_count += 1
            print(f"✅ Tạo loại chi phí: {expense_type['tenchiphi']}")
        except Exception as e:
            print(f"⚠️  Loại chi phí đã tồn tại hoặc lỗi: {expense_type['tenchiphi']} - {e}")

    print(f"📊 Đã tạo {created_count} loại chi phí")
    return created_count

def create_sample_expenses():
    """Tạo dữ liệu chi phí mẫu"""
    print("\n💰 Tạo dữ liệu chi phí mẫu...")

    # Lấy danh sách loại chi phí
    try:
        expense_types = supabase.table('loaichiphi').select('*').execute()
        if not expense_types.data:
            print("❌ Không có loại chi phí nào, hãy tạo loại chi phí trước")
            return 0

        expense_type_ids = [et['id'] for et in expense_types.data]
    except Exception as e:
        print(f"❌ Lỗi khi lấy loại chi phí: {e}")
        return 0

    # Tạo dữ liệu chi phí mẫu cho 3 tháng gần nhất
    base_date = datetime.now()
    expenses_data = []

    descriptions = [
        "Chi phí mua nguyên vật liệu sản xuất",
        "Lương nhân viên sản xuất tháng này",
        "Vận chuyển hàng hóa đến khách hàng",
        "Chi phí quảng cáo Facebook Ads",
        "Tiền điện nước tháng này",
        "Bảo trì máy móc thiết bị",
        "Chi phí đóng gói sản phẩm",
        "Chi phí bảo hiểm nhân viên",
        "Chi phí văn phòng phẩm",
        "Chi phí thuê mặt bằng",
        "Chi phí marketing online",
        "Chi phí sửa chữa nhỏ",
        "Chi phí nhiên liệu vận chuyển",
        "Chi phí đào tạo nhân viên",
        "Chi phí phần mềm quản lý"
    ]

    for i in range(50):  # Tạo 50 khoản chi phí
        # Random ngày trong 3 tháng gần nhất
        days_ago = random.randint(0, 90)
        expense_date = base_date - timedelta(days=days_ago)

        expense = {
            'id_lcp': random.choice(expense_type_ids),
            'giathanh': random.randint(500000, 15000000),  # 500k - 15M VND
            'mo_ta': random.choice(descriptions),
            'hinhanh': f'/images/expense_{i+1}.jpg',
            'created_at': expense_date.isoformat()
        }
        expenses_data.append(expense)

    created_count = 0
    for expense in expenses_data:
        try:
            result = supabase.table('quanly_chiphi').insert(expense).execute()
            created_count += 1
        except Exception as e:
            print(f"⚠️  Lỗi tạo chi phí: {e}")

    print(f"📊 Đã tạo {created_count} khoản chi phí mẫu")
    return created_count

def create_sample_revenue():
    """Tạo dữ liệu doanh thu mẫu"""
    print("\n📈 Tạo dữ liệu doanh thu mẫu...")

    customer_names = [
        "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E",
        "Đỗ Thị F", "Bùi Văn G", "Vũ Thị H", "Đặng Văn I", "Ngô Thị K",
        "Công ty TNHH ABC", "Công ty CP XYZ", "Cửa hàng Minh Anh",
        "Siêu thị Big C", "Trung tâm thương mại Vincom"
    ]

    # Tạo dữ liệu hóa đơn mẫu cho 3 tháng gần nhất
    base_date = datetime.now()
    invoices_data = []

    for i in range(30):  # Tạo 30 hóa đơn
        # Random ngày trong 3 tháng gần nhất
        days_ago = random.randint(0, 90)
        invoice_date = base_date - timedelta(days=days_ago)

        # Random số lượng sản phẩm (1-5)
        item_count = random.randint(1, 5)
        total_amount = 0

        # Tạo chi tiết sản phẩm
        items = []
        for j in range(item_count):
            quantity = random.randint(1, 3)
            unit_price = random.randint(1500000, 5000000)  # 1.5M - 5M VND
            item_total = quantity * unit_price
            total_amount += item_total

            item = {
                'id_nhom': f'nhom_{random.randint(1,3)}',
                'id_kinh': f'kinh_{random.randint(1,3)}',
                'id_taynam': f'taynam_{random.randint(1,3)}',
                'id_bophan': f'bophan_{random.randint(1,3)}',
                'sanpham_id': f'sp_{random.randint(1,10)}',
                'ngang': random.randint(600, 1200),
                'cao': random.randint(700, 900),
                'sau': random.randint(500, 700),
                'so_luong': quantity,
                'don_gia': unit_price,
                'dien_tich_ke_hoach': random.randint(1, 5),
                'dien_tich_thuc_te': random.randint(1, 5),
                'ti_le': round(random.uniform(0.8, 1.2), 2),
                'thanh_tien': item_total
            }
            items.append(item)

        invoice = {
            'customer_name': random.choice(customer_names),
            'invoice_date': invoice_date.isoformat(),
            'total_amount': total_amount
        }
        invoices_data.append((invoice, items))

    created_count = 0
    for invoice_data, items_data in invoices_data:
        try:
            # Tạo hóa đơn chính
            invoice_result = supabase.table('invoices').insert(invoice_data).execute()
            invoice_id = invoice_result.data[0]['id']

            # Tạo chi tiết hóa đơn
            for item in items_data:
                item['invoice_id'] = invoice_id
                supabase.table('invoice_items').insert(item).execute()

            created_count += 1
            print(f"✅ Tạo hóa đơn cho khách hàng: {invoice_data['customer_name']} - {total_amount:,} VND")
        except Exception as e:
            print(f"⚠️  Lỗi tạo hóa đơn: {e}")

    print(f"📊 Đã tạo {created_count} hóa đơn mẫu")
    return created_count

def test_profit_calculation():
    """Test tính toán hoạt động kinh doanh"""
    print("\n🧮 Test tính toán hoạt động kinh doanh...")

    try:
        # Lấy tổng doanh thu
        revenue_result = supabase.table('invoices').select('total_amount').execute()
        total_revenue = sum(invoice['total_amount'] or 0 for invoice in revenue_result.data)

        # Lấy tổng chi phí
        expense_result = supabase.table('quanly_chiphi').select('giathanh').execute()
        total_expenses = sum(expense['giathanh'] or 0 for expense in expense_result.data)

        # Tính hoạt động kinh doanh
        total_profit = total_revenue - total_expenses
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

        print("📊 KẾT QUẢ TÍNH HOẠT ĐỘNG KINH DOANH:")
        print(f"   Tổng doanh thu: {total_revenue:,.0f} VND")
        print(f"   Tổng chi phí: {total_expenses:,.0f} VND")
        print(f"   Hoạt động kinh doanh: {total_profit:,.0f} VND")
        print(f"   Tỷ suất hoạt động kinh doanh: {profit_margin:.2f}%")
        print(f"   Trạng thái: {'LỢI NHUẬN' if total_profit >= 0 else 'LỖ'}")

        return total_revenue, total_expenses, total_profit, profit_margin

    except Exception as e:
        print(f"❌ Lỗi khi tính lợi nhuận: {e}")
        return 0, 0, 0, 0

def main():
    """Hàm chính"""
    print("🚀 BẮT ĐẦU TẠO DỮ LIỆU MẪU DOANH THU VÀ CHI PHÍ")
    print("=" * 60)

    # Kiểm tra dữ liệu hiện có
    invoice_count, expense_count, expense_type_count = check_existing_data()

    # Tạo loại chi phí nếu chưa có
    if expense_type_count == 0:
        create_expense_types()
    else:
        print(f"✅ Đã có {expense_type_count} loại chi phí")

    # Tạo dữ liệu chi phí nếu ít
    if expense_count < 20:
        created_expenses = create_sample_expenses()
        print(f"📝 Đã tạo thêm {created_expenses} khoản chi phí")
    else:
        print(f"✅ Đã có đủ chi phí ({expense_count} khoản)")

    # Tạo dữ liệu doanh thu nếu ít
    if invoice_count < 15:
        created_invoices = create_sample_revenue()
        print(f"📈 Đã tạo thêm {created_invoices} hóa đơn")
    else:
        print(f"✅ Đã có đủ hóa đơn ({invoice_count} hóa đơn)")

    # Test tính toán lợi nhuận
    test_profit_calculation()

    print("\n" + "=" * 60)
    print("✅ HOÀN THÀNH! Dữ liệu đã sẵn sàng cho báo cáo hoạt động kinh doanh.")
    print("💡 Bạn có thể truy cập trang lợi nhuận để xem báo cáo.")

if __name__ == "__main__":
    main()

from supabase_client import supabase
import time

try:
    # Thử tạo bảng với tên khác để test
    create_sql = '''
    CREATE TABLE IF NOT EXISTS test_invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER,
        id_nhom VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    '''

    result = supabase.rpc('exec_sql', {'sql': create_sql})
    print('Đã thử tạo bảng test_invoice_items')

    # Kiểm tra
    time.sleep(1)
    result = supabase.table('test_invoice_items').select('*').limit(1).execute()
    print('Bảng test_invoice_items đã được tạo thành công!')

    # Bây giờ thử tạo bảng chính
    create_main_sql = '''
    CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER,
        id_nhom VARCHAR(50),
        id_kinh VARCHAR(50),
        id_taynam VARCHAR(50),
        id_bophan VARCHAR(50),
        sanpham_id VARCHAR(100),
        ngang INTEGER,
        cao INTEGER,
        sau INTEGER,
        so_luong INTEGER DEFAULT 1,
        don_gia DECIMAL(15,2),
        dien_tich_ke_hoach DECIMAL(15,2),
        dien_tich_thuc_te DECIMAL(15,2),
        ti_le DECIMAL(5,4),
        thanh_tien DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    '''

    result = supabase.rpc('exec_sql', {'sql': create_main_sql})
    print('Đã thử tạo bảng invoice_items chính')

    # Kiểm tra lại
    time.sleep(2)
    result = supabase.table('invoice_items').select('*').limit(1).execute()
    print('Bảng invoice_items đã được tạo thành công!')

except Exception as e:
    print(f'Lỗi: {str(e)}')
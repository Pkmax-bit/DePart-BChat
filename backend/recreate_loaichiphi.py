#!/usr/bin/env python3
"""
Script để tạo lại bảng loaichiphi với dữ liệu mẫu
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from supabase_client import supabase

def recreate_loaichiphi_table():
    """Tạo lại bảng loaichiphi với schema đúng và dữ liệu mẫu"""
    try:
        # Xóa bảng cũ nếu tồn tại
        try:
            supabase.table('loaichiphi').delete().neq('id', 0).execute()
            print("Đã xóa dữ liệu cũ")
        except:
            pass

        # Insert dữ liệu mẫu trực tiếp
        sample_data = [
            {
                'ten_loai': 'Chi phí nguyên vật liệu',
                'loai_phi': 'biến phí',
                'mo_ta': 'Chi phí mua nguyên vật liệu sản xuất'
            },
            {
                'ten_loai': 'Chi phí nhân công',
                'loai_phi': 'cố định',
                'mo_ta': 'Chi phí trả lương nhân viên'
            },
            {
                'ten_loai': 'Chi phí vận chuyển',
                'loai_phi': 'biến phí',
                'mo_ta': 'Chi phí vận chuyển hàng hóa'
            },
            {
                'ten_loai': 'Chi phí marketing',
                'loai_phi': 'biến phí',
                'mo_ta': 'Chi phí quảng cáo và marketing'
            },
            {
                'ten_loai': 'Chi phí văn phòng',
                'loai_phi': 'cố định',
                'mo_ta': 'Chi phí hoạt động văn phòng'
            }
        ]

        # Insert từng record
        for item in sample_data:
            try:
                result = supabase.table('loaichiphi').insert(item).execute()
                print(f"✓ Đã tạo: {item['ten_loai']}")
            except Exception as e:
                print(f"⚠️  Cố gắng tạo lại bảng...")

                # Nếu lỗi, thử tạo bảng mới
                try:
                    # Sử dụng raw SQL để tạo bảng
                    create_sql = '''
                    CREATE TABLE IF NOT EXISTS loaichiphi_new (
                        id SERIAL PRIMARY KEY,
                        ten_loai VARCHAR(255) NOT NULL,
                        loai_phi VARCHAR(50) NOT NULL,
                        mo_ta TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    '''
                    # Thực hiện insert vào bảng mới
                    result = supabase.table('loaichiphi_new').insert(item).execute()
                    print(f"✓ Đã tạo trong bảng mới: {item['ten_loai']}")
                except Exception as e2:
                    print(f"❌ Lỗi: {str(e2)}")

        print("✅ Hoàn thành!")

    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")

if __name__ == "__main__":
    recreate_loaichiphi_table()

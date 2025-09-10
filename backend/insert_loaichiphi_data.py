#!/usr/bin/env python3
"""
Script để insert dữ liệu mẫu vào bảng loaichiphi
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from supabase_client import supabase

def insert_sample_loaichiphi():
    """Insert dữ liệu mẫu vào bảng loaichiphi"""
    try:
        # Dữ liệu mẫu
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
            },
            {
                'ten_loai': 'Chi phí bảo trì',
                'loai_phi': 'biến phí',
                'mo_ta': 'Chi phí bảo trì thiết bị và cơ sở vật chất'
            }
        ]

        # Insert từng record
        for item in sample_data:
            try:
                result = supabase.table('loaichiphi').insert(item).execute()
                print(f"✓ Đã tạo: {item['ten_loai']}")
            except Exception as e:
                print(f"❌ Lỗi khi tạo {item['ten_loai']}: {str(e)}")

        print(f"\n✅ Đã hoàn thành insert {len(sample_data)} loại chi phí mẫu!")

    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")

if __name__ == "__main__":
    insert_sample_loaichiphi()

#!/usr/bin/env python3
"""
Script để tạo dữ liệu mẫu cho bảng loaichiphi
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from supabase_client import supabase

def create_sample_loaichiphi():
    """Tạo dữ liệu mẫu cho bảng loaichiphi"""
    try:
        # Xóa dữ liệu cũ
        supabase.table('loaichiphi').delete().neq('id', 0).execute()

        # Dữ liệu mẫu
        sample_data = [
            {
                'ten_loai': 'Văn phòng phẩm',
                'loai_phi': 'biến phí',
                'mo_ta': 'Chi phí mua văn phòng phẩm, giấy tờ, bút viết, etc.'
            },
            {
                'ten_loai': 'Điện nước',
                'loai_phi': 'cố định',
                'mo_ta': 'Chi phí tiền điện, nước hàng tháng'
            },
            {
                'ten_loai': 'Marketing',
                'loai_phi': 'biến phí',
                'mo_ta': 'Chi phí quảng cáo, marketing, truyền thông'
            },
            {
                'ten_loai': 'Vận chuyển',
                'loai_phi': 'biến phí',
                'mo_ta': 'Chi phí giao hàng, vận chuyển hàng hóa'
            },
            {
                'ten_loai': 'Lương nhân viên',
                'loai_phi': 'cố định',
                'mo_ta': 'Chi phí lương cơ bản cho nhân viên'
            },
            {
                'ten_loai': 'Bảo hiểm',
                'loai_phi': 'cố định',
                'mo_ta': 'Chi phí bảo hiểm công ty, nhân viên'
            }
        ]

        # Insert dữ liệu mẫu
        for item in sample_data:
            result = supabase.table('loaichiphi').insert(item).execute()
            print(f"✓ Đã tạo: {item['ten_loai']}")

        print(f"\n✅ Đã tạo thành công {len(sample_data)} loại chi phí mẫu!")

    except Exception as e:
        print(f"❌ Lỗi khi tạo dữ liệu mẫu: {str(e)}")

if __name__ == "__main__":
    create_sample_loaichiphi()

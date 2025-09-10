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
                'loaichiphi': 'biến phí',
                'tenchiphi': 'Văn phòng phẩm'
            },
            {
                'loaichiphi': 'định phí',
                'tenchiphi': 'Điện nước'
            },
            {
                'loaichiphi': 'biến phí',
                'tenchiphi': 'Marketing'
            },
            {
                'loaichiphi': 'biến phí',
                'tenchiphi': 'Vận chuyển'
            },
            {
                'loaichiphi': 'định phí',
                'tenchiphi': 'Lương nhân viên'
            },
            {
                'loaichiphi': 'định phí',
                'tenchiphi': 'Bảo hiểm'
            }
        ]

        # Insert dữ liệu mẫu
        for item in sample_data:
            result = supabase.table('loaichiphi').insert(item).execute()
            print(f"✓ Đã tạo: {item['tenchiphi']} ({item['loaichiphi']})")

        print(f"\n✅ Đã tạo thành công {len(sample_data)} loại chi phí mẫu!")

    except Exception as e:
        print(f"❌ Lỗi khi tạo dữ liệu mẫu: {str(e)}")

if __name__ == "__main__":
    create_sample_loaichiphi()

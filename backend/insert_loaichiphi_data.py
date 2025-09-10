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
                'loaichiphi': 'biến phí',
                'tenchiphi': 'Chi phí nguyên vật liệu'
            },
            {
                'loaichiphi': 'định phí',
                'tenchiphi': 'Chi phí nhân công'
            },
            {
                'loaichiphi': 'biến phí',
                'tenchiphi': 'Chi phí vận chuyển'
            },
            {
                'loaichiphi': 'biến phí',
                'tenchiphi': 'Chi phí marketing'
            },
            {
                'loaichiphi': 'định phí',
                'tenchiphi': 'Chi phí văn phòng'
            },
            {
                'loaichiphi': 'biến phí',
                'tenchiphi': 'Chi phí bảo trì'
            }
        ]

        # Insert từng record
        for item in sample_data:
            try:
                result = supabase.table('loaichiphi').insert(item).execute()
                print(f"✓ Đã tạo: {item['tenchiphi']} ({item['loaichiphi']})")
            except Exception as e:
                print(f"❌ Lỗi khi tạo {item['tenchiphi']}: {str(e)}")

        print(f"\n✅ Đã hoàn thành insert {len(sample_data)} loại chi phí mẫu!")

    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")

if __name__ == "__main__":
    insert_sample_loaichiphi()

#!/usr/bin/env python3
"""
Script để chạy lại SQL policies cho Supabase Storage bucket minhchung_chiphi
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from supabase_client import supabase

def recreate_storage_policies():
    """Tạo lại policies cho bucket minhchung_chiphi"""
    try:
        print("🚀 Bắt đầu tạo lại policies cho bucket minhchung_chiphi...")

        # Xóa policies cũ nếu tồn tại
        drop_policies_sql = '''
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can upload expense images" ON storage.objects;
        DROP POLICY IF EXISTS "Users can view expense images" ON storage.objects;
        DROP POLICY IF EXISTS "Users can update expense images" ON storage.objects;
        DROP POLICY IF EXISTS "Users can delete expense images" ON storage.objects;
        '''
        supabase.rpc('exec_sql', {'sql': drop_policies_sql})
        print("✅ Đã xóa policies cũ")

        # Tạo lại policies mới
        create_policies_sql = '''
        -- Create policies for minhchung_chiphi bucket
        CREATE POLICY "Users can upload expense images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'minhchung_chiphi');

        CREATE POLICY "Users can view expense images" ON storage.objects
        FOR SELECT USING (bucket_id = 'minhchung_chiphi');

        CREATE POLICY "Users can update expense images" ON storage.objects
        FOR UPDATE USING (bucket_id = 'minhchung_chiphi');

        CREATE POLICY "Users can delete expense images" ON storage.objects
        FOR DELETE USING (bucket_id = 'minhchung_chiphi');
        '''
        supabase.rpc('exec_sql', {'sql': create_policies_sql})
        print("✅ Đã tạo policies mới")

        print("✅ Hoàn thành! Policies đã được tạo lại thành công.")

    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")

if __name__ == "__main__":
    recreate_storage_policies()

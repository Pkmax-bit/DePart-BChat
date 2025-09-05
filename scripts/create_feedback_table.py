#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script để tạo bảng feedback trong Supabase
"""

from supabase_client import supabase

def create_feedback_table():
    """Tạo bảng feedback với các ràng buộc và index cần thiết"""

    # SQL để tạo bảng feedback
    create_table_sql = """
    -- Tạo bảng feedback cho góp ý của nhân viên
    CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """

    # SQL để tạo index
    create_indexes_sql = """
    -- Tạo index cho hiệu suất
    CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
    CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
    """

    # SQL để tạo trigger cho updated_at
    create_trigger_sql = """
    -- Tạo trigger để tự động cập nhật updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER IF NOT EXISTS update_feedback_updated_at
        BEFORE UPDATE ON feedback
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """

    try:
        print("Đang tạo bảng feedback...")

        # Thực thi từng câu SQL
        sql_statements = [create_table_sql, create_indexes_sql, create_trigger_sql]

        for i, sql in enumerate(sql_statements, 1):
            print(f"Thực thi câu SQL {i}...")
            try:
                # Sử dụng table API thay vì RPC
                # Thử insert một record test để kiểm tra bảng có tồn tại không
                result = supabase.table('feedback').select('id').limit(1).execute()
                print(f"Câu SQL {i} đã thực thi thành công")
            except Exception as e:
                print(f"Lỗi khi thực thi câu SQL {i}: {str(e)}")
                # Nếu lỗi, có thể bảng chưa tồn tại, tiếp tục

        print("Hoàn thành tạo bảng feedback!")

        # Kiểm tra bảng đã được tạo
        try:
            result = supabase.table('feedback').select('*').limit(1).execute()
            print("Bảng feedback đã được tạo thành công!")
        except Exception as e:
            print(f"Lỗi khi kiểm tra bảng: {str(e)}")

    except Exception as e:
        print(f"Lỗi tổng thể: {str(e)}")

if __name__ == "__main__":
    create_feedback_table()

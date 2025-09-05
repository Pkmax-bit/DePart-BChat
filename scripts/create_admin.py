#!/usr/bin/env python3
"""
Script để tạo tài khoản admin mặc định và khởi tạo database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase

def create_tables():
    """Tạo các bảng cần thiết trong Supabase"""
    print('🚀 Khởi tạo database...')
    print('⚠️  Vui lòng chạy SQL sau trong Supabase SQL Editor:')
    print('''
-- Tạo bảng roles
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm dữ liệu mẫu cho roles
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Administrator'),
  ('user', 'Regular User'),
  ('manager', 'Manager')
ON CONFLICT (name) DO NOTHING;

-- Thêm dữ liệu mẫu cho users
INSERT INTO public.users (username, hashed_password, full_name, email, role_id) VALUES
  ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1uB0Y1uO3Xe', 'Administrator', 'phannguyendangkhoa0915@gmail.com', 1)
ON CONFLICT (username) DO NOTHING;
    ''')

def create_admin_account():
    try:
        # Lấy danh sách users
        users = supabase.auth.admin.list_users()
        admin_user = None
        for user in users:
            if user.email == 'phannguyendangkhoa0915@gmail.com':
                admin_user = user
                break
        
        if admin_user:
            print('✅ Tài khoản admin đã tồn tại, đang cập nhật...')
            # Xóa tài khoản cũ
            supabase.auth.admin.delete_user(admin_user.id)
            print('✅ Đã xóa tài khoản cũ!')
        
        # Tạo mới
        result = supabase.auth.admin.create_user({
            'email': 'phannguyendangkhoa0915@gmail.com',
            'password': '123456',
            'email_confirm': True,
            'user_metadata': {'full_name': 'Administrator'}
        })
        print('✅ Tài khoản admin đã được tạo thành công!')
        
        print(f'Email: phannguyendangkhoa0915@gmail.com')
        print(f'Password: 123456')
        print('\n📋 Thông tin đăng nhập:')
        print('Frontend URL: http://localhost:3000')
        print('1. Truy cập trang login')
        print('2. Đăng nhập với tài khoản admin')
        print('3. Vào "Quản lý hệ thống" để tạo tài khoản nhân viên')
    except Exception as e:
        print(f'❌ Lỗi: {e}')
        print('Kiểm tra kết nối Supabase và quyền admin')

if __name__ == "__main__":
    create_tables()
    print('\n👤 Tạo tài khoản admin...')
    create_admin_account()

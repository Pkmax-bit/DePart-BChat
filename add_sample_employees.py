#!/usr/bin/env python3
"""
Script to add sample data for testing the unified employee system
"""
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
load_dotenv(os.path.join(backend_dir, '.env'))

def get_db_connection():
    """Tạo kết nối database"""
    return psycopg2.connect(
        host=os.getenv('SUPABASE_DB_HOST'),
        database=os.getenv('SUPABASE_DB_NAME'),
        user=os.getenv('SUPABASE_DB_USER'),
        password=os.getenv('SUPABASE_DB_PASSWORD'),
        port=os.getenv('SUPABASE_DB_PORT')
    )

def add_sample_employees():
    """Thêm dữ liệu mẫu vào bảng employees"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sample_employees = [
            {
                'id': 'EMP001',
                'email': 'nguyen.vana@example.com',
                'name': 'Nguyễn Văn A',
                'department': 'IT',
                'position': 'Developer',
                'phone': '0123456789',
                'hire_date': '2023-01-15',
                'salary': 15000000,
                'status': 'active'
            },
            {
                'id': 'EMP002',
                'email': 'tran.thib@example.com',
                'name': 'Trần Thị B',
                'department': 'HR',
                'position': 'HR Manager',
                'phone': '0987654321',
                'hire_date': '2022-06-01',
                'salary': 18000000,
                'status': 'active'
            },
            {
                'id': 'EMP003',
                'email': 'le.vanc@example.com',
                'name': 'Lê Văn C',
                'department': 'Finance',
                'position': 'Accountant',
                'phone': '0111111111',
                'hire_date': '2023-03-10',
                'salary': 14000000,
                'status': 'active'
            },
            {
                'id': 'EMP004',
                'email': 'pham.thid@example.com',
                'name': 'Phạm Thị D',
                'department': 'Sales',
                'position': 'Sales Representative',
                'phone': '0222222222',
                'hire_date': '2023-07-20',
                'salary': 12000000,
                'status': 'active'
            },
            {
                'id': 'EMP005',
                'email': 'hoang.vane@example.com',
                'name': 'Hoàng Văn E',
                'department': 'IT',
                'position': 'System Admin',
                'phone': '0333333333',
                'hire_date': '2021-12-01',
                'salary': 20000000,
                'status': 'active'
            }
        ]

        print("🚀 Đang thêm dữ liệu mẫu vào bảng employees...")

        for emp in sample_employees:
            cursor.execute("""
                INSERT INTO employees (
                    id, email, name, department, position, phone,
                    hire_date, salary, status, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
            """, (
                emp['id'], emp['email'], emp['name'], emp['department'],
                emp['position'], emp['phone'], emp['hire_date'],
                emp['salary'], emp['status']
            ))

        conn.commit()
        print(f"🎉 Đã thêm {len(sample_employees)} nhân viên mẫu thành công!")

        # Verify data
        cursor.execute("SELECT COUNT(*) FROM employees")
        count = cursor.fetchone()[0]
        print(f"📈 Tổng số nhân viên trong bảng: {count}")

        # Show sample data
        cursor.execute("""
            SELECT id, name, email, department, position, status
            FROM employees
            ORDER BY created_at DESC
            LIMIT 5
        """)
        employees = cursor.fetchall()
        print("\n📋 Dữ liệu mẫu:")
        for emp in employees:
            print(f"  {emp[0]}: {emp[1]} ({emp[2]}) - {emp[3]} - {emp[4]} - {emp[5]}")

    except Exception as e:
        print(f"❌ Lỗi khi thêm dữ liệu mẫu: {e}")
        if 'conn' in locals():
            conn.rollback()

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🔄 Bắt đầu thêm dữ liệu mẫu...")
    add_sample_employees()
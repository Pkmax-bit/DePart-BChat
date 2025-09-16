from supabase_client import supabase
import sys

def run_departments_sql():
    try:
        print("Đang chạy SQL script cho departments...")

        # Đọc và thực thi từng phần của SQL script
        sql_parts = [
            # Tạo bảng departments
            """
            CREATE TABLE IF NOT EXISTS public.departments (
                id SERIAL NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                manager_id INTEGER,
                is_active BOOLEAN NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
                CONSTRAINT departments_pkey PRIMARY KEY (id),
                CONSTRAINT departments_name_key UNIQUE (name)
            );
            """,

            # Thêm cột department_id vào employees
            """
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS department_id INTEGER;
            """,

            # Tạo bảng department_members
            """
            CREATE TABLE IF NOT EXISTS public.department_members (
                id SERIAL NOT NULL,
                department_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                role_in_department VARCHAR(50) DEFAULT 'member',
                joined_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
                CONSTRAINT department_members_pkey PRIMARY KEY (id),
                CONSTRAINT department_members_unique UNIQUE (department_id, user_id)
            );
            """,

            # Insert dữ liệu mẫu
            """
            INSERT INTO departments (name, description, is_active) VALUES
            ('Kỹ thuật', 'Phòng ban kỹ thuật và phát triển', true),
            ('Kinh doanh', 'Phòng ban kinh doanh và marketing', true),
            ('Nhân sự', 'Phòng ban nhân sự và hành chính', true),
            ('Tài chính', 'Phòng ban tài chính và kế toán', true)
            ON CONFLICT (name) DO NOTHING;
            """
        ]

        for i, sql in enumerate(sql_parts, 1):
            print(f"Thực thi phần {i}...")
            try:
                result = supabase.rpc('exec_sql', {'sql': sql})
                print(f"✓ Phần {i} thành công")
            except Exception as e:
                print(f"⚠ Phần {i} thất bại: {e}")

        print("Hoàn thành tạo departments!")

        # Kiểm tra kết quả
        print("\nKiểm tra dữ liệu departments:")
        result = supabase.table('departments').select('*').order('name').execute()

        for dept in result.data:
            print(f"- ID: {dept['id']}, Name: {dept['name']}, Active: {dept['is_active']}")

    except Exception as e:
        print(f"Lỗi: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_departments_sql()

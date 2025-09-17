import requests

# Test data for 3 employees
employees = [
    {
        "ma_nv": "NV_TEST_001",
        "ho_ten": "Nguyễn Văn A",
        "chuc_vu": "Nhân viên kinh doanh",
        "phong_ban": "Phòng kinh doanh",
        "luong_hop_dong": 10000000,
        "muc_luong_dong_bhxh": 10000000,
        "so_nguoi_phu_thuoc": 0,
        "email": "nguyenvana@test.com",
        "dien_thoai": "0123456789",
        "dia_chi": "123 Đường ABC, Quận 1, TP.HCM",
        "ngay_vao_lam": "2024-01-15"
    },
    {
        "ma_nv": "NV_TEST_002",
        "ho_ten": "Trần Thị B",
        "chuc_vu": "Nhân viên hành chính",
        "phong_ban": "Phòng hành chính",
        "luong_hop_dong": 8000000,
        "muc_luong_dong_bhxh": 8000000,
        "so_nguoi_phu_thuoc": 1,
        "email": "tranthib@test.com",
        "dien_thoai": "0987654321",
        "dia_chi": "456 Đường XYZ, Quận 2, TP.HCM",
        "ngay_vao_lam": "2024-02-01"
    },
    {
        "ma_nv": "NV_TEST_003",
        "ho_ten": "Lê Văn C",
        "chuc_vu": "Nhân viên kỹ thuật",
        "phong_ban": "Phòng kỹ thuật",
        "luong_hop_dong": 12000000,
        "muc_luong_dong_bhxh": 12000000,
        "so_nguoi_phu_thuoc": 2,
        "email": "levanc@test.com",
        "dien_thoai": "0111111111",
        "dia_chi": "789 Đường DEF, Quận 3, TP.HCM",
        "ngay_vao_lam": "2024-03-10"
    }
]

def test_create_employees():
    base_url = "http://localhost:8001/api/v1"

    print("Testing employee creation...")

    for i, employee in enumerate(employees, 1):
        try:
            print(f"\nCreating employee {i}: {employee['ho_ten']}")

            # Create employee
            response = requests.post(f"{base_url}/payroll/employees/", json=employee)

            if response.status_code == 200:
                print(f"✅ Employee {i} created successfully")
                print(f"   Response: {response.json()}")
            else:
                print(f"❌ Failed to create employee {i}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")

        except Exception as e:
            print(f"❌ Error creating employee {i}: {e}")

    # Verify employees were created
    print("\nVerifying created employees...")
    try:
        response = requests.get(f"{base_url}/payroll/employees/")
        if response.status_code == 200:
            all_employees = response.json()
            test_employees = [emp for emp in all_employees if emp['ma_nv'].startswith('NV_TEST_')]
            print(f"✅ Found {len(test_employees)} test employees in database")
            for emp in test_employees:
                print(f"   - {emp['ma_nv']}: {emp['ho_ten']}")
        else:
            print(f"❌ Failed to fetch employees: {response.status_code}")
    except Exception as e:
        print(f"❌ Error verifying employees: {e}")

if __name__ == "__main__":
    test_create_employees()
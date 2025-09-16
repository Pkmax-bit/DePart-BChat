#!/usr/bin/env python3
"""
Test script for the new unified employee creation API
"""
import requests
import json

def test_employee_creation():
    """Test creating an employee with user account"""

    # Test data
    employee_data = {
        "username": "testuser123",
        "password": "testpass123",
        "email": "testuser123@example.com",
        "full_name": "Nguyễn Văn Test",
        "phone": "0123456789",
        "role_id": 2,  # employee role
        "department_id": 1,  # assuming department exists
        "ma_nv": "NVTEST001",
        "chuc_vu": "Nhân viên thử nghiệm",
        "phong_ban": "Phòng IT",
        "luong_hop_dong": 15000000,
        "muc_luong_dong_bhxh": 14000000,
        "so_nguoi_phu_thuoc": 1,
        "dien_thoai": "0123456789",
        "dia_chi": "123 Đường Test, Quận 1, TP.HCM",
        "ngay_vao_lam": "2024-01-15"
    }

    try:
        print("Testing employee creation with unified API...")
        print(f"Data: {json.dumps(employee_data, indent=2, ensure_ascii=False)}")

        # Make the API call
        response = requests.post(
            "http://localhost:8001/api/v1/payroll/nhan-vien",
            json=employee_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"Response status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Employee created:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"❌ Exception: {str(e)}")

if __name__ == "__main__":
    test_employee_creation()
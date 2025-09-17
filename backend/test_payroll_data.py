#!/usr/bin/env python3
"""
Test script to verify payroll data and API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8001/api/v1/payroll"

def test_endpoint(name, url, expected_count=None):
    """Test an API endpoint and print results"""
    print(f"\n🧪 Testing {name}...")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else "N/A"
            print(f"✅ {name}: {count} records")
            if expected_count and count != expected_count:
                print(f"⚠️  Expected {expected_count}, got {count}")
            return data
        else:
            print(f"❌ {name}: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ {name}: Error - {str(e)}")
        return None

def main():
    print("🚀 Testing Payroll Management System")
    print("=" * 50)

    # Test employees
    employees = test_endpoint("Employees", f"{BASE_URL}/employees/", 4)

    # Test timesheets for current month
    timesheets = test_endpoint("Timesheets", f"{BASE_URL}/bang-cham-cong/?ky_tinh_luong=2025-09", 4)

    # Test product salary
    products = test_endpoint("Product Salary", f"{BASE_URL}/luong-san-pham", 4)

    # Test salary slips
    salary_slips = test_endpoint("Salary Slips", f"{BASE_URL}/phieu-luong?ky_tinh_luong=2025-09")

    print("\n" + "=" * 50)
    print("📊 Data Summary:")

    if employees:
        print(f"👥 Employees: {len(employees)}")
        for emp in employees[:2]:  # Show first 2
            print(f"   - {emp['ho_ten']} ({emp['ma_nv']}) - {emp['chuc_vu']}")

    if timesheets:
        print(f"📅 Timesheets: {len(timesheets)}")
        total_ot = sum(ts.get('gio_ot_ngay_thuong', 0) + ts.get('gio_ot_cuoi_tuan', 0) for ts in timesheets)
        print(f"   - Total OT hours: {total_ot}")

    if products:
        print(f"📦 Product Salary: {len(products)}")
        total_value = sum(p.get('thanh_tien', 0) for p in products)
        print(f"   - Total value: {total_value:,.0f} VND")

    print("\n🎯 Ready for frontend testing!")
    print("🌐 Frontend URL: http://localhost:3001/dashboard/payroll/salary")

if __name__ == "__main__":
    main()
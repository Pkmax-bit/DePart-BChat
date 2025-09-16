#!/usr/bin/env python3
"""
Script để test đăng nhập bằng email và mật khẩu
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

import requests

def test_login():
    """Test đăng nhập với các tài khoản sample"""
    try:
        # URL của API
        base_url = "http://localhost:8000"
        login_url = f"{base_url}/api/v1/users/auth/login"

        # Test cases
        test_cases = [
            {
                "email": "nguyenvana@company.com",
                "password": "123456",
                "expected_username": "nguyenvana"
            },
            {
                "email": "tranthib@company.com",
                "password": "123456",
                "expected_username": "tranthib"
            },
            {
                "email": "levanc@company.com",
                "password": "123456",
                "expected_username": "levanc"
            }
        ]

        print("🧪 TEST ĐĂNG NHẬP BẰNG EMAIL VÀ MẬT KHẨU")
        print("=" * 50)

        for i, test_case in enumerate(test_cases, 1):
            print(f"\n📧 Test {i}: {test_case['email']}")

            try:
                response = requests.post(login_url, json={
                    "email": test_case["email"],
                    "password": test_case["password"]
                })

                if response.status_code == 200:
                    data = response.json()
                    user = data.get("user", {})
                    username = user.get("username")

                    if username == test_case["expected_username"]:
                        print(f"✅ Đăng nhập thành công: {username}")
                    else:
                        print(f"❌ Username không khớp: expected={test_case['expected_username']}, got={username}")
                else:
                    print(f"❌ Lỗi HTTP {response.status_code}: {response.text}")

            except requests.exceptions.ConnectionError:
                print("❌ Không thể kết nối đến server. Hãy đảm bảo backend đang chạy.")
                break
            except Exception as e:
                print(f"❌ Lỗi: {str(e)}")

        print("\n" + "=" * 50)
        print("✅ Hoàn thành test đăng nhập!")

    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    test_login()
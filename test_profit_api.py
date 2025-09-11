#!/usr/bin/env python3
"""
Test API endpoint profit
"""
import requests
import json

def test_profit_api():
    """Test API endpoint profit"""
    url = 'http://localhost:8001/api/v1/accounting/profit/'

    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print('✅ API profit hoạt động thành công!')
            print(f'📊 Tổng doanh thu: {data["summary"]["total_revenue"]:,.0f} VND')
            print(f'💰 Tổng chi phí: {data["summary"]["total_expenses"]:,.0f} VND')
            print(f'🎯 Lợi nhuận: {data["summary"]["total_profit"]:,.0f} VND')
            print(f'📈 Tỷ suất: {data["summary"]["profit_margin"]:.2f}%')
            print(f'📄 Số hóa đơn: {data["summary"]["revenue_count"]}')
            print(f'📋 Số chi phí: {data["summary"]["expense_count"]}')

            # Hiển thị một số chi tiết
            print('\n📋 CHI TIẾT DOANH THU (5 khoản đầu):')
            for i, invoice in enumerate(data["details"]["revenue"][:5]):
                print(f'  {i+1}. {invoice["customer_name"]} - {invoice["total_amount"]:,.0f} VND')

            print('\n💰 CHI TIẾT CHI PHÍ (5 khoản đầu):')
            for i, expense in enumerate(data["details"]["expenses"][:5]):
                print(f'  {i+1}. {expense["mo_ta"]} - {expense["giathanh"]:,.0f} VND')

        else:
            print(f'❌ API lỗi: {response.status_code}')
            print(response.text)
    except requests.exceptions.ConnectionError:
        print('❌ Không thể kết nối đến server')
        print('💡 Vui lòng khởi động backend server: python backend/run_server.py')
    except Exception as e:
        print(f'❌ Lỗi: {e}')

if __name__ == "__main__":
    test_profit_api()

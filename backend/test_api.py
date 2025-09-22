import requests
import json

# Test API tạo invoice
url = 'http://localhost:8001/api/v1/quote/invoices_quote/'
data = {
    "customer_name": "Test Customer",
    "invoice_date": "2025-09-09T16:04:46",
    "ngan_sach_ke_hoach": 5400000,  # This will be calculated from items, not used from frontend
    "items": [{
        "id_nhom": "NHK",
        "id_kinh": "5LC",
        "id_taynam": "TNA",
        "id_bophan": "TL",
        "sanpham_id": "NHKTNA5LCTL",
        "ngang": 600,
        "cao": 700,
        "sau": 500,
        "so_luong": 1,
        "don_gia": 5400000,
        "dien_tich_ke_hoach": 210000,
        "dien_tich_thuc_te": 210000,
        "ti_le": 1.0,
        "thanh_tien": 5400000
    }]
}

try:
    response = requests.post(url, json=data)
    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.text}')

    if response.status_code == 200:
        print('✅ API hoạt động thành công!')
    else:
        print('❌ API vẫn có lỗi')

except Exception as e:
    print(f'Lỗi kết nối: {str(e)}')

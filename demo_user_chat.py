#!/usr/bin/env python3
"""
Demo script: Lấy tên người dùng từ email thông qua bảng user_chat
"""
import requests

def get_user_info_from_email(email):
    """
    Lấy thông tin user từ email thông qua bảng user_chat
    """
    try:
        # Tìm user_chat record theo email
        response = requests.get(f'http://localhost:8001/api/v1/user-chat/email/{email}')
        if response.status_code != 200:
            return {"error": f"Không tìm thấy user_chat cho email: {email}"}

        user_chat_records = response.json()
        if not user_chat_records:
            return {"error": f"Không có records nào cho email: {email}"}

        # Lấy record đầu tiên
        record = user_chat_records[0]
        user_id = record.get('user_id')

        if not user_id:
            return {"error": f"User chat record chưa có user_id cho email: {email}"}

        # Lấy thông tin user từ bảng users
        response = requests.get('http://localhost:8001/api/v1/users/')
        if response.status_code != 200:
            return {"error": "Không thể lấy danh sách users"}

        users_data = response.json()
        users = users_data.get('users', [])

        # Tìm user theo ID
        user = None
        for u in users:
            if u.get('id') == user_id:
                user = u
                break

        if not user:
            return {"error": f"Không tìm thấy user với ID: {user_id}"}

        return {
            "email": email,
            "user_id": user_id,
            "username": user.get('username'),
            "full_name": user.get('full_name'),
            "name_app": record.get('name_app'),
            "conversation_id": record.get('conversation_id')
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Test với email đã sync
    email = "test@example.com"
    result = get_user_info_from_email(email)

    if "error" in result:
        print("❌ Lỗi:", result["error"])
    else:
        print("✅ Thành công!")
        print(f"Email: {result['email']}")
        print(f"User ID: {result['user_id']}")
        print(f"Username: {result['username']}")
        print(f"Full Name: {result['full_name']}")
        print(f"Chat App: {result['name_app']}")
        print(f"Conversation: {result['conversation_id']}")

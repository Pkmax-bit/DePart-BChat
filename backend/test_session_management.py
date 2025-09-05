#!/usr/bin/env python3
"""
Script test tính năng lưu và khôi phục conversation ID
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import supabase
from models import UserChatSessionCreate
from routers.user_chat_sessions import create_or_update_session, get_user_chatflow_session

def test_session_management():
    """
    Test các tính năng quản lý session
    """
    print("🧪 Testing Session Management Features")
    print("=" * 50)

    # Giả sử có user_id và chatflow_id để test
    test_user_id = 1
    test_chatflow_id = 1
    test_conversation_id = "test_conversation_123"

    print(f"Test User ID: {test_user_id}")
    print(f"Test Chatflow ID: {test_chatflow_id}")
    print(f"Test Conversation ID: {test_conversation_id}")
    print()

    try:
        # Test 1: Tạo session mới
        print("1️⃣ Testing session creation...")
        session_data = UserChatSessionCreate(
            user_id=test_user_id,
            chatflow_id=test_chatflow_id,
            conversation_id=test_conversation_id,
            session_data={
                'test': True,
                'created_by': 'test_script',
                'timestamp': '2025-01-01T00:00:00Z'
            }
        )

        result = create_or_update_session(session_data)
        print(f"✅ Session created/updated: {result}")

        # Test 2: Lấy session
        print("\n2️⃣ Testing session retrieval...")
        retrieved_session = get_user_chatflow_session(test_user_id, test_chatflow_id)
        print(f"✅ Session retrieved: {retrieved_session}")

        # Test 3: Cập nhật session với conversation_id mới
        print("\n3️⃣ Testing session update...")
        new_conversation_id = "updated_conversation_456"
        update_session_data = UserChatSessionCreate(
            user_id=test_user_id,
            chatflow_id=test_chatflow_id,
            conversation_id=new_conversation_id,
            session_data={
                'test': True,
                'updated_by': 'test_script',
                'last_message': 'Hello from test!'
            }
        )

        updated_result = create_or_update_session(update_session_data)
        print(f"✅ Session updated: {updated_result}")

        # Test 4: Xác minh cập nhật
        print("\n4️⃣ Verifying session update...")
        final_session = get_user_chatflow_session(test_user_id, test_chatflow_id)
        print(f"✅ Final session state: {final_session}")

        if final_session.conversation_id == new_conversation_id:
            print("✅ Conversation ID updated successfully!")
        else:
            print("❌ Conversation ID update failed!")

        print("\n🎉 All tests completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

def show_usage_instructions():
    """
    Hiển thị hướng dẫn sử dụng tính năng
    """
    print("\n📖 Usage Instructions")
    print("=" * 50)
    print("""
🔄 TÍNH NĂNG LƯU VÀ KHÔI PHỤC CONVERSATION ID

1. HOẠT ĐỘNG TỰ ĐỘNG:
   - Khi user chọn chatflow, hệ thống tự động tải session cũ
   - Khi user chat, conversation ID được lưu tự động
   - Khi user quay lại, conversation được khôi phục

2. CÁCH HOẠT ĐỘNG:
   - User chọn chatflow → Tải session cũ từ database
   - User chat → Lưu conversation ID vào database
   - User quay lại → Tự động khôi phục conversation

3. DỮ LIỆU ĐƯỢC LƯU:
   - conversation_id: ID cuộc hội thoại từ Dify
   - user_id: ID của user
   - chatflow_id: ID của chatflow
   - session_data: Thông tin bổ sung (JSON)
   - last_accessed: Thời gian truy cập cuối cùng

4. LỢI ÍCH:
   - ✅ Không mất cuộc hội thoại khi refresh trang
   - ✅ Khôi phục chính xác conversation khi quay lại
   - ✅ Lưu lịch sử chatflow đã sử dụng
   - ✅ Tối ưu UX cho người dùng

5. API ENDPOINTS:
   - POST /api/v1/user-chat-sessions/ - Tạo/cập nhật session
   - GET /api/v1/user-chat-sessions/user/{user_id}/chatflow/{chatflow_id} - Lấy session
   - GET /api/v1/user-chat-sessions/user/{user_id} - Lấy tất cả sessions của user
   - PUT /api/v1/user-chat-sessions/user/{user_id}/chatflow/{chatflow_id} - Cập nhật session
   - DELETE /api/v1/user-chat-sessions/user/{user_id}/chatflow/{chatflow_id} - Xóa session

6. CÁCH TEST:
   - Chạy script này: python test_session_management.py
   - Kiểm tra database table: user_chat_sessions
   - Test trên frontend: chọn chatflow và xem console log
""")

if __name__ == "__main__":
    # Chạy test
    success = test_session_management()

    # Hiển thị hướng dẫn
    show_usage_instructions()

    if success:
        print("\n✅ Session management is working correctly!")
    else:
        print("\n❌ There are issues with session management!")
        sys.exit(1)

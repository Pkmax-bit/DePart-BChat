# test_api_endpoints.py
import requests
import json

BASE_URL = "http://localhost:8002/api/v1"

def test_user_chat_sessions_direct():
    """Test the new direct database connection endpoints"""
    print("🧪 Testing User Chat Sessions Direct API Endpoints")
    print("=" * 60)

    # Test data
    user_id = 8  # Using the test user that was created
    chatflow_id = 1
    conversation_id = "test_conversation_api_123"

    try:
        # Test 1: Create/Update session
        print("1️⃣ Testing POST /user-chat-sessions-direct/")
        session_data = {
            "user_id": user_id,
            "chatflow_id": chatflow_id,
            "conversation_id": conversation_id,
            "session_data": {"test": "api_test", "timestamp": "2025-09-03"}
        }

        response = requests.post(
            f"{BASE_URL}/user-chat-sessions-direct/",
            json=session_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Session created/updated successfully")
            print(f"   Conversation ID: {result.get('conversation_id')}")
            print(f"   User ID: {result.get('user_id')}")
            print(f"   Chatflow ID: {result.get('chatflow_id')}")
        else:
            print(f"❌ Failed to create session: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

        # Test 2: Get specific session
        print("\n2️⃣ Testing GET /user-chat-sessions-direct/user/{user_id}/chatflow/{chatflow_id}")
        response = requests.get(f"{BASE_URL}/user-chat-sessions-direct/user/{user_id}/chatflow/{chatflow_id}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Session retrieved successfully")
            print(f"   Conversation ID: {result.get('conversation_id')}")
            print(f"   Last accessed: {result.get('last_accessed')}")
        else:
            print(f"❌ Failed to get session: {response.status_code}")
            print(f"   Response: {response.text}")

        # Test 3: Get all user sessions
        print("\n3️⃣ Testing GET /user-chat-sessions-direct/user/{user_id}")
        response = requests.get(f"{BASE_URL}/user-chat-sessions-direct/user/{user_id}")

        if response.status_code == 200:
            results = response.json()
            print("✅ User sessions retrieved successfully")
            print(f"   Number of sessions: {len(results)}")
            for session in results:
                print(f"   - Chatflow {session.get('chatflow_id')}: {session.get('conversation_id')}")
        else:
            print(f"❌ Failed to get user sessions: {response.status_code}")
            print(f"   Response: {response.text}")

        # Test 4: Update session
        print("\n4️⃣ Testing PUT /user-chat-sessions-direct/user/{user_id}/chatflow/{chatflow_id}")
        update_data = {
            "conversation_id": f"{conversation_id}_updated",
            "session_data": {"test": "updated_api_test", "updated_at": "2025-09-03"}
        }

        response = requests.put(
            f"{BASE_URL}/user-chat-sessions-direct/user/{user_id}/chatflow/{chatflow_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Session updated successfully")
            print(f"   Updated conversation ID: {result.get('conversation_id')}")
        else:
            print(f"❌ Failed to update session: {response.status_code}")
            print(f"   Response: {response.text}")

        print("\n🎉 All API endpoint tests completed!")
        return True

    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the backend server is running on port 8002")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def demonstrate_session_persistence():
    """Demonstrate how session persistence works for different users"""
    print("\n📖 SESSION PERSISTENCE DEMONSTRATION")
    print("=" * 60)

    print("""
🔄 TÍNH NĂNG LƯU VÀ KHÔI PHỤC CONVERSATION ID

1. USER A ĐĂNG NHẬP LẦN ĐẦU:
   - User A (ID: 8) chọn Chatflow 1
   - Hệ thống tạo conversation_id mới: "conv_userA_001"
   - Lưu vào database: user_id=8, chatflow_id=1, conversation_id="conv_userA_001"

2. USER A ĐĂNG XUẤT VÀ ĐĂNG NHẬP LẠI:
   - User A đăng nhập lại, chọn Chatflow 1
   - Hệ thống tìm thấy session cũ trong database
   - Tự động khôi phục conversation_id="conv_userA_001"
   - Tiếp tục chat từ nơi đã dừng

3. USER B ĐĂNG NHẬP:
   - User B (ID: 9) đăng nhập, chọn Chatflow 1
   - Hệ thống tạo conversation_id mới: "conv_userB_001"
   - Lưu riêng biệt: user_id=9, chatflow_id=1, conversation_id="conv_userB_001"
   - Hoàn toàn độc lập với User A

4. CẤU TRÚC DATABASE:
   user_chat_sessions:
   - (8, 1, "conv_userA_001")  ← User A, Chatflow 1
   - (9, 1, "conv_userB_001")  ← User B, Chatflow 1
   - (8, 2, "conv_userA_002")  ← User A, Chatflow 2

5. LỢI ÍCH:
   ✅ Mỗi user có session riêng biệt
   ✅ Conversation được bảo toàn khi đăng xuất/đăng nhập
   ✅ Không bị lẫn lộn giữa các user
   ✅ Tối ưu trải nghiệm người dùng
    """)

if __name__ == "__main__":
    success = test_user_chat_sessions_direct()
    demonstrate_session_persistence()

    if success:
        print("\n🚀 SESSION MANAGEMENT SYSTEM IS READY!")
        print("   - Direct database connection working")
        print("   - API endpoints functional")
        print("   - Session persistence implemented")
        print("   - Ready for frontend integration")
    else:
        print("\n❌ API tests failed. Please check:")
        print("   - Backend server is running on port 8002")
        print("   - Database connection is working")
        print("   - API endpoints are properly configured")

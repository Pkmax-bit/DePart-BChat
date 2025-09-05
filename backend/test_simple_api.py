# test_simple_api.py
import requests
import json

BASE_URL = "http://localhost:8001/api/v1"

def test_simple_endpoint():
    """Test a simple endpoint to check if server is working"""
    print("🧪 Testing Simple API Endpoint")
    print("=" * 40)

    try:
        # Test root endpoint
        response = requests.get(f"{BASE_URL}/../")
        print(f"Root endpoint status: {response.status_code}")

        # Test user-chat-sessions-direct endpoint
        session_data = {
            "user_id": 8,
            "chatflow_id": 1,
            "conversation_id": "test_simple_123",
            "session_data": {"test": "simple"}
        }

        response = requests.post(
            f"{BASE_URL}/user-chat-sessions-direct/",
            json=session_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"Direct API status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✅ API working successfully!")
            print(f"   Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ API failed: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the backend server is running on port 8001")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = test_simple_endpoint()
    if success:
        print("\n🎉 SESSION MANAGEMENT API IS WORKING!")
    else:
        print("\n❌ API test failed.")

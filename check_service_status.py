import requests
import subprocess
import sys

def check_service_status():
    """Kiểm tra trạng thái của instant sync service"""

    print("🔍 Checking Instant Email Sync Service Status...")
    print()

    # Check API health
    try:
        response = requests.get("http://localhost:8001/api/v1/chat-history/", params={"limit": 1})
        if response.status_code == 200:
            print("✅ API is running")
        else:
            print("❌ API is not responding")
            return
    except:
        print("❌ Cannot connect to API")
        return

    # Check if python process is running
    try:
        # Check for python processes
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], capture_output=True, text=True)
        if 'python.exe' in result.stdout and 'instant_email_sync.py' in result.stdout:
            print("✅ Instant Email Sync Service is running")
        else:
            print("❌ Instant Email Sync Service is NOT running")
            print()
            print("💡 To start the service:")
            print("   Option 1: python scripts/instant_email_sync.py")
            print("   Option 2: Double-click start_instant_sync.bat")
    except:
        print("⚠️  Cannot check running processes")

    print()
    print("📊 Recent Activity:")
    try:
        # Check recent chat_history records
        response = requests.get("http://localhost:8001/api/v1/chat-history/", params={"limit": 5})
        if response.status_code == 200:
            records = response.json()
            print(f"   Latest {len(records)} chat_history records:")
            for record in records:
                email = record.get('Email', 'No email')
                log_id = record.get('log_id', 'Unknown')
                user_id = record.get('user_id', 'Not synced')
                print(f"   - ID {log_id}: Email='{email}', User_ID={user_id}")
    except Exception as e:
        print(f"   Error checking recent records: {e}")

if __name__ == "__main__":
    check_service_status()

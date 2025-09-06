import requests
import subprocess
import os

def check_api_status():
    try:
        response = requests.get("http://localhost:8001/api/v1/chat-history/", timeout=5)
        if response.status_code == 200:
            print("✅ API is running and accessible.")
            return True
        else:
            print(f"❌ API returned status code {response.status_code}.")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API is not accessible: {e}")
        return False

def check_instant_sync_service():
    # Check if instant_email_sync.py is running using tasklist
    try:
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe', '/FO', 'CSV'], capture_output=True, text=True)
        if 'python.exe' in result.stdout:
            # More detailed check for the specific script
            result2 = subprocess.run(['tasklist', '/V', '/FI', 'IMAGENAME eq python.exe'], capture_output=True, text=True)
            if 'instant_email_sync.py' in result2.stdout:
                print("✅ Instant sync service is running.")
                return True
    except Exception as e:
        print(f"Error checking process: {e}")
    print("❌ Instant sync service is not running.")
    return False

if __name__ == "__main__":
    print("Checking service status...")
    api_ok = check_api_status()
    sync_ok = check_instant_sync_service()
    if api_ok and sync_ok:
        print("\n🎉 All services are running correctly.")
    else:
        print("\n⚠️  Some services are not running. Please start them if needed.")

import requests
import time
import threading

def auto_trigger_sync_service():
    """Service tự động trigger sync mỗi khi có dữ liệu mới"""

    print("=== AUTO TRIGGER SYNC SERVICE ===")
    print("Service sẽ tự động trigger _auto_sync_email_to_user_chat() mỗi 30 giây")

    api_base_url = "http://localhost:8001"

    while True:
        try:
            # Gọi endpoint để trigger auto sync
            response = requests.post(f"{api_base_url}/api/v1/chat-history/trigger-auto-sync")

            if response.status_code == 200:
                result = response.json()
                synced_count = result.get('synced_records', 0)
                if synced_count > 0:
                    print(f"✅ Auto sync: {synced_count} records synced")
                else:
                    print("ℹ️  No new records to sync")
            else:
                print(f"❌ Auto sync failed: {response.status_code}")

        except Exception as e:
            print(f"❌ Auto sync error: {e}")

        # Chờ 30 giây trước khi check lại
        time.sleep(30)

def start_auto_trigger_service():
    """Khởi động service trong background thread"""
    service_thread = threading.Thread(target=auto_trigger_sync_service, daemon=True)
    service_thread.start()
    print("Auto trigger sync service started in background")

if __name__ == "__main__":
    # Chạy service ngay lập tức
    auto_trigger_sync_service()

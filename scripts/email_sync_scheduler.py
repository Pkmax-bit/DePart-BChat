import requests
import time
import threading

def sync_pending_emails():
    """Cron job để sync email định kỳ"""
    try:
        print("Running scheduled email sync...")
        response = requests.post('http://localhost:8001/api/v1/chat-history/check-and-sync-email')
        if response.status_code == 200:
            result = response.json()
            print(f"Scheduled sync completed: {result}")
        else:
            print(f"Scheduled sync failed: {response.status_code}")
    except Exception as e:
        print(f"Scheduled sync error: {e}")

def start_scheduler():
    """Khởi động scheduler để chạy sync định kỳ"""
    while True:
        sync_pending_emails()
        time.sleep(300)  # Chạy mỗi 5 phút

if __name__ == "__main__":
    print("Starting email sync scheduler...")
    # Chạy sync ngay lập tức
    sync_pending_emails()

    # Khởi động scheduler trong background thread
    scheduler_thread = threading.Thread(target=start_scheduler, daemon=True)
    scheduler_thread.start()

    print("Scheduler started. Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping scheduler...")

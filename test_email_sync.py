#!/usr/bin/env python3
"""
Test script để tạo record chat_history và xem email sync service hoạt động
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.supabase_client import supabase
import time

def test_email_sync():
    """Test email sync service"""

    print("🧪 Testing Email Sync Service...")

    # Tạo record test
    test_data = {
        'name_app': 'Test Email Sync',
        'conversation_id': f'test-sync-{int(time.time())}',
        'input_text': 'Test message with email for sync',
        'output_text': 'Test response',
        'email': 'phannguyendangkhoa0915@gmail.com'  # Email có sẵn trong users
    }

    print(f"📝 Creating chat_history record with email: {test_data['email']}")

    try:
        # Insert vào chat_history
        result = supabase.table('chat_history').insert(test_data).execute()

        if result.data:
            record = result.data[0]
            log_id = record.get('log_id')
            print(f"✅ Created chat_history record: ID {log_id}")

            # Đợi 5 giây để service sync
            print("⏳ Waiting for email sync service to process...")
            time.sleep(5)

            # Kiểm tra lại record
            updated_result = supabase.table('chat_history').select('*').eq('log_id', log_id).execute()

            if updated_result.data:
                updated_record = updated_result.data[0]
                user_id = updated_record.get('user_id')

                if user_id:
                    print(f"✅ SUCCESS: Email synced! UserID updated to {user_id}")

                    # Kiểm tra user_chat
                    user_chat_result = supabase.table('user_chat').select('*').eq('email', test_data['email']).eq('conversation_id', test_data['conversation_id']).execute()

                    if user_chat_result.data:
                        print("✅ User_chat record created successfully!")
                    else:
                        print("❌ User_chat record not found")

                else:
                    print("❌ FAILED: UserID still None - sync did not work")

            # Cleanup
            print("\n🧹 Cleaning up test data...")
            supabase.table('chat_history').delete().eq('log_id', log_id).execute()
            supabase.table('user_chat').delete().eq('email', test_data['email']).eq('conversation_id', test_data['conversation_id']).execute()
            print("✅ Test data cleaned up")

        else:
            print("❌ Failed to create chat_history record")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_email_sync()

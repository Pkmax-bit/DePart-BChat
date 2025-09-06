import requests
import json
import asyncio
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-supabase-url")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "your-supabase-anon-key")

class RealTimeEmailSync:
    """Real-time email sync service using Supabase Realtime"""

    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.api_base_url = "http://localhost:8001"

    async def listen_for_chat_history_changes(self):
        """Listen for real-time changes in chat_history table"""

        def handle_insert(payload):
            """Handle INSERT events"""
            print("🎯 New record inserted into chat_history!")

            # Get the new record
            new_record = payload.get('new', {})
            print(f"New record: {json.dumps(new_record, indent=2)}")

            # Check if record has email
            if new_record.get('Email') and new_record.get('Email').strip():
                print(f"📧 Record has email: {new_record.get('Email')}")
                self.trigger_sync_for_record(new_record)
            else:
                print("ℹ️  Record does not have email, skipping sync")

        def handle_update(payload):
            """Handle UPDATE events"""
            print("🔄 Record updated in chat_history")

            # Get the updated record
            updated_record = payload.get('new', {})
            old_record = payload.get('old', {})

            # Check if Email column was added/updated
            if (updated_record.get('Email') and
                updated_record.get('Email').strip() and
                updated_record.get('Email') != old_record.get('Email')):

                print(f"📧 Email updated: {updated_record.get('Email')}")
                self.trigger_sync_for_record(updated_record)

        print("🔄 Starting real-time listener for chat_history table...")

        # Subscribe to INSERT events
        self.supabase.table('chat_history').on('INSERT', handle_insert).subscribe()

        # Subscribe to UPDATE events (in case email is added later)
        self.supabase.table('chat_history').on('UPDATE', handle_update).subscribe()

        print("✅ Real-time listener started successfully!")
        print("🎧 Listening for new chat_history records with email...")

        # Keep the connection alive
        while True:
            await asyncio.sleep(1)

    def trigger_sync_for_record(self, record):
        """Trigger sync for a specific record"""
        try:
            print(f"🚀 Triggering sync for record ID: {record.get('log_id')}")

            # Call the auto sync function via API
            response = requests.post(
                f"{self.api_base_url}/api/v1/chat-history/trigger-auto-sync",
                json={"record": record}
            )

            if response.status_code == 200:
                result = response.json()
                print(f"✅ Sync successful: {result}")
            else:
                print(f"❌ Sync failed: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"❌ Error triggering sync: {e}")

async def main():
    """Main function to start the real-time sync service"""

    print("=== REAL-TIME EMAIL SYNC SERVICE ===")
    print("This service will trigger _auto_sync_email_to_user_chat() immediately")
    print("when new data is inserted into chat_history table with email")
    print()

    # Initialize the service
    sync_service = RealTimeEmailSync()

    try:
        # Start listening for changes
        await sync_service.listen_for_chat_history_changes()

    except KeyboardInterrupt:
        print("\n🛑 Stopping real-time sync service...")
    except Exception as e:
        print(f"❌ Error in real-time sync service: {e}")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())

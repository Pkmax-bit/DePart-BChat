# Dify API Service
import requests
import os
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

class DifyAPIService:
    def __init__(self):
        self.api_base_url = os.getenv('DIFY_API_BASE_URL', 'https://api.dify.ai/v1')
        self.api_key = os.getenv('DIFY_API_KEY', '')

    def get_conversation_messages(self, conversation_id: str, user: str, first_id: Optional[str] = None, limit: int = 20) -> Dict:
        """
        Get conversation messages from Dify API
        """
        url = f"{self.api_base_url}/messages"

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        params = {
            'conversation_id': conversation_id,
            'user': user,
            'limit': limit
        }

        if first_id:
            params['first_id'] = first_id

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Dify messages: {e}")
            return None

    def get_user_conversations(self, user: str, first: Optional[int] = None, limit: int = 20) -> Dict:
        """
        Get user's conversations from Dify API
        """
        url = f"{self.api_base_url}/conversations"

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        params = {
            'user': user,
            'limit': limit
        }

        if first:
            params['first'] = first

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching Dify conversations: {e}")
            return None

    def get_conversation_id_from_url(self, iframe_url: str) -> Optional[str]:
        """
        Extract conversation_id from Dify iframe URL
        """
        try:
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(iframe_url)
            query_params = parse_qs(parsed_url.query)

            # Check for conversationId parameter
            if 'conversationId' in query_params:
                return query_params['conversationId'][0]

            # Alternative parameter names
            for param in ['conversation_id', 'cid', 'c']:
                if param in query_params:
                    return query_params[param][0]

        except Exception as e:
            print(f"Error extracting conversation_id from URL: {e}")

        return None

    def sync_messages_to_database(self, conversation_id: str, user_id: int, chatflow_name: str):
        """
        Sync messages from Dify to our database
        """
        try:
            # Get user info for API call
            from supabase_client import supabase
            user_result = supabase.table('employees').select('username').eq('id', user_id).execute()

            if not user_result.data:
                print(f"User {user_id} not found")
                return False

            username = user_result.data[0]['username']

            # Fetch messages from Dify
            messages_data = self.get_conversation_messages(conversation_id, username)

            if not messages_data or 'data' not in messages_data:
                print("No messages data from Dify")
                return False

            # Sync each message to our database
            for message in messages_data['data']:
                # Check if message already exists
                existing = supabase.table('chat_history').select('id').eq('conversation_id', conversation_id).eq('created_at', message['created_at']).execute()

                if not existing.data:
                    # Create new chat history record
                    chat_data = {
                        'name_app': chatflow_name,
                        'conversation_id': conversation_id,
                        'user_id': user_id,
                        'user_message': message.get('query', ''),
                        'bot_response': message.get('answer', ''),
                        'created_at': datetime.fromtimestamp(message['created_at']).isoformat()
                    }

                    supabase.table('chat_history').insert(chat_data).execute()
                    print(f"Synced message: {message['id']}")

            return True

        except Exception as e:
            print(f"Error syncing messages to database: {e}")
            return False

    def get_or_create_conversation_id(self, user_id: int, chatflow_id: int) -> Optional[str]:
        """
        Get existing conversation_id from database or create new one from Dify
        """
        try:
            # Get user info
            from supabase_client import supabase
            user_result = supabase.table('employees').select('username, email').eq('id', user_id).execute()

            if not user_result.data:
                print(f"User {user_id} not found")
                return None

            user = user_result.data[0]
            username = user['username']
            email = user['email']

            # Try to get from database first
            session_result = supabase.table('user_chat_sessions').select('conversation_id').eq('user_id', user_id).eq('chatflow_id', chatflow_id).execute()

            if session_result.data and session_result.data[0].get('conversation_id'):
                return session_result.data[0]['conversation_id']

            # If not found in database, get from Dify API
            conversations_data = self.get_user_conversations(username)

            if conversations_data and 'data' in conversations_data:
                # Find the most recent conversation for this chatflow
                for conv in conversations_data['data']:
                    # You might need to match by chatflow name or other criteria
                    # For now, return the most recent conversation
                    if conv.get('id'):
                        return conv['id']

            # If no conversation found, we could create a new one
            # But Dify typically creates conversations when user starts chatting
            print(f"No existing conversation found for user {user_id}, chatflow {chatflow_id}")
            return None

        except Exception as e:
            print(f"Error getting conversation_id: {e}")
            return None

# Global instance
dify_service = DifyAPIService()

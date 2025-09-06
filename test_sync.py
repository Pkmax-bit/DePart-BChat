import requests
import json

# Tạo chat history record với email
chat_data = {
    'input_text': '{"Email":"test@example.com"}',
    'output_text': 'Hello! How can I help you?',
    'conversation_id': 'test_conv_123',
    'name_app': 'Test bot'  # Sử dụng chatflow có sẵn
}

try:
    response = requests.post('http://localhost:8001/api/v1/chat-history/',
                           json=chat_data,
                           headers={'Content-Type': 'application/json'})
    print('Create chat history status:', response.status_code)
    print('Response:', response.text)
except Exception as e:
    print('Error:', e)

# Test sync endpoint
try:
    response = requests.post('http://localhost:8001/api/v1/chat-history/sync-email-to-user-chat')
    print('Sync status:', response.status_code)
    print('Sync response:', response.text)
except Exception as e:
    print('Sync error:', e)

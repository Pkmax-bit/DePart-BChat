# supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load file .env từ thư mục hiện tại
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

if not url:
    raise ValueError("SUPABASE_URL environment variable is not set")
if not key:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is not set")

# Khởi tạo client với service_role key
supabase: Client = create_client(url, key)
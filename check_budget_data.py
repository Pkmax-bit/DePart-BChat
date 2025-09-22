import os
import sys
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)
from supabase_client import supabase

result = supabase.table('cong_trinh').select('id, name_congtrinh, ngan_sach_ke_hoach').limit(5).execute()
print('Sample data:')
for p in result.data:
    budget = p.get('ngan_sach_ke_hoach', 0) or 0
    print(f'{p["id"]}: {p["name_congtrinh"]} - {budget:,.0f} VND')
import os
from supabase_client import supabase

# Read the SQL file
with open('create_accounting_tables.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Split SQL commands and execute them
commands = sql_content.split(';')
for command in commands:
    command = command.strip()
    if command and not command.startswith('--'):
        try:
            result = supabase.rpc('exec_sql', {'sql': command + ';'})
            print(f'Executed: {command[:50]}...')
        except Exception as e:
            print(f'Error executing command: {str(e)}')

print('Database setup completed!')

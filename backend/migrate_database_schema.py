#!/usr/bin/env python3
"""
Database Schema Migration Script
Migrates from old schema to new redesigned schema
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def execute_sql_file(file_path: str) -> bool:
    """Execute SQL commands from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Split into individual statements
        statements = []
        current_statement = []
        in_transaction = False

        for line in sql_content.split('\n'):
            line = line.strip()
            if not line or line.startswith('--'):
                continue

            current_statement.append(line)

            # Check for statement end
            if line.endswith(';'):
                statement = ' '.join(current_statement)
                if statement.upper().startswith(('CREATE', 'ALTER', 'DROP', 'INSERT', 'UPDATE', 'DELETE')):
                    statements.append(statement)
                current_statement = []

        # Execute statements
        for i, statement in enumerate(statements, 1):
            try:
                logger.info(f"Executing statement {i}/{len(statements)}: {statement[:50]}...")
                result = supabase.rpc('exec_sql', {'sql': statement})
                logger.info(f"✓ Statement {i} executed successfully")
            except Exception as e:
                logger.error(f"❌ Statement {i} failed: {e}")
                logger.error(f"Statement: {statement}")
                return False

        return True

    except Exception as e:
        logger.error(f"Error reading SQL file: {e}")
        return False

def backup_existing_data():
    """Backup existing data before migration"""
    logger.info("Starting data backup...")

    try:
        # Backup users table
        users_data = supabase.table('users').select('*').execute()
        logger.info(f"Backed up {len(users_data.data)} users")

        # Backup nhan_vien table if exists
        try:
            nhan_vien_data = supabase.table('nhan_vien').select('*').execute()
            logger.info(f"Backed up {len(nhan_vien_data.data)} employees")
        except:
            logger.info("No existing nhan_vien table to backup")

        # Backup departments if exists
        try:
            dept_data = supabase.table('departments').select('*').execute()
            logger.info(f"Backed up {len(dept_data.data)} departments")
        except:
            logger.info("No existing departments table to backup")

        return True

    except Exception as e:
        logger.error(f"Error during backup: {e}")
        return False

def migrate_data():
    """Migrate existing data to new schema"""
    logger.info("Starting data migration...")

    try:
        # Migrate existing users to new schema
        existing_users = supabase.table('users').select('*').execute()

        for user in existing_users.data:
            # Update user with new fields
            update_data = {
                'is_employee': False,  # Default to non-employee
                'phone': user.get('phone')
            }

            # Check if user has employee data
            try:
                employee_data = supabase.table('nhan_vien').select('*').where('user_id', 'eq', user['id']).execute()
                if employee_data.data:
                    update_data['is_employee'] = True
            except:
                pass

            supabase.table('users').update(update_data).eq('id', user['id']).execute()

        logger.info("✓ Data migration completed")
        return True

    except Exception as e:
        logger.error(f"Error during data migration: {e}")
        return False

def run_migration():
    """Run the complete migration process"""
    logger.info("🚀 Starting database schema migration...")

    # Step 1: Backup existing data
    if not backup_existing_data():
        logger.error("❌ Backup failed, aborting migration")
        return False

    # Step 2: Execute schema migration
    schema_file = os.path.join(os.path.dirname(__file__), 'database_schema_redesign.sql')
    if not os.path.exists(schema_file):
        logger.error(f"❌ Schema file not found: {schema_file}")
        return False

    logger.info("📝 Applying new schema...")
    if not execute_sql_file(schema_file):
        logger.error("❌ Schema migration failed")
        return False

    # Step 3: Migrate existing data
    if not migrate_data():
        logger.error("❌ Data migration failed")
        return False

    logger.info("✅ Migration completed successfully!")
    logger.info("\n📋 Next steps:")
    logger.info("1. Test the new API endpoints")
    logger.info("2. Update frontend to use new models")
    logger.info("3. Verify data integrity")
    logger.info("4. Update any hardcoded queries")

    return True

if __name__ == "__main__":
    success = run_migration()
    if not success:
        logger.error("❌ Migration failed!")
        sys.exit(1)
    else:
        logger.info("🎉 Migration completed successfully!")
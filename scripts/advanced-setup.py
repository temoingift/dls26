#!/usr/bin/env python3
"""
Advanced Supabase Setup Script
Uses direct PostgreSQL connection when available
Falls back to SQL export for manual execution
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import subprocess
import json

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_PROJECT_ID = os.getenv('SUPABASE_PROJECT_ID')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', os.getenv('SUPABASE_DB_PASSWORD'))

def attempt_psql_connection():
    """Try to connect via psql if password is available"""
    if not POSTGRES_PASSWORD:
        return False
    
    db_host = f"db.{SUPABASE_PROJECT_ID}.supabase.co"
    
    try:
        # Test connection
        result = subprocess.run(
            [
                'psql',
                '-h', db_host,
                '-U', 'postgres',
                '-d', 'postgres',
                '-c', 'SELECT 1'
            ],
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD},
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print("✅ Successfully connected to PostgreSQL")
            return True
    except FileNotFoundError:
        print("⚠️  psql not found in PATH")
    except Exception as e:
        print(f"⚠️  Connection failed: {e}")
    
    return False

def execute_sql_via_psql(sql_file: Path):
    """Execute SQL file via psql"""
    if not POSTGRES_PASSWORD:
        return False
    
    db_host = f"db.{SUPABASE_PROJECT_ID}.supabase.co"
    
    try:
        print(f"Executing {sql_file.name}...")
        result = subprocess.run(
            [
                'psql',
                '-h', db_host,
                '-U', 'postgres',
                '-d', 'postgres',
                '-f', str(sql_file)
            ],
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD},
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print(f"✅ {sql_file.name}")
            return True
        else:
            print(f"⚠️  Error in {sql_file.name}")
            if result.stderr:
                print(f"   {result.stderr[:100]}")
            return False
            
    except Exception as e:
        print(f"⚠️  Failed to execute: {e}")
        return False

def create_manual_copy_paste_guide():
    """Create a guide for manual SQL execution"""
    combined_sql = Path(__file__).parent.parent / 'supabase' / 'combined-migrations.sql'
    
    if not combined_sql.exists():
        return
    
    guide_content = """
# 🚀 Manual Supabase Setup Guide

## Step 1: Get Your Service Role Key
1. Go to https://supabase.com/dashboard/project/{PROJECT_ID}/settings/api
2. Copy the **Service Role** key (NOT the anon key)
3. Add to .env file:
   SUPABASE_SERVICE_ROLE_KEY=your_key_here

## Step 2: Apply Database Migrations
1. Go to https://supabase.com/dashboard/project/{PROJECT_ID}/sql/new
2. Copy the content from: supabase/combined-migrations.sql
3. Paste it into the SQL editor
4. Click "Run" or press Ctrl+Enter
5. Wait for all queries to complete (green checkmarks)

## Step 3: Create Storage Buckets
1. Go to https://supabase.com/dashboard/project/{PROJECT_ID}/storage/buckets
2. Click "New Bucket"
3. Create these buckets:
   
   **Bucket 1:**
   - Name: match-recordings
   - Public: OFF (Private)
   - File size limit: 50 MB
   
   **Bucket 2:**
   - Name: avatars  
   - Public: ON
   - File size limit: 5 MB
   
   **Bucket 3:**
   - Name: tournament-covers
   - Public: ON
   - File size limit: 10 MB

## Step 4: Verify Setup
Run this command to verify:
```bash
npm run dev
```

If you see "Connected to Supabase", you're ready to deploy!

## Alternative: Using CLI with Service Role Key

Once you have the service role key, run:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"
supabase link --project-ref {PROJECT_ID}
supabase db push
```

## Troubleshooting

**Error: "Could not find the table"**
- Make sure you're running migrations in order
- All migrations must complete before testing

**Error: "Permission denied"**
- You need the Service Role key, not the anon key
- Check Settings → API for the correct key

**Storage buckets not appearing**
- Refresh the page
- Check Storage tab in Supabase Dashboard
- Make sure you created them with correct names

## Need Help?
- Docs: https://supabase.com/docs
- SQL Guide: https://supabase.com/docs/reference/sql
- Storage: https://supabase.com/docs/guides/storage
""".format(PROJECT_ID=SUPABASE_PROJECT_ID)
    
    guide_path = Path(__file__).parent.parent / 'MANUAL_SETUP.md'
    with open(guide_path, 'w', encoding='utf-8') as f:
        f.write(guide_content)
    
    print(f"📋 Created manual setup guide: {guide_path}")

def main():
    print("🚀 DLS 2026 Hub - Advanced Supabase Setup")
    print("=" * 60)
    
    if not SUPABASE_PROJECT_ID:
        print("❌ Missing SUPABASE_PROJECT_ID")
        return False
    
    print(f"📍 Project: {SUPABASE_PROJECT_ID}")
    print()
    
    # Try psql connection
    print("🔍 Checking for direct database access...")
    if attempt_psql_connection():
        print("✅ Direct connection available!")
        print()
        
        # Execute all migrations
        migrations_dir = Path(__file__).parent.parent / 'supabase' / 'migrations'
        if migrations_dir.exists():
            migrations = sorted(migrations_dir.glob('*.sql'))
            print(f"📝 Executing {len(migrations)} migrations...")
            print("-" * 60)
            
            successful = 0
            for migration in migrations:
                if execute_sql_via_psql(migration):
                    successful += 1
            
            print()
            print(f"✅ Applied {successful}/{len(migrations)} migrations")
        
        # Also try combined migration
        combined = Path(__file__).parent.parent / 'supabase' / 'combined-migrations.sql'
        if combined.exists() and successful < len(migrations):
            print()
            print("🔄 Trying combined migration file...")
            execute_sql_via_psql(combined)
    else:
        print("⚠️  Direct database connection not available")
        print()
        print("Options:")
        print("1. Add POSTGRES_PASSWORD or SUPABASE_DB_PASSWORD to .env")
        print("2. Add SUPABASE_SERVICE_ROLE_KEY to .env")
        print("3. Use manual setup (see instructions below)")
        print()
        create_manual_copy_paste_guide()
    
    print()
    print("=" * 60)
    print("📋 Next Steps:")
    print()
    print("For automatic setup:")
    print("  1. Get your Service Role key from Supabase Dashboard")
    print("  2. Add to .env: SUPABASE_SERVICE_ROLE_KEY=...")
    print("  3. Run: python scripts/advanced-setup.py")
    print()
    print("For manual setup:")
    print("  See MANUAL_SETUP.md for detailed instructions")
    print()
    
    return True

if __name__ == '__main__':
    main()

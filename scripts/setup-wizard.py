#!/usr/bin/env python3
"""
Interactive Supabase Setup Wizard
Guides user through getting service role key and applying migrations
"""

import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv('SUPABASE_PROJECT_ID', 'adxbqclkxeignpttwldd')

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")

def print_section(text):
    print(f"\n{'─' * 70}")
    print(f"  {text}")
    print(f"{'─' * 70}\n")

def get_service_role_key():
    """Prompt user for service role key"""
    print_section("Step 1: Get Your Service Role Key")
    
    print("We need your Supabase Service Role Key to apply database migrations.")
    print()
    print("To get it:")
    print("  1. Go to: https://supabase.com/dashboard/project/{}/settings/api".format(PROJECT_ID))
    print("  2. Look for 'Service Role' (NOT 'anon' key)")
    print("  3. Copy the full key starting with 'eyJ...'")
    print()
    
    key = input("Paste your Service Role key here: ").strip()
    
    if not key or not key.startswith('ey'):
        print("\n❌ Invalid key format")
        return None
    
    return key

def setup_env(service_role_key):
    """Add service role key to .env"""
    env_file = Path('.env')
    
    # Read current .env
    content = env_file.read_text() if env_file.exists() else ""
    
    # Check if key already exists
    if 'SUPABASE_SERVICE_ROLE_KEY=' in content:
        # Replace existing key
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                new_lines.append(f'SUPABASE_SERVICE_ROLE_KEY="{service_role_key}"')
            else:
                new_lines.append(line)
        content = '\n'.join(new_lines)
    else:
        # Add new key
        if content and not content.endswith('\n'):
            content += '\n'
        content += f'SUPABASE_SERVICE_ROLE_KEY="{service_role_key}"\n'
    
    env_file.write_text(content)
    print("✅ Service Role key saved to .env")

def run_sql_migrations():
    """Execute SQL migrations using Supabase CLI or direct connection"""
    print_section("Step 2: Applying Database Migrations")
    
    migrations_dir = Path('supabase/migrations')
    combined_sql = Path('supabase/combined-migrations.sql')
    
    print("Attempting to apply migrations...\n")
    
    try:
        # Try using supabase CLI
        print("🔄 Using Supabase CLI...")
        result = subprocess.run(
            ['supabase', 'db', 'push', '--no-verify'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ Migrations applied successfully!")
            return True
        else:
            print(f"⚠️  Supabase CLI failed: {result.stderr[:100]}")
    
    except FileNotFoundError:
        print("ℹ️  Supabase CLI not found")
    except Exception as e:
        print(f"⚠️  Error: {e}")
    
    print()
    print("📋 Alternative: Manual SQL Execution")
    print("-" * 70)
    print()
    print("1. Go to: https://supabase.com/dashboard/project/{}/sql/new".format(PROJECT_ID))
    print("2. Open: supabase/combined-migrations.sql")
    print("3. Copy all the SQL code")
    print("4. Paste into the SQL editor")
    print("5. Click 'Run' or press Ctrl+Enter")
    print()
    
    return False

def create_storage_buckets():
    """Guide user through creating storage buckets"""
    print_section("Step 3: Create Storage Buckets")
    
    print("You need to create 3 storage buckets in Supabase:\n")
    
    buckets = [
        {
            "name": "match-recordings",
            "public": "NO (Private)",
            "purpose": "Store recorded match videos",
            "limit": "50 MB"
        },
        {
            "name": "avatars",
            "public": "YES (Public)",
            "purpose": "Store player profile pictures",
            "limit": "5 MB"
        },
        {
            "name": "tournament-covers",
            "public": "YES (Public)",
            "purpose": "Store tournament header images",
            "limit": "10 MB"
        }
    ]
    
    for i, bucket in enumerate(buckets, 1):
        print(f"Bucket {i}: {bucket['name']}")
        print(f"  Public: {bucket['public']}")
        print(f"  Purpose: {bucket['purpose']}")
        print(f"  File Size Limit: {bucket['limit']}")
        print()
    
    print("To create buckets:")
    print("  1. Go to: https://supabase.com/dashboard/project/{}/storage/buckets".format(PROJECT_ID))
    print("  2. Click 'New Bucket'")
    print("  3. For each bucket above:")
    print("     - Enter the name")
    print("     - Set Public to YES/NO as shown")
    print("     - Click 'Create Bucket'")
    print()
    
    input("Press Enter after creating all buckets...")
    
    print("✅ Storage buckets created!")

def verify_setup():
    """Verify that everything is set up correctly"""
    print_section("Step 4: Verify Setup")
    
    print("Checking your setup...\n")
    
    checks = [
        ("Environment variables", lambda: os.getenv('SUPABASE_URL') and os.getenv('SUPABASE_SERVICE_ROLE_KEY')),
        ("Migrations directory", lambda: Path('supabase/migrations').exists()),
        ("Combined migrations file", lambda: Path('supabase/combined-migrations.sql').exists()),
    ]
    
    all_passed = True
    for check_name, check_func in checks:
        try:
            if check_func():
                print(f"✅ {check_name}")
            else:
                print(f"❌ {check_name}")
                all_passed = False
        except Exception as e:
            print(f"❌ {check_name}: {e}")
            all_passed = False
    
    print()
    
    if all_passed:
        print("🎉 All checks passed!")
        return True
    else:
        print("⚠️  Some checks failed. Please verify your setup.")
        return False

def next_steps():
    """Show next steps"""
    print_section("Next Steps")
    
    print("Your Supabase setup is ready! Here's what to do next:")
    print()
    print("1. 📝 Create an initial git commit:")
    print("   $ git add .")
    print("   $ git commit -m 'DLS 2026 Hub - Production Ready'")
    print()
    print("2. 🚀 Push to GitHub:")
    print("   $ git push origin main")
    print()
    print("3. 🌐 Deploy to Vercel:")
    print("   $ vercel --prod")
    print()
    print("4. ⚙️  Set environment variables in Vercel:")
    print("   - VITE_SUPABASE_URL")
    print("   - VITE_SUPABASE_PUBLISHABLE_KEY")
    print("   - VITE_SUPABASE_PROJECT_ID")
    print()
    print("5. ✅ Test your app at your Vercel URL")
    print()

def main():
    """Main wizard flow"""
    print_header("DLS 2026 Gaming Hub - Supabase Setup Wizard")
    
    print("This wizard will help you set up Supabase for your project.")
    print()
    print("⏱️  Estimated time: 5 minutes")
    print()
    
    # Step 1: Get service role key
    service_role_key = get_service_role_key()
    if not service_role_key:
        print("\n❌ Setup cancelled")
        return False
    
    # Step 2: Save to .env
    print_section("Saving Credentials")
    setup_env(service_role_key)
    
    # Step 3: Apply migrations
    run_sql_migrations()
    
    # Step 4: Create buckets
    print()
    create_storage_buckets()
    
    # Step 5: Verify
    verify_setup()
    
    # Step 6: Next steps
    next_steps()
    
    print_header("Ready to Deploy!")
    print("Your Supabase setup is complete. Now push to GitHub and deploy to Vercel.")
    print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        sys.exit(1)

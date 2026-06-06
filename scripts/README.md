# Supabase Setup Scripts

This directory contains automation scripts for setting up Supabase for the DLS 2026 Gaming Hub project.

## Quick Start

### Option 1: Interactive Wizard (Recommended)

```bash
python scripts/setup-wizard.py
```

This will guide you through:
1. Getting your Service Role Key
2. Applying database migrations
3. Creating storage buckets
4. Verifying your setup

**Time**: ~5 minutes  
**Difficulty**: Easy - just copy/paste your Service Role Key

### Option 2: Automatic Setup (Fastest)

If you already have your Service Role Key in your `.env` file:

```bash
# Add to .env:
SUPABASE_SERVICE_ROLE_KEY=your_key_here

# Then run:
python scripts/auto-setup.py
```

**Time**: < 1 minute  
**Difficulty**: You need to have the Service Role Key ready

### Option 3: Advanced Setup (For Power Users)

```bash
python scripts/advanced-setup.py
```

This script automatically detects available connection methods and applies migrations if possible.

### Option 4: Manual Setup (Copy-Paste SQL)

See `MANUAL_SETUP.md` for step-by-step instructions to manually execute SQL in the Supabase Dashboard.

---

## Getting Your Service Role Key

### Step 1: Open Supabase Dashboard
Go to: `https://supabase.com/dashboard/project/adxbqclkxeignpttwldd/settings/api`

### Step 2: Find Service Role Key
Look for the **"Service Role"** section (NOT "anon" key)

### Step 3: Copy the Key
The key starts with `eyJ...` and is a long string of characters

### Step 4: Add to .env
```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## What Each Script Does

### setup-wizard.py
- ✅ Interactive step-by-step guide
- ✅ Prompts you for Service Role Key
- ✅ Guides you through all steps
- ✅ Verifies setup at the end

**Best for**: First time setup, don't know SQL

### auto-setup.py
- ✅ Fully automated
- ✅ Applies migrations via API
- ✅ Creates storage buckets
- ✅ Generates colored output

**Best for**: You have Service Role Key, want it done fast

### advanced-setup.py
- ✅ Multiple connection methods
- ✅ Falls back gracefully
- ✅ Generates manual setup guide
- ✅ Can use direct database connection

**Best for**: Troubleshooting, advanced users

### setup.sh
- ✅ Bash script for CI/CD
- ✅ Environment variable based
- ✅ Integrates with Supabase CLI

**Best for**: Docker, GitHub Actions, deployment pipelines

---

## Files That Get Created/Used

### Database Migrations
- `supabase/migrations/*.sql` - Individual migration files
- `supabase/combined-migrations.sql` - All migrations in one file

### Setup Files
- `.env` - Your Supabase credentials (private, never commit)
- `.env.example` - Template for .env (commit this)
- `.gitignore` - Updated to protect .env

### Guides
- `MANUAL_SETUP.md` - Manual copy-paste SQL guide
- `DEPLOYMENT.md` - Full deployment documentation
- `QUICKSTART.md` - 5-minute quick start

---

## Troubleshooting

### "Service Role Key not set"
Add `SUPABASE_SERVICE_ROLE_KEY=your_key` to your `.env` file

### "Database connection failed"
1. Verify your Project ID is correct
2. Check Service Role Key is valid (starts with `eyJ`)
3. Make sure you're not using the anon key

### "Permission denied"
You're using the anon key instead of Service Role key. Get the Service Role key from Settings → API

### "Already exists error"
Tables or buckets already exist from a previous setup. This is fine - the script will skip them.

### "Supabase CLI not found"
Install it: `npm install -g supabase` or use the Python scripts instead

---

## Environment Variables

### Required
```env
SUPABASE_PROJECT_ID=adxbqclkxeignpttwldd
SUPABASE_URL=https://adxbqclkxeignpttwldd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

### For Automatic Setup
```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### For Database Connection
```env
POSTGRES_PASSWORD=your_password
```

---

## Next Steps After Setup

1. **Verify tables exist:**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

2. **Verify buckets exist:**
   - Go to Supabase Dashboard → Storage
   - You should see: match-recordings, avatars, tournament-covers

3. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Supabase setup complete"
   git push origin main
   ```

4. **Configure Vercel Environment Variables:**
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
   - VITE_SUPABASE_PROJECT_ID

5. **Test in Production:**
   - Visit your Vercel URL
   - Sign up and test streaming features

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **API Reference**: https://supabase.com/docs/reference
- **SQL Editor Guide**: https://supabase.com/docs/guides/database/query
- **Storage Guide**: https://supabase.com/docs/guides/storage

---

## FAQ

**Q: Can I run multiple scripts?**  
A: Yes, they all work with the same database. Just run one.

**Q: Is my Service Role Key safe in .env?**  
A: Yes, .env is in .gitignore so it never gets committed to GitHub

**Q: Can I change my mind?**  
A: Yes, delete everything from Supabase Dashboard and start over

**Q: Do I need the CLI?**  
A: No, the Python scripts work without it

**Q: How long does setup take?**  
A: Usually 2-5 minutes depending on method

---

Last Updated: 2026-06-06

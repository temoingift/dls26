
# 🚀 Manual Supabase Setup Guide

## Step 1: Get Your Service Role Key
1. Go to https://supabase.com/dashboard/project/adxbqclkxeignpttwldd/settings/api
2. Copy the **Service Role** key (NOT the anon key)
3. Add to .env file:
   SUPABASE_SERVICE_ROLE_KEY=your_key_here

## Step 2: Apply Database Migrations
1. Go to https://supabase.com/dashboard/project/adxbqclkxeignpttwldd/sql/new
2. Copy the content from: supabase/combined-migrations.sql
3. Paste it into the SQL editor
4. Click "Run" or press Ctrl+Enter
5. Wait for all queries to complete (green checkmarks)

## Step 3: Create Storage Buckets
1. Go to https://supabase.com/dashboard/project/adxbqclkxeignpttwldd/storage/buckets
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
supabase link --project-ref adxbqclkxeignpttwldd
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

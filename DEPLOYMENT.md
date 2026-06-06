# 🚀 DLS 2026 Hub - Deployment Guide

## Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Migrations](#database-migrations)
5. [Troubleshooting](#troubleshooting)

---

## Supabase Setup

### Step 1: Create/Access Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project or use existing one: `adxbqclkxeignpttwldd`
4. Wait for project to initialize

### Step 2: Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Project ID** → `VITE_SUPABASE_PROJECT_ID`

### Step 3: Apply Database Migrations

The database schema is defined in `supabase/migrations/`:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref adxbqclkxeignpttwldd

# Push migrations to your database
supabase db push

# Or manually apply migrations in Supabase SQL Editor:
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Run each migration file in order (20260526181245_*.sql, etc.)
```

### Step 4: Create Storage Buckets

In Supabase Dashboard → Storage:

1. Create bucket: `match-recordings` (Private)
2. Create bucket: `avatars` (Public)
3. Create bucket: `tournament-covers` (Public)

---

## Vercel Deployment

### Step 1: Prepare Your GitHub Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DLS 2026 Gaming Hub"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Select your GitHub repository
5. Click **Import**
6. Set environment variables (see next section)
7. Click **Deploy**

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

Add these variables (from your Supabase project):

```
VITE_SUPABASE_URL = https://adxbqclkxeignpttwldd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID = adxbqclkxeignpttwldd
```

**Important**: Make sure these are added to:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## Environment Variables

### Local Development

Create a `.env` file in your project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in your Supabase credentials:

```env
SUPABASE_PROJECT_ID=adxbqclkxeignpttwldd
SUPABASE_PUBLISHABLE_KEY=your_key_here
SUPABASE_URL=https://adxbqclkxeignpttwldd.supabase.co
VITE_SUPABASE_PROJECT_ID=adxbqclkxeignpttwldd
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
VITE_SUPABASE_URL=https://adxbqclkxeignpttwldd.supabase.co
```

### Production (Vercel)

Environment variables are set in Vercel Dashboard and automatically available at runtime.

---

## Database Migrations

### What's Included

The migrations create:

1. **User Roles & Profiles**
   - User roles (admin, player)
   - User profiles with stats

2. **Tournaments**
   - Tournament management
   - Participant tracking
   - Prize distribution

3. **Live Matches**
   - Live match streaming
   - Real-time signaling for WebRTC
   - Match recordings storage

4. **Live Chat**
   - Real-time messaging during matches

5. **Storage Buckets**
   - Match recordings
   - Player avatars
   - Tournament covers

### Manual Migration

If Supabase CLI doesn't work, manually apply migrations:

```sql
-- Open Supabase Dashboard → SQL Editor
-- Copy & paste each migration file content
-- Execute in order (by timestamp)
```

---

## Features That Now Work

### ✅ Live Streaming
- Screen share or camera capture
- Real-time WebRTC peer connections
- Multiple viewers simultaneously

### ✅ Match Recording
- Automatic local recording
- Upload to Supabase storage
- Replay saved to History

### ✅ User Authentication
- Signup with email/password
- Profile creation
- Avatar uploads

### ✅ Tournaments
- Create and manage tournaments
- Register players
- Track standings

### ✅ Live Chat
- Real-time messaging during matches
- Supabase real-time subscriptions

### ✅ Leaderboards
- Player rankings
- Win/loss tracking
- Global stats

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution:**
1. Verify `VITE_SUPABASE_URL` is correct
2. Check `VITE_SUPABASE_PUBLISHABLE_KEY` is valid
3. Restart dev server: `npm run dev`

### Issue: "No such bucket" error

**Solution:**
1. Create missing storage buckets in Supabase Dashboard
2. Check bucket names match code (match-recordings, avatars, tournament-covers)

### Issue: "Authentication failed"

**Solution:**
1. Ensure migrations are applied
2. Check database policies in Supabase
3. Verify JWT token in publishable key

### Issue: "Build fails on Vercel"

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all env vars are set
3. Run `npm run build` locally to test
4. Check for TypeScript errors: `npx tsc --noEmit`

### Issue: "Streaming doesn't work"

**Solution:**
1. Check WebRTC connection in browser console
2. Verify TURN servers are accessible
3. Test on HTTPS (Vercel provides this by default)
4. Check firewall/NAT settings

---

## Monitoring & Maintenance

### View Logs

**Vercel:**
```bash
# View deployment logs
vercel logs [project-name]

# Stream logs
vercel logs [project-name] --follow
```

**Supabase:**
- Database logs: Dashboard → Logs
- API logs: Dashboard → Logs
- Real-time logs: Dashboard → Logs

### Performance Optimization

1. **Image Optimization**: Images in public folder are auto-optimized by Vercel
2. **Caching**: Static assets are cached with long TTL
3. **Database**: Add indexes for frequently queried columns
4. **Storage**: Archive old match recordings

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to Vercel
3. ✅ Set environment variables
4. ✅ Apply database migrations
5. ✅ Test live streaming
6. ✅ Monitor performance
7. 🔄 Continue development

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **TanStack Start**: https://tanstack.com/start
- **WebRTC**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

**Last Updated**: 2026-06-06
**Status**: 🟢 Ready for Production

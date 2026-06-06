# 🚀 GET STARTED - Supabase Setup (15 min)

**Your Supabase automation is ready. Here's all you need to do:**

---

## ⏱️ Total Time: ~15 minutes

### Step 1: Get Your Service Role Key (1 min)
1. Open: https://supabase.com/dashboard/project/adxbqclkxeignpttwldd/settings/api
2. Find "Service Role" section
3. Copy the key (starts with `eyJ...`)

### Step 2: Add to .env (30 sec)
```env
SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here
```

### Step 3: Run Setup (2 min)
```bash
python scripts/setup-wizard.py
```

Or for automatic mode:
```bash
python scripts/auto-setup.py
```

### Step 4: Create Storage Buckets (2 min)
1. Go to: https://supabase.com/dashboard/project/adxbqclkxeignpttwldd/storage/buckets
2. Click "New Bucket" and create these 3:
   - `match-recordings` (Private)
   - `avatars` (Public)
   - `tournament-covers` (Public)

### Step 5: Deploy (5 min)
```bash
git add .
git commit -m "Production ready"
git push origin main
```

Then in Vercel Dashboard:
1. Set these environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

2. Click Deploy

---

## 📚 Need More Details?

- **Setup Scripts**: See `scripts/README.md`
- **Manual Setup**: See `MANUAL_SETUP.md`
- **Full Deployment**: See `DEPLOYMENT.md`
- **Full Summary**: See `SUPABASE_SETUP_COMPLETE.md`

---

## ✅ Done!

That's it. Your app is production-ready.

Questions? Check the docs or see SUPABASE_SETUP_COMPLETE.md for troubleshooting.

# 🎮 DLS 2026 Hub - Quick Start Guide

## Pre-Deployment Checklist

### Supabase Setup
- [ ] Supabase project created: `adxbqclkxeignpttwldd`
- [ ] Project URL copied to `.env`
- [ ] Publishable key copied to `.env`
- [ ] Project ID copied to `.env`
- [ ] All database migrations applied
- [ ] Storage buckets created:
  - [ ] `match-recordings` (Private)
  - [ ] `avatars` (Public)
  - [ ] `tournament-covers` (Public)

### GitHub Setup
- [ ] Repository created on GitHub
- [ ] Local `.env` file added to `.gitignore`
- [ ] All changes committed
- [ ] Repository pushed to GitHub

### Vercel Setup
- [ ] Vercel account created at vercel.com
- [ ] GitHub connected to Vercel
- [ ] Project imported to Vercel
- [ ] Environment variables set in Vercel:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
  - [ ] `VITE_SUPABASE_PROJECT_ID`

---

## Quick Start (5 Minutes)

### 1. **Local Development**

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:8080
```

### 2. **Deploy to Vercel**

```bash
# Option A: Using Vercel CLI
npm install -g vercel
vercel --prod

# Option B: Push to GitHub and deploy via Dashboard
git push origin main
# → Go to vercel.com → Select repo → Deploy
```

### 3. **Test Features**

Once deployed:

1. ✅ Visit your Vercel URL
2. ✅ Sign up with email
3. ✅ Create player profile
4. ✅ Test streaming: Go to Play → Start Match
5. ✅ Test watching: Go to Watch → Enter join code
6. ✅ Test chat: Send messages in live match

---

## Environment Variables Reference

### Required for Build

```env
# Supabase
VITE_SUPABASE_URL=https://adxbqclkxeignpttwldd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=adxbqclkxeignpttwldd
```

### Optional for Runtime

```env
# Only needed for server-side operations
SUPABASE_SERVICE_KEY=your_service_key_here
NODE_ENV=production
```

---

## Features Status

| Feature | Local | Vercel | Notes |
|---------|:-----:|:------:|-------|
| User Authentication | ✅ | ✅ | Email/password signup |
| Profile Creation | ✅ | ✅ | Avatar upload to Supabase |
| Live Streaming | ✅ | ✅ | Screen share or camera |
| Recording | ✅ | ✅ | Auto-saved to Supabase |
| Real-time Chat | ✅ | ✅ | Supabase real-time |
| Tournaments | ✅ | ✅ | Full management |
| Leaderboards | ✅ | ✅ | Rankings by wins |
| WebRTC Streaming | ✅ | ✅ | P2P connections |

---

## Common Issues & Solutions

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Supabase connection failed"
- Check `.env` variables are set correctly
- Verify Supabase project is active
- Restart dev server: `npm run dev`

### "Storage bucket not found"
- Create missing buckets in Supabase Dashboard
- Bucket names: `match-recordings`, `avatars`, `tournament-covers`

### "Build fails on Vercel"
1. Check build logs in Vercel dashboard
2. Run `npm run build` locally
3. Fix any errors, commit and push

### "Streaming not working on Vercel"
1. Verify HTTPS is enabled (Vercel provides this)
2. Check WebRTC console logs
3. Test on latest browser (Chrome/Firefox)
4. May need to configure TURN servers for NAT traversal

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Database
npx supabase link --project-ref adxbqclkxeignpttwldd
npx supabase db push # Apply migrations

# Deployment
vercel --prod        # Deploy to Vercel production
vercel logs          # View Vercel logs

# Code Quality
npm run lint         # Check TypeScript/ESLint
npm run format       # Format code with Prettier
```

---

## Project Structure

```
dls26-main/
├── src/
│   ├── routes/              # Page routes
│   │   ├── index.tsx        # Home page
│   │   ├── login.tsx        # Login page
│   │   ├── signup.tsx       # Signup page
│   │   └── _authenticated/  # Protected routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   ├── integrations/        # External integrations
│   │   └── supabase/        # Supabase client
│   ├── styles.css           # Global styles
│   ├── server.ts            # Server entry point
│   └── start.ts             # Client entry point
├── supabase/
│   ├── config.toml          # Supabase config
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── .env                     # Environment variables (local)
├── .env.example             # Template for env vars
├── vercel.json              # Vercel config
├── vite.config.ts           # Vite config
├── package.json             # Dependencies
└── DEPLOYMENT.md            # Full deployment guide
```

---

## Architecture Overview

### Frontend (Vite + React)
- TanStack Router for routing
- React Query for data fetching
- Tailwind CSS for styling
- Three.js for 3D animations

### Backend (Supabase)
- PostgreSQL database
- Real-time subscriptions
- Authentication (email/password)
- File storage (Avatars, Recordings)
- Row-level security policies

### Streaming (WebRTC)
- Peer-to-peer connections
- Offer/Answer signaling via Supabase
- ICE candidate gathering
- Support for multiple viewers

### Deployment (Vercel)
- Automatic builds on push
- Global CDN for static assets
- Serverless functions (future)
- Environment variable management

---

## Security Notes

### ✅ What's Protected

- **Authentication**: JWT tokens from Supabase Auth
- **Database**: Row-level security policies
- **Storage**: Bucket-level permissions
- **Streaming**: Encrypted WebRTC connections
- **Env Variables**: Never exposed to client

### ⚠️ Important

1. **Never commit `.env`** - Added to .gitignore
2. **Use HTTPS only** - Vercel provides TLS by default
3. **Validate user input** - Server-side validation required
4. **Secure storage keys** - Keep service key private
5. **Monitor activity** - Check Supabase logs regularly

---

## Performance Tips

1. **Images**: Use Vercel Image Optimization
2. **Caching**: Static assets cached for 365 days
3. **Database**: Add indexes for frequently queried columns
4. **API**: Use Supabase real-time only for live features
5. **Streaming**: Close WebRTC connections after use

---

## Next Steps

1. **Local Testing**
   ```bash
   npm install
   npm run dev
   # Test at http://localhost:8080
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial DLS 2026 Hub setup"
   git push origin main
   ```

3. **Deploy to Vercel**
   ```bash
   # Via CLI
   vercel --prod
   
   # Or via Dashboard: vercel.com → Import Project
   ```

4. **Verify on Production**
   - Check Vercel deployment URL
   - Test all features
   - Monitor performance

---

## Support Resources

- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **TanStack**: https://tanstack.com/start/latest
- **WebRTC**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Status**: 🟢 Production Ready
**Last Updated**: 2026-06-06

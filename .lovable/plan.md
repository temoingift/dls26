## What you'll get

**1. Football stadium artwork (AI-generated, fully owned by you)**
Generate 3 custom images in the navy & gold premium-league style:
- `auth-bg.jpg` — moody floodlit stadium at night, gold accents, navy sky. Used as full-bleed background on `/login` and `/signup` with a dark gradient overlay so forms stay readable.
- `hero-bg.jpg` — dynamic football action / trophy shot for the landing page hero.
- `tournament-default.jpg` — generic pitch/scoreboard art used as fallback cover on tournament cards.

All images are saved to `src/assets/` and imported as ES6 modules. No copyrighted DLS art — safe for public publishing.

**2. Tournament cover images (admin-controlled)**
Admins can paste an image URL when creating a tournament (new `cover_image_url` field). If empty, the default football artwork is used. Shown on the tournaments list and detail page.

**3. Admin entry — how it works today (no changes)**
- The first user to sign up is automatically promoted to `admin` (handled by the `handle_new_user` DB trigger).
- Admins log in through the normal `/login` page — same form as players.
- After login, admins see an extra "Admin" link in the top nav (`AppNav`) that regular players don't see.
- Clicking it opens `/admin`, which has:
  - A "New Tournament" button → opens the create form (name, dates, entry fee, prize, MoMo number, instructions, etc.)
  - A "Pending approvals" list to verify MoMo transaction IDs
  - A list of all tournaments with status dropdown
- I'll add a small "Admin Panel" callout card on the dashboard for admins so the entry is obvious on first login.

## Technical changes

- `imagegen` (3 calls) → `src/assets/auth-bg.jpg`, `hero-bg.jpg`, `tournament-default.jpg`
- `src/routes/login.tsx`, `src/routes/signup.tsx` — wrap form in a full-screen layout with the stadium image as background + dark overlay; form lives in a glass card centered on screen.
- `src/routes/index.tsx` — use `hero-bg.jpg` as the hero background.
- `src/routes/_authenticated/tournaments.tsx` and `tournaments.$id.tsx` — show `cover_image_url` (or fallback) on cards/detail header.
- `src/routes/_authenticated/dashboard.tsx` — add an "Open Admin Panel" card visible only when `isAdmin`.
- Migration: add `cover_image_url TEXT` column to `tournaments` + update the admin create form to include the field.

No changes to auth logic, RLS, or the participation flow.

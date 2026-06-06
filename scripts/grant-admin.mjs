#!/usr/bin/env node
// Grant admin role to a user in the `user_roles` table.
// Usage:
//   node scripts/grant-admin.mjs user@example.com
//   node scripts/grant-admin.mjs <user-uuid>

import fs from 'fs';
import path from 'path';

function parseDotEnv(text) {
  const lines = text.split(/\r?\n/);
  const out = {};
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env not found in project root. Create one with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const env = parseDotEnv(fs.readFileSync(envPath, 'utf8'));
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/grant-admin.mjs <email|user-id>');
  process.exit(1);
}

const fetchFn = globalThis.fetch ? globalThis.fetch.bind(globalThis) : (...args) => import('node-fetch').then(m => m.default(...args));

function isUUID(v) {
  return /^[0-9a-fA-F-]{36}$/.test(v);
}

async function lookupUserIdByEmail(email) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  const res = await fetchFn(url, { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, Accept: 'application/json' } });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Lookup failed: ${res.status} ${t}`);
  }
  const json = await res.json().catch(() => null);
  if (!json) return null;
  if (Array.isArray(json) && json.length) return json[0].id;
  if (json.users && json.users.length) return json.users[0].id;
  if (json.id) return json.id;
  return null;
}

async function hasAdminRole(userId) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(userId)}&role=eq.admin`;
  const res = await fetchFn(url, { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, Accept: 'application/json' } });
  if (!res.ok) return false;
  const json = await res.json().catch(() => []);
  return Array.isArray(json) && json.length > 0;
}

async function insertAdminRole(userId) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/user_roles`;
  const res = await fetchFn(url, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ user_id: userId, role: 'admin' }),
  });
  return res;
}

(async () => {
  try {
    let userId = null;
    if (arg.includes('@')) {
      userId = await lookupUserIdByEmail(arg);
      if (!userId) {
        console.error(`No user found for email ${arg}`);
        process.exit(1);
      }
    } else if (isUUID(arg)) {
      userId = arg;
    } else {
      console.error('Argument must be an email or a user UUID');
      process.exit(1);
    }

    const already = await hasAdminRole(userId);
    if (already) {
      console.log(`User ${userId} already has admin role.`);
      process.exit(0);
    }

    const insertRes = await insertAdminRole(userId);
    if (!insertRes.ok) {
      const txt = await insertRes.text().catch(() => '');
      console.error(`Failed to insert admin role: ${insertRes.status} ${txt}`);
      process.exit(1);
    }
    const created = await insertRes.json().catch(() => null);
    console.log('Admin role granted:', created ?? userId);
  } catch (err) {
    console.error('Error:', String(err));
    process.exit(1);
  }
})();

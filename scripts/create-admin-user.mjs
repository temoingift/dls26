#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/create-admin-user.mjs <email> <password>');
  process.exit(1);
}

const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function lookupUserIdByEmail(email) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, Accept: 'application/json' } });
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

(async () => {
  try {
    console.log('Creating user (if not exists)...');

    // Try to create via the Admin client. If user exists this may error.
    try {
      // Use the server-side admin createUser method
      const { data, error } = await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) {
        // Log but continue to lookup
        console.warn('createUser warning:', error.message || error);
      } else {
        console.log('createUser response:', data ? 'user created' : 'no data');
      }
    } catch (e) {
      console.warn('createUser threw, continuing to lookup:', String(e).slice(0, 200));
    }

    // Lookup user id by email (ensure we have it)
    const userId = await lookupUserIdByEmail(email);
    if (!userId) {
      console.error('Unable to find or create user id for', email);
      process.exit(1);
    }

    console.log('User id:', userId);

    // Ensure admin role in user_roles
    const { data: existing, error: selErr } = await client
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin');
    if (selErr) {
      console.warn('Could not query existing roles:', selErr.message || selErr);
    }
    if (existing && existing.length) {
      console.log('User already has admin role.');
      process.exit(0);
    }

    const { data: insertRes, error: insErr } = await client
      .from('user_roles')
      .insert([{ user_id: userId, role: 'admin' }]);
    if (insErr) {
      console.error('Failed to grant admin role:', insErr.message || insErr);
      process.exit(1);
    }
    console.log('Admin role granted.');
  } catch (err) {
    console.error('Error:', String(err));
    process.exit(1);
  }
})();

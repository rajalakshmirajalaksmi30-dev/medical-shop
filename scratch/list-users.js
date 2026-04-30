import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      let val = value.join('=').trim();
      // Strip quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      env[key.trim()] = val;
    }
  });
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  // List all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching profiles:', error.message);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('No users found. Please register an account on the site first at http://localhost:5173/register');
    return;
  }

  console.log('\n=== Registered Users ===');
  profiles.forEach((p, i) => {
    console.log(`\n${i + 1}. ID: ${p.id}`);
    console.log(`   Name: ${p.full_name || 'N/A'}`);
    console.log(`   Role: ${p.user_role}`);
    console.log(`   Created: ${p.created_at}`);
  });

  // Also list auth users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (!authError && users) {
    console.log('\n=== Auth Users (with emails) ===');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} — ID: ${u.id}`);
    });
  }
}

listUsers();

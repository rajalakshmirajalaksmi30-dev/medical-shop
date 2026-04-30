import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const VITE_SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=["']?(.*?)["']?$/m)?.[1]?.trim();
const SUPABASE_SERVICE_ROLE_KEY = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=["']?(.*?)["']?$/m)?.[1]?.trim();

const supabaseUrl = VITE_SUPABASE_URL;
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdmin() {
  const email = 'rajalakshmirajalaksmi30@gmail.com';
  
  // 1. Get user by email using auth admin API
  console.log('Finding user by email:', email);
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  const user = usersData.users.find(u => u.email === email);
  
  if (!user) {
    console.error('User not found!');
    
    // As a fallback, try to find any profile with similar email if it was saved in profile
    const { data: profiles, error: profErr } = await supabase.from('profiles').select('*');
    console.log("All profiles:", profiles);
    return;
  }
  
  console.log('Found user ID:', user.id);
  
  // 2. Update profile
  const { data, error } = await supabase
    .from('profiles')
    .update({ user_role: 'admin' })
    .eq('id', user.id)
    .select();
    
  if (error) {
    console.error('Error updating profile:', error);
  } else {
    console.log('Successfully updated profile to admin:', data);
  }
}

setAdmin();

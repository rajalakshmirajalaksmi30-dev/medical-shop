import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function makeAdmin() {
  const email = 'rajalakshmirajalakshmi30@gmail.com'; // User's screenshot email
  const typoEmail = 'rajalakshmirajalaksmi30@gmail.com'; // User's typed email
  
  // 1. Get the user ID
  const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }
  
  const user = users.users.find(u => u.email === email || u.email === typoEmail);
  if (!user) {
    console.log('User not found. Printing all users:');
    users.users.forEach(u => console.log(u.email));
    return;
  }
  
  console.log('Found user:', user.email, 'ID:', user.id);
  
  // 2. Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ user_role: 'admin' })
    .eq('id', user.id);
    
  if (updateError) {
    console.error('Error updating profile:', updateError);
  } else {
    console.log('SUCCESS! Updated user to admin.');
  }
}

makeAdmin();

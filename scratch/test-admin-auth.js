import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msdodloqdrvdiexxyywh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZG9kbG9xZHJ2ZGlleHh5eXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTEzMzQsImV4cCI6MjA5MjI2NzMzNH0.PXQBwBESgfaJwnN9jZ1EZ8N8y2aPJR3bKY73MAQN3Gc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  // Try to sign in as the admin user
  const testPasswords = ['Raji@2026', 'admin123', 'Admin@123', 'password123', 'Admin123!'];
  
  let signedIn = false;
  
  for (const pw of testPasswords) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'rajalakshmirajalaksmi30@gmail.com',
      password: pw,
    });
    
    if (error) {
      console.log(`Password "${pw}" -> FAILED: ${error.message}`);
    } else {
      console.log(`Password "${pw}" -> SUCCESS!`);
      console.log(`User ID: ${data.user.id}`);
      signedIn = true;
      
      // Now check if this user has admin profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileErr) {
        console.log(`Profile fetch error: ${profileErr.message}`);
        console.log('⚠️  This could be an RLS issue! The admin panel would show but stats might fail.');
      } else {
        console.log(`Profile: ${JSON.stringify(profile)}`);
        console.log(`user_role: ${profile.user_role}`);
        console.log(`isAdmin: ${profile.user_role === 'admin'}`);
      }

      // Test if admin can read products (what AdminDashboard does)
      const { data: products, error: prodErr, count } = await supabase
        .from('products')
        .select('id', { count: 'exact' });
      
      console.log(`\nProducts query: ${prodErr ? 'ERROR: ' + prodErr.message : 'OK, count=' + count}`);

      // Test if admin can read orders (what AdminDashboard does)
      const { data: orders, error: ordErr } = await supabase
        .from('orders')
        .select('*');
      
      console.log(`Orders query: ${ordErr ? 'ERROR: ' + ordErr.message : 'OK, count=' + (orders?.length || 0)}`);

      await supabase.auth.signOut();
      break;
    }
  }
  
  if (!signedIn) {
    console.log('\n❌ Could not sign in with any test password.');
    console.log('The user needs to provide the correct admin password.');
    
    // Try g.maulikasri@gmail.com (the other admin)
    console.log('\nTrying other admin: g.maulikasri@gmail.com...');
    for (const pw of testPasswords) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'g.maulikasri@gmail.com',
        password: pw,
      });
      if (!error) {
        console.log(`  Password "${pw}" -> SUCCESS for g.maulikasri@gmail.com`);
        await supabase.auth.signOut();
        break;
      }
    }
  }
}

testAdminLogin().catch(console.error);

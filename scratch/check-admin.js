import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msdodloqdrvdiexxyywh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZG9kbG9xZHJ2ZGlleHh5eXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY5MTMzNCwiZXhwIjoyMDkyMjY3MzM0fQ.UannwI8bphPcg5HmAlKtj_xZlyTpLSGucS8FzNwOLGM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAdmin() {
  console.log('=== Checking Admin Setup ===\n');

  // 1. Check profiles table
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesErr) {
    console.error('Error fetching profiles:', profilesErr.message);
  } else {
    console.log(`Total profiles: ${profiles.length}`);
    profiles.forEach(p => {
      console.log(`  - ID: ${p.id.substring(0, 8)}... | Name: ${p.full_name} | Role: ${p.user_role}`);
    });

    const admins = profiles.filter(p => p.user_role === 'admin');
    console.log(`\nAdmin users: ${admins.length}`);
    if (admins.length === 0) {
      console.log('⚠️  NO ADMIN USERS FOUND! You need to set a user as admin.');
      console.log('   Run this SQL in Supabase SQL Editor:');
      console.log('   UPDATE profiles SET user_role = \'admin\' WHERE id = \'YOUR_USER_UUID\';');
    }
  }

  // 2. Check products table
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('id, name, category, price, stock');
  
  if (productsErr) {
    console.error('\nError fetching products:', productsErr.message);
  } else {
    console.log(`\nTotal products: ${products.length}`);
  }

  // 3. Check orders table
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, payment_status, total_amount');
  
  if (ordersErr) {
    console.error('\nError fetching orders:', ordersErr.message);
  } else {
    console.log(`Total orders: ${orders.length}`);
  }

  // 4. List auth users
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  
  if (authErr) {
    console.error('\nError listing auth users:', authErr.message);
  } else {
    console.log(`\nRegistered auth users: ${authData.users.length}`);
    authData.users.forEach(u => {
      console.log(`  - ${u.email} (ID: ${u.id.substring(0, 8)}...)`);
    });
  }

  console.log('\n=== Done ===');
}

checkAdmin().catch(console.error);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msdodloqdrvdiexxyywh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZG9kbG9xZHJ2ZGlleHh5eXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTEzMzQsImV4cCI6MjA5MjI2NzMzNH0.PXQBwBESgfaJwnN9jZ1EZ8N8y2aPJR3bKY73MAQN3Gc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('Checking products in Supabase...');
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error.message);
      process.exit(1);
    }
    console.log(`Found ${data.length} products.`);
    data.forEach(p => console.log(`- ${p.name}`));
  } catch (err) {
    console.error('Exception:', err);
  }
}

checkProducts();

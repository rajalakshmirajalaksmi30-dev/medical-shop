import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msdodloqdrvdiexxyywh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZG9kbG9xZHJ2ZGlleHh5eXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTEzMzQsImV4cCI6MjA5MjI2NzMzNH0.PXQBwBESgfaJwnN9jZ1EZ8N8y2aPJR3bKY73MAQN3Gc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  
  try {
    console.log('Fetching products...');
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log('Success! Products found:', data?.length || 0);
      if (data?.length > 0) {
        console.log('First product:', data[0].name);
      }
    }

    console.log('Fetching profiles...');
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (pError) {
      console.error('Error fetching profiles:', pError);
    } else {
      console.log('Success! Profiles found:', profiles?.length || 0);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

test();

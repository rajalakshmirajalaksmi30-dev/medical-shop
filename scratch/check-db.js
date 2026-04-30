
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
      env[key.trim()] = value.join('=').trim();
    }
  });
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndSeed() {
  try {
    console.log('Checking products table...');
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id');

    if (fetchError) {
      console.log('Error or table missing:', fetchError.message);
      return;
    }

    console.log(`Found ${products.length} products.`);

    if (products.length === 0) {
      console.log('Seeding sample products...');
      const sampleProducts = [
        { name: 'Paracetamol 500mg', description: 'Effective pain relief and fever reduction tablets.', price: 25.00, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', stock: 100, category: 'Tablets' },
        { name: 'Cough Syrup 100ml', description: 'Herbal cough syrup for dry and wet cough relief.', price: 85.00, image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400', stock: 50, category: 'Syrups' },
        { name: 'Digital Thermometer', description: 'Fast and accurate digital thermometer.', price: 199.00, image_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400', stock: 30, category: 'Equipment' },
        { name: 'First Aid Kit', description: 'Complete first aid kit with bandages and antiseptic.', price: 450.00, image_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', stock: 25, category: 'First Aid' }
      ];

      const { error: insertError } = await supabase.from('products').insert(sampleProducts);
      if (insertError) throw insertError;
      console.log('Successfully seeded products!');
    } else {
      console.log('Products table already has data.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndSeed();

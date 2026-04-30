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

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function addProduct() {
  const newProduct = {
    name: 'Dolo 650mg',
    description: 'Dolo 650mg is a paracetamol-based tablet used for fever and mild to moderate pain relief. Pack of 15 tablets.',
    price: 35.00,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    stock: 200,
    category: 'Tablets'
  };

  const { data, error } = await supabase
    .from('products')
    .insert(newProduct)
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error.message);
    return;
  }

  console.log('Product added successfully!');
  console.log(`  ID: ${data.id}`);
  console.log(`  Name: ${data.name}`);
  console.log(`  Price: ₹${data.price}`);
  console.log(`  Stock: ${data.stock}`);
  console.log(`  Category: ${data.category}`);
}

addProduct();

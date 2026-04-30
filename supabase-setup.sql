-- ============================================
-- Shantha Krish Medicals - Supabase Setup SQL
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  user_role TEXT DEFAULT 'customer' CHECK (user_role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Helper function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies for Products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE USING (is_admin());

-- 7. RLS Policies for Orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT USING (
    auth.uid() = user_id OR is_admin()
  );

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE USING (is_admin());

-- 8. RLS Policies for Profiles
CREATE POLICY "Profiles are viewable by own user"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (is_admin());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 8. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Sample products (optional - remove if not needed)
INSERT INTO products (name, description, price, image_url, stock, category) VALUES
  ('Paracetamol 500mg', 'Effective pain relief and fever reduction tablets. Pack of 10 tablets.', 25.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 100, 'Tablets'),
  ('Cough Syrup 100ml', 'Herbal cough syrup for dry and wet cough relief. Sugar-free formula.', 85.00, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400', 50, 'Syrups'),
  ('Digital Thermometer', 'Fast and accurate digital thermometer with LCD display.', 199.00, 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400', 30, 'Equipment'),
  ('First Aid Kit', 'Complete first aid kit with bandages, antiseptic, and essential medical supplies.', 450.00, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', 25, 'First Aid'),
  ('Vitamin C Tablets', 'Immunity boosting Vitamin C 500mg chewable tablets. Pack of 30.', 150.00, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 80, 'Supplements'),
  ('Blood Pressure Monitor', 'Automatic digital blood pressure monitor for home use.', 1299.00, 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=400', 15, 'Equipment'),
  ('Hand Sanitizer 500ml', 'Kills 99.9% germs. Alcohol-based hand sanitizer with moisturizer.', 120.00, 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400', 200, 'Hygiene'),
  ('N95 Face Mask (Pack of 5)', 'High filtration N95 face masks for protection against airborne particles.', 199.00, 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400', 150, 'Hygiene');

-- ============================================
-- IMPORTANT: After running this, sign up a user
-- and then manually set their role to 'admin':
--
-- UPDATE profiles SET user_role = 'admin' 
-- WHERE id = 'YOUR_USER_UUID_HERE';
-- ============================================

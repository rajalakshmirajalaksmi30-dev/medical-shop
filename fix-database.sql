-- =============================================
-- NUCLEAR FIX: Completely reset ALL RLS policies
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Disable RLS temporarily on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (even ones we don't know about)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'products', 'orders')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
        RAISE NOTICE 'Dropped policy: % on %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- Step 3: Drop any remaining is_admin function
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 5: Create fresh, SAFE policies for PROFILES
CREATE POLICY "profiles_select_own" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles 
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Step 6: Create fresh, SAFE policies for PRODUCTS
CREATE POLICY "products_select_all" ON products 
  FOR SELECT USING (true);

CREATE POLICY "products_insert_admin" ON products 
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

CREATE POLICY "products_update_admin" ON products 
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

CREATE POLICY "products_delete_admin" ON products 
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

-- Step 7: Create fresh, SAFE policies for ORDERS
CREATE POLICY "orders_select_own_or_admin" ON orders 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

CREATE POLICY "orders_insert_own" ON orders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_admin" ON orders 
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'user_role') = 'admin'
  );

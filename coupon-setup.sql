-- ============================================
-- Shantha Krish Medicals - Coupon System Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),
  applicable_categories TEXT[] DEFAULT '{}',
  expiry_date TIMESTAMPTZ NOT NULL,
  total_usage_limit INTEGER,
  per_user_limit INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add coupon fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- 4. Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Coupons

-- Everyone can view active coupons
CREATE POLICY "Active coupons are viewable by everyone"
  ON coupons FOR SELECT USING (true);

-- Only admins can create coupons
CREATE POLICY "Admins can insert coupons"
  ON coupons FOR INSERT WITH CHECK (is_admin());

-- Only admins can update coupons
CREATE POLICY "Admins can update coupons"
  ON coupons FOR UPDATE USING (is_admin());

-- Only admins can delete coupons
CREATE POLICY "Admins can delete coupons"
  ON coupons FOR DELETE USING (is_admin());

-- 6. RLS Policies for Coupon Usage

-- Users can see their own usage
CREATE POLICY "Users can view own coupon usage"
  ON coupon_usage FOR SELECT USING (
    auth.uid() = user_id OR is_admin()
  );

-- Authenticated users can insert usage records
CREATE POLICY "Authenticated users can insert coupon usage"
  ON coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all usage records
CREATE POLICY "Admins can manage coupon usage"
  ON coupon_usage FOR ALL USING (is_admin());

-- 7. Sample coupons (optional)
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, applicable_categories, expiry_date, total_usage_limit, per_user_limit, status)
VALUES
  ('WELCOME10', 'percentage', 10, 100, 50, '{}', NOW() + INTERVAL '90 days', 1000, 1, true),
  ('FLAT50', 'flat', 50, 300, NULL, '{}', NOW() + INTERVAL '30 days', 500, 2, true),
  ('TABLET20', 'percentage', 20, 200, 100, '{Tablets}', NOW() + INTERVAL '60 days', 200, 1, true),
  ('SAVE100', 'flat', 100, 500, NULL, '{}', NOW() + INTERVAL '45 days', 100, 1, true);

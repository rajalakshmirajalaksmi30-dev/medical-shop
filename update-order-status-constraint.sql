-- Run this in your Supabase SQL Editor
-- This updates the allowed order statuses to include the new ones (processing, shipped, etc.)

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN (
  'pending', 
  'paid', 
  'processing', 
  'shipped', 
  'delivered', 
  'cancelled', 
  'failed'
));

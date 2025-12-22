-- Add Stripe settings columns to site_settings table
-- Run this SQL in Supabase SQL Editor

-- Add Stripe publishable key column
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT;

-- Add Stripe mode column (test or live)
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS stripe_mode TEXT DEFAULT 'test' CHECK (stripe_mode IN ('test', 'live'));

-- Add comment
COMMENT ON COLUMN site_settings.stripe_publishable_key IS 'Stripe publishable API key';
COMMENT ON COLUMN site_settings.stripe_mode IS 'Stripe mode: test or live';

-- Update existing row with default values if exists
UPDATE site_settings 
SET 
  stripe_publishable_key = COALESCE(stripe_publishable_key, ''),
  stripe_mode = COALESCE(stripe_mode, 'test')
WHERE id = 1;

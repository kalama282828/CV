-- Payments Table for Stripe Integration
-- Run this SQL in Supabase SQL Editor

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'try',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Anyone can check payment by email" ON payments;
DROP POLICY IF EXISTS "Service role full access" ON payments;
DROP POLICY IF EXISTS "Allow insert for checkout" ON payments;
DROP POLICY IF EXISTS "Allow update for webhooks" ON payments;

-- RLS Policies (simplified for public access since payments need to be checked by email)

-- Allow anyone to read payments (needed for checking payment status by email)
CREATE POLICY "Public read access" ON payments
  FOR SELECT
  USING (true);

-- Allow insert for checkout session creation
CREATE POLICY "Allow insert for checkout" ON payments
  FOR INSERT
  WITH CHECK (true);

-- Allow update for webhook status updates
CREATE POLICY "Allow update for webhooks" ON payments
  FOR UPDATE
  USING (true);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS payments_updated_at ON payments;
DROP FUNCTION IF EXISTS update_payments_updated_at();

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Add comment
COMMENT ON TABLE payments IS 'Stripe payment records for CV Builder';

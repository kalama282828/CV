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

-- RLS Policies

-- Users can view their own payments (by user_id or email)
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow anonymous users to check payment by email (for non-logged in users)
CREATE POLICY "Anyone can check payment by email" ON payments
  FOR SELECT
  USING (true);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access" ON payments
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow insert for checkout session creation
CREATE POLICY "Allow insert for checkout" ON payments
  FOR INSERT
  WITH CHECK (true);

-- Allow update for webhook status updates
CREATE POLICY "Allow update for webhooks" ON payments
  FOR UPDATE
  USING (true);

-- Create updated_at trigger
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

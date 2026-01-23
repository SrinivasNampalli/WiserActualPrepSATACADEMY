-- SQL Migration for Premium Subscription Support
-- Run this in your Supabase SQL Editor

-- Add subscription columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ;

-- Create usage_limits table for tracking feature usage
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    reset_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature, reset_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_date 
ON usage_limits(user_id, reset_date);

-- Enable RLS on usage_limits
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/modify their own usage
CREATE POLICY IF NOT EXISTS "Users can view own usage" 
ON usage_limits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own usage" 
ON usage_limits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own usage" 
ON usage_limits FOR UPDATE 
USING (auth.uid() = user_id);

-- Grant service role full access for webhook updates
GRANT ALL ON profiles TO service_role;
GRANT ALL ON usage_limits TO service_role;

-- =====================================================
-- 007: Add Subscription Fields to Profiles
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN GENERATED ALWAYS AS (subscription_tier = 'premium') STORED,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster premium user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- =====================================================
-- Update RLS policies to allow reading subscription status
-- =====================================================

-- Allow users to read their own subscription status (already covered by existing policy)
-- No changes needed as "Users can view their own profile" policy covers this

-- =====================================================
-- Create subscriptions table for tracking subscription history
-- (Useful for Stripe webhook handling)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
    plan_id TEXT NOT NULL DEFAULT 'premium-plan',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for Stripe webhooks)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- =====================================================
-- Create usage_limits table for tracking daily limits
-- =====================================================

CREATE TABLE IF NOT EXISTS public.usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- 'ai_solver', 'ai_summarizer', 'flashcard_generation'
    usage_count INTEGER DEFAULT 0,
    reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature, reset_date)
);

-- Enable RLS on usage_limits table
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own usage
CREATE POLICY "Users can view their own usage" ON public.usage_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.usage_limits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.usage_limits
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- Verify changes
-- =====================================================

SELECT 
    column_name, 
    data_type, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_tier', 'is_premium', 'stripe_customer_id', 'subscription_expires_at');

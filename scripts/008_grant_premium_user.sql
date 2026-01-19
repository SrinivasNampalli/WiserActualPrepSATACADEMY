-- =====================================================
-- 008: Grant Premium to srinivarma9@gmail.com
-- Run this in Supabase SQL Editor AFTER running 007
-- =====================================================

-- Update the user's subscription tier to premium
UPDATE public.profiles
SET 
    subscription_tier = 'premium',
    subscription_expires_at = NULL -- No expiration (lifetime or manual)
WHERE email = 'srinivarma9@gmail.com';

-- Verify the update
SELECT 
    email, 
    full_name,
    subscription_tier, 
    is_premium,
    subscription_expires_at
FROM public.profiles 
WHERE email = 'srinivarma9@gmail.com';

-- If you need to grant premium to multiple users, use:
-- UPDATE public.profiles
-- SET subscription_tier = 'premium'
-- WHERE email IN ('user1@example.com', 'user2@example.com');

-- This script should be run manually to grant admin access to a specific user
-- Replace 'YOUR_USER_EMAIL_HERE' with the actual email address

-- To make a user an admin, update their profile:
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE email = 'YOUR_USER_EMAIL_HERE';

-- Example usage:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'admin@example.com';

-- Note: After signup, you can run this in the Supabase SQL editor
-- or create a secure server action to promote users to admin

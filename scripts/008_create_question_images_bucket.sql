-- Storage Bucket Setup for Question Images
-- Run this in your Supabase SQL Editor AFTER running the previous script

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'question-images',
    'question-images',
    true,
    5242880,  -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

-- Allow public read access to all images in the bucket
CREATE POLICY IF NOT EXISTS "Public read access for question images"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-images');

-- Allow authenticated uploads (or you can make it more restrictive)
CREATE POLICY IF NOT EXISTS "Allow uploads to question-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'question-images');

-- Allow updates (for upsert functionality)
CREATE POLICY IF NOT EXISTS "Allow updates to question-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'question-images');

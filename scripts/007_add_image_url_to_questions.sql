-- Add image_url column to questions table
-- Run this in your Supabase SQL Editor

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN questions.image_url IS 'Optional URL to an image displayed above the question text';

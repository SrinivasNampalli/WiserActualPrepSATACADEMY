-- Add explanation column to questions table
-- Run this in your Supabase SQL Editor

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS explanation TEXT DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN questions.explanation IS 'Explanation text shown when reviewing answers after test submission';

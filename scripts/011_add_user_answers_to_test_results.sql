-- Add user_answers column to test_results table to store user responses
-- This enables the mistake log feature to show what the user answered vs correct answer
-- Run this in your Supabase SQL Editor

ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS user_answers JSONB DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN test_results.user_answers IS 'JSONB object mapping question_id to user selected answer (e.g., {"uuid1": "A", "uuid2": "C"})';

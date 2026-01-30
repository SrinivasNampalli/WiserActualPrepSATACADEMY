
-- Add user_answers column to test_results table
ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS user_answers JSONB DEFAULT '{}'::jsonb;

-- Reload schema cache (notify PostgREST)
NOTIFY pgrst, 'reload config';

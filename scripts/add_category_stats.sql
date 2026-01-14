-- =====================================================
-- Add category_stats column to test_results table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add category_stats JSONB column to store per-category performance
ALTER TABLE public.test_results 
ADD COLUMN IF NOT EXISTS category_stats JSONB DEFAULT '{}';

-- Add correct_answers and total_questions columns if they don't exist
ALTER TABLE public.test_results 
ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0;

ALTER TABLE public.test_results 
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;

-- Create an index on category_stats for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_test_results_category_stats 
ON public.test_results USING GIN (category_stats);

-- Comment explaining the structure
COMMENT ON COLUMN public.test_results.category_stats IS 
'JSONB storing per-category performance. Structure: {"category_id": {"correct": number, "total": number}, ...}';

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'test_results' 
AND column_name IN ('category_stats', 'correct_answers', 'total_questions');

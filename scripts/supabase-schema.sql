-- =====================================================
-- SAT Prep Database Schema - Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create questions table (stores individual questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text text NOT NULL,
    options text[] DEFAULT '{}',
    correct_answer text NOT NULL,
    category text DEFAULT 'general',
    difficulty text DEFAULT 'medium',
    question_type text DEFAULT 'multiple_choice',
    explanation text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Create test_questions table (links tests to questions)
CREATE TABLE IF NOT EXISTS public.test_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question_id ON public.test_questions(question_id);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read questions
CREATE POLICY "Allow authenticated read questions" ON public.questions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role (admin) full access to questions
CREATE POLICY "Allow service role all on questions" ON public.questions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Enable RLS on test_questions table
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read test_questions
CREATE POLICY "Allow authenticated read test_questions" ON public.test_questions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role (admin) full access to test_questions
CREATE POLICY "Allow service role all on test_questions" ON public.test_questions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- Verify tables were created
-- =====================================================
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('questions', 'test_questions', 'tests');

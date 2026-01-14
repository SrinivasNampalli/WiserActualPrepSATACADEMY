-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tests table for storing test information
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL, -- 'practice', 'mock', 'diagnostic'
  title TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table for storing test scores
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  math_score INTEGER,
  reading_score INTEGER,
  writing_score INTEGER,
  time_taken_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table for course content
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'math', 'reading', 'writing'
  difficulty TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_content table for storing scraped content
CREATE TABLE IF NOT EXISTS public.course_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'video', 'article', 'practice'
  title TEXT NOT NULL,
  url TEXT,
  summary TEXT,
  key_points JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_course_progress table
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create summarizer_history table for AI summarizations
CREATE TABLE IF NOT EXISTS public.summarizer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  summarized_text TEXT NOT NULL,
  content_source TEXT, -- URL or identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summarizer_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for tests (users can view their own tests)
CREATE POLICY "Users can view their own tests" ON public.tests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tests" ON public.tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for test_results
CREATE POLICY "Users can view their own test results" ON public.test_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own test results" ON public.test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for courses (public read access)
CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT USING (true);

-- RLS Policies for course_content (public read access)
CREATE POLICY "Anyone can view course content" ON public.course_content
  FOR SELECT USING (true);

-- RLS Policies for user_course_progress
CREATE POLICY "Users can view their own progress" ON public.user_course_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for summarizer_history
CREATE POLICY "Users can view their own summarizations" ON public.summarizer_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own summarizations" ON public.summarizer_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

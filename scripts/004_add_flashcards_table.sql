-- Create flashcard_sets table for storing generated flashcard sets
CREATE TABLE IF NOT EXISTS public.flashcard_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  course_level TEXT NOT NULL, -- 'AP', 'SAT', 'College'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table for individual flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_flashcard_progress table for tracking study progress
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  confidence_level INTEGER DEFAULT 0, -- 0-5 scale
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_reviewed INTEGER DEFAULT 0,
  UNIQUE(user_id, flashcard_id)
);

-- Enable Row Level Security
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flashcard_sets
CREATE POLICY "Users can view their own flashcard sets" ON public.flashcard_sets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own flashcard sets" ON public.flashcard_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flashcard sets" ON public.flashcard_sets
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for flashcards
CREATE POLICY "Users can view flashcards from their sets" ON public.flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets
      WHERE flashcard_sets.id = flashcards.set_id
      AND flashcard_sets.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert flashcards to their sets" ON public.flashcards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets
      WHERE flashcard_sets.id = flashcards.set_id
      AND flashcard_sets.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete flashcards from their sets" ON public.flashcards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets
      WHERE flashcard_sets.id = flashcards.set_id
      AND flashcard_sets.user_id = auth.uid()
    )
  );

-- RLS Policies for user_flashcard_progress
CREATE POLICY "Users can view their own flashcard progress" ON public.user_flashcard_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own flashcard progress" ON public.user_flashcard_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard progress" ON public.user_flashcard_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Seed sample courses
INSERT INTO public.courses (id, title, description, category, difficulty) VALUES
  ('11111111-1111-1111-1111-111111111111', 'SAT Math Fundamentals', 'Master the core math concepts tested on the SAT', 'math', 'beginner'),
  ('22222222-2222-2222-2222-222222222222', 'Advanced Algebra Techniques', 'Advanced strategies for SAT algebra questions', 'math', 'advanced'),
  ('33333333-3333-3333-3333-333333333333', 'Reading Comprehension Mastery', 'Improve your reading speed and comprehension', 'reading', 'intermediate'),
  ('44444444-4444-4444-4444-444444444444', 'Grammar and Writing Essentials', 'Perfect your grammar for the SAT writing section', 'writing', 'beginner'),
  ('55555555-5555-5555-5555-555555555555', 'SAT Math Problem Solving', 'Strategic approaches to complex SAT math problems', 'math', 'intermediate'),
  ('66666666-6666-6666-6666-666666666666', 'Critical Reading Strategies', 'Advanced techniques for analyzing passages', 'reading', 'advanced')
ON CONFLICT (id) DO NOTHING;

-- Seed sample course content
INSERT INTO public.course_content (course_id, content_type, title, url, summary, key_points) VALUES
  ('11111111-1111-1111-1111-111111111111', 'video', 'Introduction to SAT Math', 'https://www.youtube.com/watch?v=example1', 
   'This video covers the basics of SAT math including algebra, geometry, and data analysis.',
   '["Understand the test format", "Learn time management", "Master basic formulas", "Practice with sample questions"]'::jsonb),
  
  ('11111111-1111-1111-1111-111111111111', 'article', 'Essential Math Formulas', 'https://example.com/sat-math-formulas',
   'A comprehensive guide to all the math formulas you need to memorize for the SAT.',
   '["Quadratic formula", "Area and perimeter formulas", "Triangle properties", "Circle equations"]'::jsonb),
  
  ('22222222-2222-2222-2222-222222222222', 'video', 'Advanced Algebra Concepts', 'https://www.youtube.com/watch?v=example2',
   'Deep dive into complex algebraic concepts including systems of equations and inequalities.',
   '["Systems of equations", "Polynomial functions", "Rational expressions", "Complex numbers"]'::jsonb),
  
  ('33333333-3333-3333-3333-333333333333', 'video', 'Speed Reading Techniques', 'https://www.youtube.com/watch?v=example3',
   'Learn how to read SAT passages faster while maintaining comprehension.',
   '["Skimming strategies", "Active reading", "Annotation techniques", "Time management"]'::jsonb),
  
  ('44444444-4444-4444-4444-444444444444', 'article', 'Common Grammar Mistakes', 'https://example.com/sat-grammar',
   'Identify and avoid the most common grammar errors tested on the SAT.',
   '["Subject-verb agreement", "Pronoun usage", "Punctuation rules", "Parallel structure"]'::jsonb),
  
  ('55555555-5555-5555-5555-555555555555', 'practice', 'Problem Solving Practice Set', 'https://example.com/practice-set',
   '50 challenging SAT math problems with detailed solutions.',
   '["Word problems", "Data interpretation", "Logic puzzles", "Advanced calculations"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed sample tests
INSERT INTO public.tests (id, user_id, test_type, title, total_questions, duration_minutes) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'diagnostic', 'Diagnostic Test - Math', 58, 70),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'diagnostic', 'Diagnostic Test - Reading & Writing', 54, 64),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'mock', 'Full Length SAT Practice Test', 154, 180)
ON CONFLICT DO NOTHING;

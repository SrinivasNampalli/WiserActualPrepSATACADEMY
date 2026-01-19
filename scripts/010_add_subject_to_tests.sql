-- Add subject column to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'full';

-- Update any existing tests that don't have a subject
UPDATE tests SET subject = 'full' WHERE subject IS NULL;

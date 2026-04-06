-- ============================================================
-- Add SRS algorithm fields to user_term_sm2 and user_term_progress
-- ============================================================

-- Add strength and session tracking to user_term_sm2
ALTER TABLE user_term_sm2
  ADD COLUMN IF NOT EXISTS strength REAL NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS correct_in_session INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS question_types_correct TEXT[] NOT NULL DEFAULT '{}';

-- Update user_term_progress status values: 'new' -> 'not_seen'
-- Also support the full set: not_seen, seen, learning, reinforced, learnt
UPDATE user_term_progress SET status = 'not_seen' WHERE status = 'new';

-- Ensure grants exist for user_term_sm2
GRANT SELECT, INSERT, UPDATE ON user_term_sm2 TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_term_progress TO anon, authenticated;

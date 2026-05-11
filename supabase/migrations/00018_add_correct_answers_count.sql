-- Add a proper correct_answers counter to user_stats
-- Previously the Badges page counted "distinct terms past 'seen' status",
-- which dramatically undercounts since lessons cap at 3 new terms per session.
-- A learner can answer 30 questions correctly but only have 3 distinct terms tracked.

ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS correct_answers INT NOT NULL DEFAULT 0;

-- Backfill from existing XP events.
-- Average ~7 XP per correct answer (MC=5, free-type=10).
-- This gives historical learners a fair starting count.
UPDATE user_stats us
SET correct_answers = GREATEST(
  COALESCE((
    SELECT FLOOR(SUM(xe.xp_amount) / 7.0)::INT
    FROM xp_events xe
    WHERE xe.user_id = us.user_id
      AND xe.source_type = 'lesson'
  ), 0),
  us.correct_answers
)
WHERE us.correct_answers = 0;

-- Table for cross-device lesson session resume (from previous commit)
CREATE TABLE IF NOT EXISTS user_lesson_sessions (
  user_id            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_id         INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  queue_index        INT NOT NULL DEFAULT 0,
  queue              INT[] NOT NULL DEFAULT '{}',
  new_flashcard_count INT NOT NULL DEFAULT 0,
  current_mode       TEXT NOT NULL DEFAULT 'flashcard',
  current_term_id    INT,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subunit_id)
);

ALTER TABLE user_lesson_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_lesson_sessions' AND policyname = 'Users manage own sessions') THEN
    CREATE POLICY "Users manage own sessions" ON user_lesson_sessions
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_lesson_sessions TO anon, authenticated;

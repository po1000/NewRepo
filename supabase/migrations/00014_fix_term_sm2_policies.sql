-- ============================================================
-- FIX: Ensure user_term_sm2 has user_id + term_id columns
-- and RLS policies so the SRS can actually read/write data.
--
-- The original schema may have only user_term_progress_id (FK).
-- The app code upserts with (user_id, term_id), so we need
-- those columns. This migration handles BOTH cases:
--   A) Table already has user_id/term_id → just add RLS
--   B) Table only has user_term_progress_id → add columns,
--      back-fill from user_term_progress, add unique + RLS
-- ============================================================

-- Step 1: Add user_id and term_id if they don't exist
ALTER TABLE user_term_sm2
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS term_id INT REFERENCES terms(term_id) ON DELETE CASCADE;

-- Step 2: Back-fill from user_term_progress (if user_term_progress_id exists)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_term_sm2' AND column_name = 'user_term_progress_id'
  ) THEN
    UPDATE user_term_sm2 s
       SET user_id = p.user_id,
           term_id = p.term_id
      FROM user_term_progress p
     WHERE s.user_term_progress_id = p.progress_id
       AND s.user_id IS NULL;
  END IF;
END $$;

-- Step 3: Add unique constraint if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'user_term_sm2'::regclass AND conname = 'user_term_sm2_user_id_term_id_key'
  ) THEN
    ALTER TABLE user_term_sm2 ADD CONSTRAINT user_term_sm2_user_id_term_id_key UNIQUE (user_id, term_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Step 4: Add strength + session columns if missing (from migration 00007)
ALTER TABLE user_term_sm2
  ADD COLUMN IF NOT EXISTS strength REAL NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS correct_in_session INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS question_types_correct TEXT[] NOT NULL DEFAULT '{}';

-- Step 5: Enable RLS + add policies
ALTER TABLE user_term_sm2 ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_sm2' AND policyname = 'Users can read own sm2') THEN
    CREATE POLICY "Users can read own sm2" ON user_term_sm2 FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_sm2' AND policyname = 'Users can insert own sm2') THEN
    CREATE POLICY "Users can insert own sm2" ON user_term_sm2 FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_sm2' AND policyname = 'Users can update own sm2') THEN
    CREATE POLICY "Users can update own sm2" ON user_term_sm2 FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Step 6: Grants
GRANT SELECT, INSERT, UPDATE ON user_term_sm2 TO anon, authenticated;

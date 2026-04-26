-- ============================================================
-- Schema verification: ensure ALL columns the app code expects
-- exist on user-related tables. Idempotent — safe to re-run.
--
-- This fixes the 400 errors from PostgREST when columns are missing.
-- ============================================================

-- ─── user_stats ────────────────────────────────────────────
ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS total_xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lessons_completed INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hearts INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'user_stats'::regclass AND conname = 'user_stats_user_id_key'
  ) THEN
    BEGIN
      ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_key UNIQUE (user_id);
    EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'Users can read own stats') THEN
    CREATE POLICY "Users can read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'Users can insert own stats') THEN
    CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'Users can update own stats') THEN
    CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON user_stats TO authenticated, anon;


-- ─── user_term_progress ────────────────────────────────────
ALTER TABLE user_term_progress
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_seen',
  ADD COLUMN IF NOT EXISTS correct_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS incorrect_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE user_term_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_progress' AND policyname = 'Users can read own progress') THEN
    CREATE POLICY "Users can read own progress" ON user_term_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_progress' AND policyname = 'Users can insert own progress') THEN
    CREATE POLICY "Users can insert own progress" ON user_term_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_progress' AND policyname = 'Users can update own progress') THEN
    CREATE POLICY "Users can update own progress" ON user_term_progress FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON user_term_progress TO authenticated, anon;


-- ─── user_term_sm2 ────────────────────────────────────────
ALTER TABLE user_term_sm2
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS term_id INT REFERENCES terms(term_id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS easiness_factor REAL NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS interval_days INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repetitions INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_review_date DATE,
  ADD COLUMN IF NOT EXISTS last_quality INT,
  ADD COLUMN IF NOT EXISTS strength REAL NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS correct_in_session INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS question_types_correct TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Back-fill from user_term_progress if user_id null (legacy schema may use FK only)
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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'user_term_sm2'::regclass AND conname = 'user_term_sm2_user_id_term_id_key'
  ) THEN
    BEGIN
      ALTER TABLE user_term_sm2 ADD CONSTRAINT user_term_sm2_user_id_term_id_key UNIQUE (user_id, term_id);
    EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

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

GRANT SELECT, INSERT, UPDATE ON user_term_sm2 TO authenticated, anon;


-- ─── user_badges ──────────────────────────────────────────
ALTER TABLE user_badges
  ADD COLUMN IF NOT EXISTS earned_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'user_badges'::regclass AND conname = 'user_badges_user_id_badge_id_key'
  ) THEN
    BEGIN
      ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);
    EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can read own badges') THEN
    CREATE POLICY "Users can read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can insert own badges') THEN
    CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can delete own badges') THEN
    CREATE POLICY "Users can delete own badges" ON user_badges FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT, INSERT, DELETE ON user_badges TO authenticated, anon;


-- ─── Force PostgREST schema cache reload ──────────────────
NOTIFY pgrst, 'reload schema';

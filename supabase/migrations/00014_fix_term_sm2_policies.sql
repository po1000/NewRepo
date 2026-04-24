-- ============================================================
-- FIX: Add missing RLS policies for user_term_sm2
-- Without these, SRS saves fail silently and progress bars never update
-- ============================================================

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

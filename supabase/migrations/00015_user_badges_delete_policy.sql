-- ============================================================
-- Add DELETE + SELECT policies for user_badges
-- Needed so the badges page can clean up orphan badges
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can delete own badges') THEN
    CREATE POLICY "Users can delete own badges" ON user_badges FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can read own badges') THEN
    CREATE POLICY "Users can read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT, INSERT, DELETE ON user_badges TO authenticated;

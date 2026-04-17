-- ============================================================
-- FIX: Add missing INSERT policy for user_badges
-- Without this, badge awarding from the app fails silently
-- because RLS blocks the INSERT despite GRANT permissions.
-- ============================================================

-- Add INSERT policy for user_badges (users can earn their own badges)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can insert own badges') THEN
    CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Also ensure xp_events has RLS + INSERT policy (may not have been enabled)
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_events' AND policyname = 'Users can insert own xp events') THEN
    CREATE POLICY "Users can insert own xp events" ON xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_events' AND policyname = 'Users can read own xp events') THEN
    CREATE POLICY "Users can read own xp events" ON xp_events FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- FIX: Align badges table schema with seed data + frontend
-- Original schema: name, image_url, xp_required
-- Required: label, icon_url, criteria_type, criteria_value
-- ============================================================

-- Add missing columns (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'label') THEN
    ALTER TABLE badges ADD COLUMN label TEXT;
    -- Copy existing name values
    UPDATE badges SET label = name;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'icon_url') THEN
    ALTER TABLE badges ADD COLUMN icon_url TEXT;
    -- Copy existing image_url values
    UPDATE badges SET icon_url = image_url;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'criteria_type') THEN
    ALTER TABLE badges ADD COLUMN criteria_type TEXT NOT NULL DEFAULT 'lessons_completed';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'criteria_value') THEN
    ALTER TABLE badges ADD COLUMN criteria_value INT NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Ensure RLS policies allow reading
GRANT SELECT ON badges TO anon, authenticated;
GRANT SELECT, INSERT ON user_badges TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_stats TO anon, authenticated;

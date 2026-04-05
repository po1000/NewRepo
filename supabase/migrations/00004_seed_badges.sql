-- ============================================================
-- SEED: Badge definitions
-- ============================================================

DELETE FROM user_badges;
DELETE FROM badges;

INSERT INTO badges (name, description, image_url, xp_required) VALUES
  ('First Steps', 'Complete your first lesson', NULL, 0),
  ('7-Day Streak', 'Study for 7 days in a row', NULL, 0),
  ('Word Collector', 'Correctly answer 10 lesson questions', NULL, 0),
  ('Word Collector II', 'Correctly answer 50 lesson questions', NULL, 0);

-- ============================================================
-- RLS: ensure badges + user_badges are readable
-- ============================================================

-- Grant access (safe to re-run, will error harmlessly if already granted)
GRANT SELECT ON badges TO anon, authenticated;
GRANT SELECT, INSERT ON user_badges TO anon, authenticated;
GRANT SELECT, INSERT ON xp_events TO anon, authenticated;

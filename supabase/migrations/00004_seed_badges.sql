-- ============================================================
-- SEED: Badge definitions
-- ============================================================

DELETE FROM user_badges;
DELETE FROM badges;

INSERT INTO badges (label, description, criteria_type, criteria_value) VALUES
  ('First Steps', 'Complete your first lesson', 'lessons_completed', 1),
  ('7-Day Streak', 'Study for 7 days in a row', 'streak_days', 7),
  ('Word Collector', 'Correctly answer 10 lesson questions', 'correct_answers', 10),
  ('Word Collector II', 'Correctly answer 50 lesson questions', 'correct_answers', 50);

-- ============================================================
-- RLS: ensure badges + user_badges are readable
-- ============================================================

-- Grant access (safe to re-run, will error harmlessly if already granted)
GRANT SELECT ON badges TO anon, authenticated;
GRANT SELECT, INSERT ON user_badges TO anon, authenticated;
GRANT SELECT, INSERT ON xp_events TO anon, authenticated;

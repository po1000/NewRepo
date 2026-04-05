-- ============================================================
-- SEED: Badge definitions
-- ============================================================

DELETE FROM user_badges;
DELETE FROM badges;

INSERT INTO badges (label, description, icon_url, criteria_type, criteria_value) VALUES
  ('First Steps', 'Complete your first lesson', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/badges/first-steps.svg', 'lessons_completed', 1),
  ('7-Day Streak', 'Study for 7 days in a row', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/badges/seven-day-streak.svg', 'streak_days', 7),
  ('Word Collector', 'Correctly answer 10 lesson questions', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/badges/word-collector.svg', 'correct_answers', 10),
  ('Word Collector II', 'Correctly answer 50 lesson questions', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/badges/word-collector-II.svg', 'correct_answers', 50);

-- ============================================================
-- RLS: ensure badges + user_badges are readable
-- ============================================================

GRANT SELECT ON badges TO anon, authenticated;
GRANT SELECT, INSERT ON user_badges TO anon, authenticated;
GRANT SELECT, INSERT ON xp_events TO anon, authenticated;

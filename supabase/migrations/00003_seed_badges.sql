-- Migration: 00003_seed_badges
-- Description: Seed badge definitions and ensure grants on gamification tables.

-- ============================================================
-- Badges
-- ============================================================
INSERT INTO badges (label, description, icon_url, criteria_type, criteria_value) VALUES
    ('First Steps',       'Complete your first lesson.',              NULL, 'lessons_completed', 1),
    ('7-Day Streak',      'Study for 7 days in a row.',              NULL, 'streak_days',       7),
    ('Word Collector',    'Correctly answer 10 lesson questions.',    NULL, 'correct_answers',   10),
    ('Word Collector II', 'Correctly answer 50 lesson questions.',    NULL, 'correct_answers',   50);

-- ============================================================
-- GRANT permissions on gamification-related tables
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON badges      TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON user_badges TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON xp_events   TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON user_stats  TO authenticated, anon;

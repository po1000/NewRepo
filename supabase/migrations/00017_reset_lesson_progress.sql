-- ============================================================
-- RESET all lesson progress for a fresh test run.
-- Run this in Supabase SQL Editor to wipe progress data.
--
-- NOTE: Replace <YOUR_USER_ID> with your actual auth.uid()
-- or remove the WHERE clauses to reset ALL users.
-- ============================================================

-- Option A: Reset ALL users (uncomment and run these):
DELETE FROM user_term_sm2;
DELETE FROM user_term_progress;
DELETE FROM user_badges;
DELETE FROM user_stats;
DELETE FROM xp_events;

-- Option B: Reset a SINGLE user (comment out Option A, then uncomment these):
-- DELETE FROM user_term_sm2     WHERE user_id = '<YOUR_USER_ID>';
-- DELETE FROM user_term_progress WHERE user_id = '<YOUR_USER_ID>';
-- DELETE FROM user_badges       WHERE user_id = '<YOUR_USER_ID>';
-- DELETE FROM user_stats        WHERE user_id = '<YOUR_USER_ID>';
-- DELETE FROM xp_events         WHERE user_id = '<YOUR_USER_ID>';

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

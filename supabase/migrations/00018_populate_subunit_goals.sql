-- ============================================================
-- Migration 00018: Populate goal_text for all subunits
-- ============================================================
-- Adds the "I can..." goal statement that appears under the
-- subunit title in the Words & Phrases modal.
-- Idempotent — safe to re-run.
-- ============================================================

-- Ensure column exists (defensive — schema may already have it)
ALTER TABLE subunits ADD COLUMN IF NOT EXISTS goal_text TEXT;

-- ─── A1 (cefr_level_id = 1) ────────────────────────────────
UPDATE subunits SET goal_text =
  'I can greet people appropriately at different times of day and ask how they are.'
  WHERE subunit_code = '1.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 1 AND unit_number = 1);

UPDATE subunits SET goal_text =
  'I can introduce myself and others and respond when someone introduces themselves to me.'
  WHERE subunit_code = '1.2'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 1 AND unit_number = 1);

UPDATE subunits SET goal_text =
  'I can ask someone to speak more slowly, repeat something, or explain what a word means.'
  WHERE subunit_code = '2.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 1 AND unit_number = 2);

UPDATE subunits SET goal_text =
  'I can ask for help in an emergency and say what I need.'
  WHERE subunit_code = '2.2'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 1 AND unit_number = 2);

UPDATE subunits SET goal_text =
  'I can order food and drinks and make polite requests in cafés and restaurants.'
  WHERE subunit_code = '3.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 1 AND unit_number = 3);

UPDATE subunits SET goal_text =
  'I can ask where places are and understand simple directions to get to a destination.'
  WHERE subunit_code = '4.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 1 AND unit_number = 4);

-- ─── A2 (cefr_level_id = 2) ────────────────────────────────
UPDATE subunits SET goal_text =
  'I can describe family members and friends, including their personality.'
  WHERE subunit_code = '1.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 2 AND unit_number = 1);

UPDATE subunits SET goal_text =
  'I can say how often I do things.'
  WHERE subunit_code = '2.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 2 AND unit_number = 2);

UPDATE subunits SET goal_text =
  'I can talk about what I did recently using simple past tense.'
  WHERE subunit_code = '3.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 2 AND unit_number = 3);

UPDATE subunits SET goal_text =
  'I can ask how to pay and use a cash machine.'
  WHERE subunit_code = '4.1'
    AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 2 AND unit_number = 4);

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

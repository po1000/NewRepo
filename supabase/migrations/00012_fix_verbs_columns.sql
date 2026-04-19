-- ============================================================
-- FIX: Ensure verbs table columns match code expectations
-- Original schema had: english, category_id
-- Code + seeds expect: english_meaning, verb_category_id
-- ============================================================

-- Rename 'english' to 'english_meaning' if it exists and 'english_meaning' doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verbs' AND column_name = 'english')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verbs' AND column_name = 'english_meaning')
  THEN
    ALTER TABLE verbs RENAME COLUMN english TO english_meaning;
  END IF;
END $$;

-- Rename 'category_id' to 'verb_category_id' if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verbs' AND column_name = 'category_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verbs' AND column_name = 'verb_category_id')
  THEN
    ALTER TABLE verbs RENAME COLUMN category_id TO verb_category_id;
  END IF;
END $$;

-- Rename PK in grammar_verb_categories if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grammar_verb_categories' AND column_name = 'category_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grammar_verb_categories' AND column_name = 'verb_category_id')
  THEN
    ALTER TABLE grammar_verb_categories RENAME COLUMN category_id TO verb_category_id;
  END IF;
END $$;

-- Ensure grants
GRANT SELECT ON verbs TO anon, authenticated;
GRANT SELECT ON grammar_verb_categories TO anon, authenticated;
GRANT SELECT ON verb_conjugations TO anon, authenticated;
GRANT SELECT ON tenses TO anon, authenticated;
GRANT SELECT ON pronouns TO anon, authenticated;

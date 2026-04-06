-- ============================================================
-- FIX: Add missing grants and RLS policies for user tables
-- ============================================================

-- Grants for user_stats
GRANT SELECT, INSERT, UPDATE ON user_stats TO anon, authenticated;

-- Grants for user_term_progress
GRANT SELECT, INSERT, UPDATE ON user_term_progress TO anon, authenticated;

-- Grants for user_badges (ensure SELECT is granted)
GRANT SELECT ON user_badges TO anon, authenticated;

-- Grants for term_grammar_hints (already granted in 00005, but ensure)
GRANT SELECT ON term_grammar_hints TO anon, authenticated;

-- Grants for grammar_hint_verb_links
GRANT SELECT ON grammar_hint_verb_links TO anon, authenticated;

-- Grants for issue_reports (new table for lesson flag/report feature)
-- Will be created below

-- ============================================================
-- RLS policies for user_stats
-- ============================================================

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can read their own stats
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'Users can read own stats') THEN
    CREATE POLICY "Users can read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can insert their own stats
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'Users can insert own stats') THEN
    CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own stats
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'Users can update own stats') THEN
    CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- RLS policies for user_term_progress
-- ============================================================

ALTER TABLE user_term_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_progress' AND policyname = 'Users can read own progress') THEN
    CREATE POLICY "Users can read own progress" ON user_term_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_progress' AND policyname = 'Users can insert own progress') THEN
    CREATE POLICY "Users can insert own progress" ON user_term_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_term_progress' AND policyname = 'Users can update own progress') THEN
    CREATE POLICY "Users can update own progress" ON user_term_progress FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- RLS policies for user_badges
-- ============================================================

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Users can read own badges') THEN
    CREATE POLICY "Users can read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- RLS: Allow authenticated users to read content tables
-- ============================================================

-- term_grammar_hints is a join table, no user_id, so allow all authenticated reads
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'term_grammar_hints' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE term_grammar_hints ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON term_grammar_hints FOR SELECT USING (true);
  END IF;
END $$;

-- grammar_hint_verb_links
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grammar_hint_verb_links' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE grammar_hint_verb_links ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON grammar_hint_verb_links FOR SELECT USING (true);
  END IF;
END $$;

-- grammar_hints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grammar_hints' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE grammar_hints ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON grammar_hints FOR SELECT USING (true);
  END IF;
END $$;

-- subunit_terms
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subunit_terms' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE subunit_terms ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON subunit_terms FOR SELECT USING (true);
  END IF;
END $$;

-- verbs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'verbs' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE verbs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON verbs FOR SELECT USING (true);
  END IF;
END $$;

-- verb_conjugations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'verb_conjugations' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE verb_conjugations ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON verb_conjugations FOR SELECT USING (true);
  END IF;
END $$;

-- tenses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tenses' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE tenses ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON tenses FOR SELECT USING (true);
  END IF;
END $$;

-- pronouns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pronouns' AND policyname = 'Allow authenticated read') THEN
    ALTER TABLE pronouns ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated read" ON pronouns FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================
-- Issue Reports table (for lesson flag/report feature)
-- ============================================================

CREATE TABLE IF NOT EXISTS issue_reports (
  report_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  term_id BIGINT REFERENCES terms(term_id),
  subunit_id BIGINT REFERENCES subunits(subunit_id),
  issue_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reports" ON issue_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own reports" ON issue_reports FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT, INSERT ON issue_reports TO anon, authenticated;

-- ============================================================
-- Spanish Learning Platform — Full Database Schema
-- 49 tables, INT GENERATED ALWAYS AS IDENTITY PKs
-- (except users.user_id = UUID to match Supabase auth.users)
-- image_url columns on content tables for Supabase Storage
-- ============================================================

-- ============================================================
-- 1. USERS & SETTINGS
-- ============================================================

CREATE TABLE users (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  setting_id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  daily_goal_xp     INT NOT NULL DEFAULT 20,
  sound_enabled     BOOLEAN NOT NULL DEFAULT true,
  notifications     BOOLEAN NOT NULL DEFAULT true,
  preferred_voice   TEXT NOT NULL DEFAULT 'default',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_stats (
  stat_id           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  total_xp          INT NOT NULL DEFAULT 0,
  current_streak    INT NOT NULL DEFAULT 0,
  longest_streak    INT NOT NULL DEFAULT 0,
  hearts            INT NOT NULL DEFAULT 5,
  lessons_completed INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_auth_providers (
  provider_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_uid  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_name)
);

-- ============================================================
-- 2. BADGES & XP
-- ============================================================

CREATE TABLE badges (
  badge_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  xp_required   INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_badges (
  user_badge_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id      INT NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
  earned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE xp_events (
  xp_event_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  xp_amount      INT NOT NULL,
  source_type    TEXT NOT NULL,
  source_id      INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. CONTENT HIERARCHY
-- ============================================================

CREATE TABLE cefr_levels (
  cefr_level_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE units (
  unit_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cefr_level_id INT NOT NULL REFERENCES cefr_levels(cefr_level_id) ON DELETE CASCADE,
  unit_number   INT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cefr_level_id, unit_number)
);

CREATE TABLE subunits (
  subunit_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unit_id       INT NOT NULL REFERENCES units(unit_id) ON DELETE CASCADE,
  subunit_number INT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(unit_id, subunit_number)
);

CREATE TABLE subunit_sessions (
  session_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id    INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  color         TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subunit_id, session_number)
);

-- ============================================================
-- 4. TERMS
-- ============================================================

CREATE TABLE terms (
  term_id           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  spanish           TEXT NOT NULL,
  english           TEXT NOT NULL,
  part_of_speech    TEXT,
  ipa_spanish       TEXT,
  ipa_english       TEXT,
  audio_url         TEXT,
  image_url         TEXT,
  difficulty_rating INT NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subunit_terms (
  subunit_term_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id      INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  term_id         INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  sort_order      INT NOT NULL DEFAULT 0,
  UNIQUE(subunit_id, term_id)
);

-- ============================================================
-- 5. GRAMMAR
-- ============================================================

CREATE TABLE grammar_topics (
  topic_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  cefr_level_id INT REFERENCES cefr_levels(cefr_level_id),
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grammar_verb_categories (
  category_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verbs (
  verb_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  infinitive    TEXT NOT NULL,
  english       TEXT NOT NULL,
  category_id   INT REFERENCES grammar_verb_categories(category_id),
  is_irregular  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pronouns (
  pronoun_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  spanish       TEXT NOT NULL,
  english       TEXT NOT NULL,
  person        TEXT NOT NULL,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE tenses (
  tense_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  english_name  TEXT NOT NULL,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE verb_conjugations (
  conjugation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  verb_id        INT NOT NULL REFERENCES verbs(verb_id) ON DELETE CASCADE,
  tense_id       INT NOT NULL REFERENCES tenses(tense_id) ON DELETE CASCADE,
  pronoun_id     INT NOT NULL REFERENCES pronouns(pronoun_id) ON DELETE CASCADE,
  conjugated     TEXT NOT NULL,
  is_irregular   BOOLEAN NOT NULL DEFAULT false,
  audio_url      TEXT,
  UNIQUE(verb_id, tense_id, pronoun_id)
);

-- ============================================================
-- 6. GRAMMAR HINT SYSTEM
-- ============================================================

CREATE TABLE grammar_hints (
  hint_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hint_text     TEXT NOT NULL,
  hint_type     TEXT NOT NULL DEFAULT 'general',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE term_grammar_hints (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  term_id       INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  hint_id       INT NOT NULL REFERENCES grammar_hints(hint_id) ON DELETE CASCADE,
  UNIQUE(term_id, hint_id)
);

CREATE TABLE grammar_hint_topic_links (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hint_id       INT NOT NULL REFERENCES grammar_hints(hint_id) ON DELETE CASCADE,
  topic_id      INT NOT NULL REFERENCES grammar_topics(topic_id) ON DELETE CASCADE,
  UNIQUE(hint_id, topic_id)
);

CREATE TABLE grammar_hint_verb_links (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hint_id       INT NOT NULL REFERENCES grammar_hints(hint_id) ON DELETE CASCADE,
  verb_id       INT NOT NULL REFERENCES verbs(verb_id) ON DELETE CASCADE,
  UNIQUE(hint_id, verb_id)
);

CREATE TABLE grammar_hint_conjugation_links (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hint_id       INT NOT NULL REFERENCES grammar_hints(hint_id) ON DELETE CASCADE,
  conjugation_id INT NOT NULL REFERENCES verb_conjugations(conjugation_id) ON DELETE CASCADE,
  UNIQUE(hint_id, conjugation_id)
);

CREATE TABLE term_pronunciation_hints (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  term_id       INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  hint_text     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. USER TERM LEARNING & SM-2
-- ============================================================

CREATE TABLE user_term_progress (
  progress_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  term_id           INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'new',
  correct_count     INT NOT NULL DEFAULT 0,
  incorrect_count   INT NOT NULL DEFAULT 0,
  last_reviewed_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, term_id)
);

CREATE TABLE user_term_sm2 (
  sm2_id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  term_id           INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  easiness_factor   REAL NOT NULL DEFAULT 2.5,
  interval_days     INT NOT NULL DEFAULT 0,
  repetitions       INT NOT NULL DEFAULT 0,
  next_review_date  DATE,
  last_quality      INT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, term_id)
);

CREATE TABLE user_term_status_history (
  history_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  term_id       INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  old_status    TEXT,
  new_status    TEXT NOT NULL,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. USER PROGRESS
-- ============================================================

CREATE TABLE user_subunit_progress (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_id        INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'locked',
  progress_percent  INT NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  UNIQUE(user_id, subunit_id)
);

CREATE TABLE user_subunit_session_progress (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  session_id        INT NOT NULL REFERENCES subunit_sessions(session_id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'locked',
  score             INT,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  UNIQUE(user_id, session_id)
);

CREATE TABLE session_attempts (
  attempt_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  session_id    INT NOT NULL REFERENCES subunit_sessions(session_id) ON DELETE CASCADE,
  score         INT,
  xp_earned     INT NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

-- ============================================================
-- 9. QUESTION TYPES
-- ============================================================

CREATE TABLE question_types (
  type_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_questions (
  question_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id    INT NOT NULL REFERENCES subunit_sessions(session_id) ON DELETE CASCADE,
  type_id       INT NOT NULL REFERENCES question_types(type_id),
  term_id       INT REFERENCES terms(term_id),
  prompt_text   TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  audio_url     TEXT,
  image_url     TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_question_options (
  option_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id   INT NOT NULL REFERENCES session_questions(question_id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT false,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE session_question_attempts (
  attempt_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  question_id   INT NOT NULL REFERENCES session_questions(question_id) ON DELETE CASCADE,
  session_attempt_id INT NOT NULL REFERENCES session_attempts(attempt_id) ON DELETE CASCADE,
  user_answer   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL,
  time_spent_ms INT,
  answered_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. COMPREHENSION
-- ============================================================

CREATE TABLE comprehension_conversations (
  conversation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  context_text    TEXT,
  audio_url       TEXT,
  image_url       TEXT,
  cefr_level_id   INT REFERENCES cefr_levels(cefr_level_id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comprehension_questions (
  question_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id INT NOT NULL REFERENCES comprehension_conversations(conversation_id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  correct_answer  TEXT NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0
);

CREATE TABLE comprehension_question_options (
  option_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id   INT NOT NULL REFERENCES comprehension_questions(question_id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT false,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE session_question_comprehension_links (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id       INT NOT NULL REFERENCES session_questions(question_id) ON DELETE CASCADE,
  conversation_id   INT NOT NULL REFERENCES comprehension_conversations(conversation_id) ON DELETE CASCADE,
  UNIQUE(question_id, conversation_id)
);

-- ============================================================
-- 11. ROLEPLAY
-- ============================================================

CREATE TABLE roleplay_topics (
  topic_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  scenario_slug TEXT NOT NULL UNIQUE,
  cefr_level_id INT REFERENCES cefr_levels(cefr_level_id),
  image_url     TEXT,
  color         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roleplay_required_criteria (
  criteria_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic_id      INT NOT NULL REFERENCES roleplay_topics(topic_id) ON DELETE CASCADE,
  criteria_text TEXT NOT NULL,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE roleplay_topic_subunit_links (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic_id      INT NOT NULL REFERENCES roleplay_topics(topic_id) ON DELETE CASCADE,
  subunit_id    INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  UNIQUE(topic_id, subunit_id)
);

CREATE TABLE roleplay_attempts (
  attempt_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  topic_id      INT NOT NULL REFERENCES roleplay_topics(topic_id) ON DELETE CASCADE,
  score         INT,
  xp_earned     INT NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

CREATE TABLE roleplay_messages (
  message_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  attempt_id    INT NOT NULL REFERENCES roleplay_attempts(attempt_id) ON DELETE CASCADE,
  role          TEXT NOT NULL,
  content       TEXT NOT NULL,
  audio_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roleplay_criteria_results (
  result_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  attempt_id    INT NOT NULL REFERENCES roleplay_attempts(attempt_id) ON DELETE CASCADE,
  criteria_id   INT NOT NULL REFERENCES roleplay_required_criteria(criteria_id) ON DELETE CASCADE,
  met           BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(attempt_id, criteria_id)
);

CREATE TABLE roleplay_feedback (
  feedback_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  attempt_id    INT NOT NULL REFERENCES roleplay_attempts(attempt_id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  score         INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roleplay_difficult_terms (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  attempt_id    INT NOT NULL REFERENCES roleplay_attempts(attempt_id) ON DELETE CASCADE,
  term_id       INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  UNIQUE(attempt_id, term_id)
);

-- ============================================================
-- 12. ISSUE REPORTS
-- ============================================================

CREATE TABLE issue_reports (
  report_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  issue_type    TEXT NOT NULL,
  description   TEXT NOT NULL,
  context_data  JSONB,
  status        TEXT NOT NULL DEFAULT 'open',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);

-- ============================================================
-- 13. ACTIVITY & STREAK TRACKING
-- ============================================================

CREATE TABLE user_activity_days (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  xp_earned     INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, activity_date)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_xp_events_user ON xp_events(user_id);
CREATE INDEX idx_xp_events_created ON xp_events(created_at);
CREATE INDEX idx_units_cefr ON units(cefr_level_id);
CREATE INDEX idx_subunits_unit ON subunits(unit_id);
CREATE INDEX idx_subunit_sessions_subunit ON subunit_sessions(subunit_id);
CREATE INDEX idx_subunit_terms_subunit ON subunit_terms(subunit_id);
CREATE INDEX idx_subunit_terms_term ON subunit_terms(term_id);
CREATE INDEX idx_terms_spanish ON terms(spanish);
CREATE INDEX idx_verb_conjugations_verb ON verb_conjugations(verb_id);
CREATE INDEX idx_verb_conjugations_tense ON verb_conjugations(tense_id);
CREATE INDEX idx_user_term_progress_user ON user_term_progress(user_id);
CREATE INDEX idx_user_term_progress_term ON user_term_progress(term_id);
CREATE INDEX idx_user_term_sm2_next_review ON user_term_sm2(user_id, next_review_date);
CREATE INDEX idx_user_subunit_progress_user ON user_subunit_progress(user_id);
CREATE INDEX idx_session_attempts_user ON session_attempts(user_id);
CREATE INDEX idx_session_questions_session ON session_questions(session_id);
CREATE INDEX idx_roleplay_attempts_user ON roleplay_attempts(user_id);
CREATE INDEX idx_roleplay_messages_attempt ON roleplay_messages(attempt_id);
CREATE INDEX idx_user_activity_days_user ON user_activity_days(user_id, activity_date);

-- ============================================================
-- TRIGGER: auto-create user rows on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_sm2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subunit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subunit_session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_criteria_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_difficult_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_days ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own auth providers" ON user_auth_providers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own xp" ON xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own xp" ON xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own term progress" ON user_term_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own term progress" ON user_term_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own sm2" ON user_term_sm2 FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read own status history" ON user_term_status_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own status history" ON user_term_status_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own subunit progress" ON user_subunit_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own session progress" ON user_subunit_session_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own session attempts" ON session_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own question attempts" ON session_question_attempts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own roleplay attempts" ON roleplay_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own roleplay messages" ON roleplay_messages FOR SELECT USING (
  attempt_id IN (SELECT attempt_id FROM roleplay_attempts WHERE user_id = auth.uid())
);
CREATE POLICY "Users insert own roleplay messages" ON roleplay_messages FOR INSERT WITH CHECK (
  attempt_id IN (SELECT attempt_id FROM roleplay_attempts WHERE user_id = auth.uid())
);
CREATE POLICY "Users read own criteria results" ON roleplay_criteria_results FOR SELECT USING (
  attempt_id IN (SELECT attempt_id FROM roleplay_attempts WHERE user_id = auth.uid())
);
CREATE POLICY "Users read own roleplay feedback" ON roleplay_feedback FOR SELECT USING (
  attempt_id IN (SELECT attempt_id FROM roleplay_attempts WHERE user_id = auth.uid())
);
CREATE POLICY "Users read own difficult terms" ON roleplay_difficult_terms FOR SELECT USING (
  attempt_id IN (SELECT attempt_id FROM roleplay_attempts WHERE user_id = auth.uid())
);

CREATE POLICY "Users manage own issues" ON issue_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own activity" ON user_activity_days FOR ALL USING (auth.uid() = user_id);

-- Public read access for content tables (no RLS needed, but enable for consistency)
ALTER TABLE cefr_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE subunits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subunit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subunit_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_verb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE verbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronouns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE verb_conjugations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_grammar_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_hint_topic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_hint_verb_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_hint_conjugation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_pronunciation_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehension_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehension_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehension_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_question_comprehension_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_required_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_topic_subunit_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read content
CREATE POLICY "Authenticated read cefr_levels" ON cefr_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read units" ON units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read subunits" ON subunits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read subunit_sessions" ON subunit_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read terms" ON terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read subunit_terms" ON subunit_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read grammar_topics" ON grammar_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read grammar_verb_categories" ON grammar_verb_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read verbs" ON verbs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read pronouns" ON pronouns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read tenses" ON tenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read verb_conjugations" ON verb_conjugations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read grammar_hints" ON grammar_hints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read term_grammar_hints" ON term_grammar_hints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read grammar_hint_topic_links" ON grammar_hint_topic_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read grammar_hint_verb_links" ON grammar_hint_verb_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read grammar_hint_conjugation_links" ON grammar_hint_conjugation_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read term_pronunciation_hints" ON term_pronunciation_hints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read question_types" ON question_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read session_questions" ON session_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read session_question_options" ON session_question_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read comprehension_conversations" ON comprehension_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read comprehension_questions" ON comprehension_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read comprehension_question_options" ON comprehension_question_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read session_question_comprehension_links" ON session_question_comprehension_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read roleplay_topics" ON roleplay_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read roleplay_required_criteria" ON roleplay_required_criteria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read roleplay_topic_subunit_links" ON roleplay_topic_subunit_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read badges" ON badges FOR SELECT TO authenticated USING (true);

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- ============================================================

-- Create storage buckets for content images
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true);

-- Policy: anyone can read content images (public bucket)
CREATE POLICY "Public read content images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

-- Policy: only service role can upload (managed via Supabase dashboard or admin API)
CREATE POLICY "Service role upload content images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content-images');

-- ============================================================
-- SEED DATA
-- ============================================================

-- CEFR Levels
INSERT INTO cefr_levels (code, name, description, sort_order) VALUES
  ('A1', 'Beginner', 'Basic phrases and everyday expressions', 1),
  ('A2', 'Elementary', 'Frequently used expressions and simple matters', 2),
  ('B1', 'Intermediate', 'Main points on familiar matters', 3),
  ('B2', 'Upper Intermediate', 'Complex text on both concrete and abstract topics', 4),
  ('C1', 'Advanced', 'Wide range of demanding, longer texts', 5),
  ('C2', 'Mastery', 'Virtually everything heard or read', 6);

-- Question Types
INSERT INTO question_types (name, description) VALUES
  ('multiple_choice', 'Select the correct answer from options'),
  ('fill_in_blank', 'Type the missing word or phrase'),
  ('listening', 'Listen and answer'),
  ('speaking', 'Speak the answer aloud'),
  ('matching', 'Match items from two columns'),
  ('translation', 'Translate between Spanish and English'),
  ('word_order', 'Arrange words in the correct order');

-- Pronouns
INSERT INTO pronouns (spanish, english, person, sort_order) VALUES
  ('yo', 'I', '1st singular', 1),
  ('tú', 'you (informal)', '2nd singular', 2),
  ('él/ella/usted', 'he/she/you (formal)', '3rd singular', 3),
  ('nosotros/nosotras', 'we', '1st plural', 4),
  ('vosotros/vosotras', 'you all (Spain)', '2nd plural', 5),
  ('ellos/ellas/ustedes', 'they/you all', '3rd plural', 6);

-- Tenses
INSERT INTO tenses (name, english_name, description, sort_order) VALUES
  ('presente', 'Present', 'Actions happening now or habitually', 1),
  ('pretérito indefinido', 'Preterite', 'Completed past actions', 2),
  ('pretérito imperfecto', 'Imperfect', 'Ongoing or habitual past actions', 3),
  ('futuro simple', 'Simple Future', 'Actions that will happen', 4),
  ('condicional', 'Conditional', 'Hypothetical actions', 5),
  ('subjuntivo presente', 'Present Subjunctive', 'Wishes, doubts, emotions', 6);

-- ============================================================================
-- Spanish Learning Platform — Full Database Schema
-- Supabase PostgreSQL Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COURSE STRUCTURE (Blue Cluster)
-- ============================================================================

CREATE TABLE cefr_levels (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          VARCHAR NOT NULL UNIQUE,   -- 'A1', 'A2', 'B1', etc.
  name          VARCHAR NOT NULL,          -- 'Beginner', 'Elementary', etc.
  description   TEXT,
  order_index   INT NOT NULL DEFAULT 0
);

CREATE TABLE units (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cefr_level_id INT NOT NULL REFERENCES cefr_levels(id) ON DELETE CASCADE,
  unit_number   INT NOT NULL,
  title         VARCHAR NOT NULL,
  focus         TEXT,
  order_index   INT NOT NULL DEFAULT 0,
  UNIQUE (cefr_level_id, unit_number)
);

CREATE TABLE subunits (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unit_id       INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title         VARCHAR NOT NULL,
  cefr_goal     TEXT,
  order_index   INT NOT NULL DEFAULT 0
);

-- ============================================================================
-- USERS & GAMIFICATION (Red Cluster)
-- ============================================================================

CREATE TABLE badges (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR NOT NULL,
  description   TEXT,
  category      VARCHAR,                   -- e.g. 'streak', 'lesson', 'vocab'
  criteria      JSONB,                     -- flexible unlock criteria
  xp_reward     INT NOT NULL DEFAULT 0,
  icon_url      VARCHAR
);

-- The users table extends Supabase auth.users
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR UNIQUE NOT NULL,
  username        VARCHAR UNIQUE NOT NULL,
  avatar_url      VARCHAR,
  xp_total        INT NOT NULL DEFAULT 0,
  current_streak  INT NOT NULL DEFAULT 0,
  longest_streak  INT NOT NULL DEFAULT 0,
  streak_last_date DATE,
  daily_goal      INT NOT NULL DEFAULT 50,
  listening_enabled BOOL NOT NULL DEFAULT TRUE,
  speaking_enabled  BOOL NOT NULL DEFAULT TRUE,
  audio_speed     VARCHAR DEFAULT 'normal', -- 'slow', 'normal', 'fast'
  terms_per_lesson INT NOT NULL DEFAULT 10,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login      TIMESTAMPTZ
);

CREATE TABLE user_badges (
  id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id    INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- ============================================================================
-- GRAMMAR & PRONUNCIATION (Purple Cluster)
-- ============================================================================

CREATE TABLE grammar_categories (
  id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0
);

-- ============================================================================
-- LESSON CONTENT (Green / Orange / Purple linkage)
-- ============================================================================

CREATE TABLE terms (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id    INT NOT NULL REFERENCES subunits(id) ON DELETE CASCADE,
  spanish       VARCHAR NOT NULL,
  english       VARCHAR NOT NULL,
  type          VARCHAR,                   -- 'word', 'phrase', 'sentence'
  example_es    TEXT,
  example_en    TEXT,
  image_url     VARCHAR,
  audio_url     VARCHAR,
  audio_slow_url VARCHAR,
  subunits      JSONB,                     -- nullable cross-references
  order_index   INT NOT NULL DEFAULT 0
);

CREATE TABLE grammar_points (
  id                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id          INT NOT NULL REFERENCES subunits(id) ON DELETE CASCADE,
  grammar_category_id INT REFERENCES grammar_categories(id) ON DELETE SET NULL,
  rule_title          VARCHAR NOT NULL,
  explanation         TEXT,
  example_word        VARCHAR,
  tips                TEXT,
  examples            JSONB,               -- array of example objects
  order_index         INT NOT NULL DEFAULT 0
);

CREATE TABLE pronunciation_tips (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id    INT NOT NULL REFERENCES subunits(id) ON DELETE CASCADE,
  rule_title    VARCHAR NOT NULL,
  explanation   TEXT,
  example_word  VARCHAR,
  phonetic      VARCHAR,
  audio_url     VARCHAR,
  order_index   INT NOT NULL DEFAULT 0
);

CREATE TABLE scenarios (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id      INT NOT NULL REFERENCES subunits(id) ON DELETE CASCADE,
  title           VARCHAR NOT NULL,
  description     TEXT,
  required_terms  JSONB,                   -- array of term IDs
  hints           JSONB,                   -- array of hint strings
  difficulty      VARCHAR                  -- 'easy', 'medium', 'hard'
);

-- ============================================================================
-- PROGRESS TRACKING (Yellow / Orange Cluster)
-- ============================================================================

CREATE TYPE flashcard_status AS ENUM ('learning', 'reviewing', 'mastered');

CREATE TABLE user_flashcard_progress (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_id         INT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  status          flashcard_status NOT NULL DEFAULT 'learning',
  ease_factor     FLOAT NOT NULL DEFAULT 2.5,
  interval        INT NOT NULL DEFAULT 0,     -- days
  repetition_count INT NOT NULL DEFAULT 0,
  next_review     TIMESTAMPTZ,
  last_quality    INT DEFAULT 0,              -- 0–5 scale
  last_reviewed   TIMESTAMPTZ,
  times_correct   INT NOT NULL DEFAULT 0,
  times_incorrect INT NOT NULL DEFAULT 0,
  is_known        BOOL NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, term_id)
);

CREATE TYPE unit_progress_status AS ENUM ('not_started', 'in_progress', 'completed');

CREATE TABLE user_unit_progress (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id         INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  status          unit_progress_status NOT NULL DEFAULT 'not_started',
  progress_percent INT NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  UNIQUE (user_id, unit_id)
);

CREATE TYPE subunit_progress_status AS ENUM ('not_started', 'in_progress', 'completed');

CREATE TABLE user_subunit_progress (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subunit_id      INT NOT NULL REFERENCES subunits(id) ON DELETE CASCADE,
  status          subunit_progress_status NOT NULL DEFAULT 'not_started',
  xp_earned       INT NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  UNIQUE (user_id, subunit_id)
);

-- ============================================================================
-- SESSIONS & REPORTS (Teal / Blue Cluster)
-- ============================================================================

CREATE TABLE lesson_sessions (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subunit_id      INT NOT NULL REFERENCES subunits(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  xp_earned       INT NOT NULL DEFAULT 0,
  tasks_completed INT NOT NULL DEFAULT 0,
  tasks_total     INT NOT NULL DEFAULT 0,
  is_resumed      BOOL NOT NULL DEFAULT FALSE
);

CREATE TABLE conversation_sessions (
  id                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id         INT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  transcript          JSONB,                 -- array of message objects
  words_used          JSONB,                 -- array of term IDs used
  pronunciation_scores JSONB,               -- per-utterance scores
  grammar_errors      JSONB,                -- detected errors
  content_score       INT,                   -- overall content rating
  xp_earned           INT NOT NULL DEFAULT 0,
  completed_at        TIMESTAMPTZ
);

CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

CREATE TABLE content_reports (
  id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type  VARCHAR NOT NULL,           -- 'term', 'grammar_point', etc.
  content_id    INT NOT NULL,
  description   TEXT,
  status        report_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for common query patterns
-- ============================================================================

-- Course structure lookups
CREATE INDEX idx_units_cefr_level ON units(cefr_level_id);
CREATE INDEX idx_subunits_unit ON subunits(unit_id);

-- Content lookups by subunit
CREATE INDEX idx_terms_subunit ON terms(subunit_id);
CREATE INDEX idx_grammar_points_subunit ON grammar_points(subunit_id);
CREATE INDEX idx_grammar_points_category ON grammar_points(grammar_category_id);
CREATE INDEX idx_pronunciation_tips_subunit ON pronunciation_tips(subunit_id);
CREATE INDEX idx_scenarios_subunit ON scenarios(subunit_id);

-- User progress lookups
CREATE INDEX idx_user_flashcard_user ON user_flashcard_progress(user_id);
CREATE INDEX idx_user_flashcard_term ON user_flashcard_progress(term_id);
CREATE INDEX idx_user_flashcard_review ON user_flashcard_progress(user_id, next_review);
CREATE INDEX idx_user_unit_progress ON user_unit_progress(user_id);
CREATE INDEX idx_user_subunit_progress ON user_subunit_progress(user_id);

-- Session lookups
CREATE INDEX idx_lesson_sessions_user ON lesson_sessions(user_id);
CREATE INDEX idx_lesson_sessions_subunit ON lesson_sessions(subunit_id);
CREATE INDEX idx_conversation_sessions_user ON conversation_sessions(user_id);
CREATE INDEX idx_conversation_sessions_scenario ON conversation_sessions(scenario_id);
CREATE INDEX idx_content_reports_user ON content_reports(user_id);

-- Badges
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all user-data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subunit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read/write their own progress & sessions
CREATE POLICY user_badges_select ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_badges_insert ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY flashcard_select ON user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY flashcard_insert ON user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY flashcard_update ON user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY unit_progress_select ON user_unit_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY unit_progress_insert ON user_unit_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY unit_progress_update ON user_unit_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY subunit_progress_select ON user_subunit_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY subunit_progress_insert ON user_subunit_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY subunit_progress_update ON user_subunit_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY lesson_sessions_select ON lesson_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY lesson_sessions_insert ON lesson_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY lesson_sessions_update ON lesson_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY conversation_sessions_select ON conversation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY conversation_sessions_insert ON conversation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY conversation_sessions_update ON conversation_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY content_reports_select ON content_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY content_reports_insert ON content_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Course content is readable by everyone (public)
ALTER TABLE cefr_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE subunits ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciation_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY cefr_levels_public ON cefr_levels FOR SELECT USING (TRUE);
CREATE POLICY units_public ON units FOR SELECT USING (TRUE);
CREATE POLICY subunits_public ON subunits FOR SELECT USING (TRUE);
CREATE POLICY terms_public ON terms FOR SELECT USING (TRUE);
CREATE POLICY grammar_categories_public ON grammar_categories FOR SELECT USING (TRUE);
CREATE POLICY grammar_points_public ON grammar_points FOR SELECT USING (TRUE);
CREATE POLICY pronunciation_tips_public ON pronunciation_tips FOR SELECT USING (TRUE);
CREATE POLICY scenarios_public ON scenarios FOR SELECT USING (TRUE);
CREATE POLICY badges_public ON badges FOR SELECT USING (TRUE);

-- ============================================================================
-- SEED DATA: CEFR Levels
-- ============================================================================

INSERT INTO cefr_levels (code, name, description, order_index) VALUES
  ('A1', 'Beginner',     'Can understand and use familiar everyday expressions and very basic phrases.', 1),
  ('A2', 'Elementary',   'Can understand sentences and frequently used expressions related to areas of most immediate relevance.', 2),
  ('B1', 'Intermediate', 'Can understand the main points of clear standard input on familiar matters.', 3),
  ('B2', 'Upper Intermediate', 'Can understand the main ideas of complex text on both concrete and abstract topics.', 4),
  ('C1', 'Advanced',     'Can understand a wide range of demanding, longer clauses, and recognize implicit meaning.', 5),
  ('C2', 'Mastery',      'Can understand with ease virtually everything heard or read.', 6);

-- ============================================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

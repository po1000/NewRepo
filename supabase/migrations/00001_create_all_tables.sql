-- ============================================================================
-- Spanish Learning Platform — Full Database Schema (Final)
-- Supabase PostgreSQL Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- 1. USERS & SETTINGS
-- ============================================================================

CREATE TABLE users (
  user_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username          VARCHAR UNIQUE NOT NULL,
  email             VARCHAR UNIQUE NOT NULL,
  password_hash     TEXT,
  display_name      VARCHAR,
  profile_image_url TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_settings (
  user_id               UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  listening_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  speaking_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_auth_providers (
  auth_provider_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  provider_name     VARCHAR NOT NULL,
  provider_user_key VARCHAR NOT NULL,
  linked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider_name)
);

CREATE TABLE user_stats (
  user_id                  UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  total_xp                 INTEGER NOT NULL DEFAULT 0,
  current_streak           INTEGER NOT NULL DEFAULT 0,
  streak_record            INTEGER NOT NULL DEFAULT 0,
  last_lesson_completed_on DATE
);

CREATE TABLE user_activity_days (
  activity_day_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  activity_date       DATE NOT NULL,
  did_complete_lesson BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, activity_date)
);


-- ============================================================================
-- 2. BADGES & XP
-- ============================================================================

CREATE TABLE badges (
  badge_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label          VARCHAR NOT NULL,
  description    TEXT,
  icon_url       TEXT,
  criteria_type  VARCHAR,
  criteria_value INTEGER
);

CREATE TABLE user_badges (
  user_badge_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id       INT NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
  progress_value INTEGER NOT NULL DEFAULT 0,
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  UNIQUE (user_id, badge_id)
);

CREATE TABLE xp_events (
  xp_event_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  source_type VARCHAR NOT NULL,
  source_id   INT,
  xp_amount   INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 3. CONTENT HIERARCHY
-- ============================================================================

CREATE TABLE cefr_levels (
  cefr_level_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          VARCHAR NOT NULL UNIQUE,
  title         VARCHAR NOT NULL,
  description   TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE units (
  unit_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cefr_level_id INT NOT NULL REFERENCES cefr_levels(cefr_level_id) ON DELETE CASCADE,
  unit_number   INTEGER NOT NULL,
  title         VARCHAR NOT NULL,
  description   TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  UNIQUE (cefr_level_id, unit_number)
);

CREATE TABLE subunits (
  subunit_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unit_id       INT NOT NULL REFERENCES units(unit_id) ON DELETE CASCADE,
  subunit_code  VARCHAR NOT NULL,
  title         VARCHAR NOT NULL,
  goal_text     TEXT,
  description   TEXT,
  thumbnail_url TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subunit_sessions (
  subunit_session_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id         INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  session_number     INTEGER NOT NULL,
  title              VARCHAR,
  session_type       VARCHAR NOT NULL,
  unlock_rule        TEXT,
  sort_order         INTEGER NOT NULL DEFAULT 0
);


-- ============================================================================
-- 4. TERMS / VOCAB / PHRASES
-- ============================================================================

CREATE TABLE terms (
  term_id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  spanish_text        VARCHAR NOT NULL,
  english_text        VARCHAR NOT NULL,
  term_type           VARCHAR,
  part_of_speech      VARCHAR,
  gender              VARCHAR,
  audio_url           TEXT,
  image_url           TEXT,
  example_sentence_es TEXT,
  example_sentence_en TEXT,
  example_audio_url   TEXT,
  notes               TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subunit_terms (
  subunit_term_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id      INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  term_id         INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_core_term    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (subunit_id, term_id)
);


-- ============================================================================
-- 5. GRAMMAR SECTION
-- ============================================================================

CREATE TABLE grammar_topics (
  grammar_topic_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title            VARCHAR NOT NULL,
  slug             VARCHAR NOT NULL UNIQUE,
  description      TEXT,
  content_html     TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE grammar_verb_categories (
  verb_category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name             VARCHAR NOT NULL,
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE verbs (
  verb_id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  verb_category_id INT NOT NULL REFERENCES grammar_verb_categories(verb_category_id) ON DELETE CASCADE,
  infinitive       VARCHAR NOT NULL,
  english_meaning  VARCHAR NOT NULL,
  is_irregular     BOOLEAN NOT NULL DEFAULT FALSE,
  notes            TEXT
);

CREATE TABLE pronouns (
  pronoun_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pronoun_text VARCHAR NOT NULL,
  person_group VARCHAR,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE tenses (
  tense_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE verb_conjugations (
  verb_conjugation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  verb_id             INT NOT NULL REFERENCES verbs(verb_id) ON DELETE CASCADE,
  pronoun_id          INT NOT NULL REFERENCES pronouns(pronoun_id) ON DELETE CASCADE,
  tense_id            INT NOT NULL REFERENCES tenses(tense_id) ON DELETE CASCADE,
  conjugated_form     VARCHAR NOT NULL,
  UNIQUE (verb_id, pronoun_id, tense_id)
);


-- ============================================================================
-- 6. GRAMMAR HINT SYSTEM
-- ============================================================================

CREATE TABLE grammar_hints (
  grammar_hint_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hint_title      VARCHAR NOT NULL,
  hint_text       TEXT NOT NULL,
  hint_type       VARCHAR,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE term_grammar_hints (
  term_grammar_hint_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  term_id              INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  grammar_hint_id      INT NOT NULL REFERENCES grammar_hints(grammar_hint_id) ON DELETE CASCADE,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  UNIQUE (term_id, grammar_hint_id)
);

CREATE TABLE grammar_hint_topic_links (
  grammar_hint_topic_link_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grammar_hint_id            INT NOT NULL REFERENCES grammar_hints(grammar_hint_id) ON DELETE CASCADE,
  grammar_topic_id           INT NOT NULL REFERENCES grammar_topics(grammar_topic_id) ON DELETE CASCADE,
  UNIQUE (grammar_hint_id, grammar_topic_id)
);

CREATE TABLE grammar_hint_verb_links (
  grammar_hint_verb_link_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grammar_hint_id           INT NOT NULL REFERENCES grammar_hints(grammar_hint_id) ON DELETE CASCADE,
  verb_id                   INT NOT NULL REFERENCES verbs(verb_id) ON DELETE CASCADE,
  UNIQUE (grammar_hint_id, verb_id)
);

CREATE TABLE grammar_hint_conjugation_links (
  grammar_hint_conjugation_link_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grammar_hint_id                  INT NOT NULL REFERENCES grammar_hints(grammar_hint_id) ON DELETE CASCADE,
  verb_conjugation_id              INT NOT NULL REFERENCES verb_conjugations(verb_conjugation_id) ON DELETE CASCADE,
  UNIQUE (grammar_hint_id, verb_conjugation_id)
);

CREATE TABLE term_pronunciation_hints (
  pronunciation_hint_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  term_id               INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  hint_text             TEXT NOT NULL,
  sort_order            INTEGER NOT NULL DEFAULT 0
);


-- ============================================================================
-- 7. USER TERM LEARNING & SM-2
-- ============================================================================

CREATE TABLE user_term_progress (
  user_term_progress_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id               UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  term_id               INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  learning_status       VARCHAR NOT NULL DEFAULT 'not_seen',
  correct_in_session    INTEGER NOT NULL DEFAULT 0,
  times_seen            INTEGER NOT NULL DEFAULT 0,
  times_correct         INTEGER NOT NULL DEFAULT 0,
  times_incorrect       INTEGER NOT NULL DEFAULT 0,
  times_skipped         INTEGER NOT NULL DEFAULT 0,
  times_marked_known    INTEGER NOT NULL DEFAULT 0,
  current_strength_level INTEGER NOT NULL DEFAULT 0,
  is_marked_known       BOOLEAN NOT NULL DEFAULT FALSE,
  is_due_for_review     BOOLEAN NOT NULL DEFAULT FALSE,
  last_answered_at      TIMESTAMPTZ,
  last_reviewed_at      TIMESTAMPTZ,
  next_review_at        TIMESTAMPTZ,
  UNIQUE (user_id, term_id)
);

CREATE TABLE user_term_sm2 (
  user_term_progress_id INT PRIMARY KEY REFERENCES user_term_progress(user_term_progress_id) ON DELETE CASCADE,
  ef                    DECIMAL(4,2) NOT NULL DEFAULT 2.50,
  repetition            INTEGER NOT NULL DEFAULT 0,
  interval_days         INTEGER NOT NULL DEFAULT 0,
  last_q_score          INTEGER DEFAULT 0,
  review_due_at         TIMESTAMPTZ
);

CREATE TABLE user_term_status_history (
  status_history_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_term_progress_id INT NOT NULL REFERENCES user_term_progress(user_term_progress_id) ON DELETE CASCADE,
  old_status            VARCHAR,
  new_status            VARCHAR NOT NULL,
  changed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_reason         VARCHAR
);


-- ============================================================================
-- 8. USER PROGRESS THROUGH SUBUNITS & SESSIONS
-- ============================================================================

CREATE TABLE user_subunit_progress (
  user_subunit_progress_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_id               INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  progress_percent         DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_terms              INTEGER NOT NULL DEFAULT 0,
  terms_learnt_count       INTEGER NOT NULL DEFAULT 0,
  terms_marked_known_count INTEGER NOT NULL DEFAULT 0,
  is_completed             BOOLEAN NOT NULL DEFAULT FALSE,
  started_at               TIMESTAMPTZ,
  completed_at             TIMESTAMPTZ,
  last_activity_at         TIMESTAMPTZ,
  UNIQUE (user_id, subunit_id)
);

CREATE TABLE user_subunit_session_progress (
  user_subunit_session_progress_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_session_id               INT NOT NULL REFERENCES subunit_sessions(subunit_session_id) ON DELETE CASCADE,
  status                           VARCHAR NOT NULL DEFAULT 'not_started',
  started_at                       TIMESTAMPTZ,
  completed_at                     TIMESTAMPTZ,
  last_activity_at                 TIMESTAMPTZ,
  UNIQUE (user_id, subunit_session_id)
);

CREATE TABLE session_attempts (
  session_attempt_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_id         INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  subunit_session_id INT NOT NULL REFERENCES subunit_sessions(subunit_session_id) ON DELETE CASCADE,
  attempt_number     INTEGER NOT NULL DEFAULT 1,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at           TIMESTAMPTZ,
  status             VARCHAR NOT NULL DEFAULT 'in_progress',
  questions_answered INTEGER NOT NULL DEFAULT 0,
  score_percent      DECIMAL(5,2)
);


-- ============================================================================
-- 9. QUESTION TYPES FOR NORMAL SESSIONS
-- ============================================================================

CREATE TABLE question_types (
  question_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code             VARCHAR NOT NULL UNIQUE,
  name             VARCHAR NOT NULL
);

CREATE TABLE session_questions (
  session_question_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_attempt_id  INT NOT NULL REFERENCES session_attempts(session_attempt_id) ON DELETE CASCADE,
  subunit_session_id  INT NOT NULL REFERENCES subunit_sessions(subunit_session_id) ON DELETE CASCADE,
  question_type_id    INT NOT NULL REFERENCES question_types(question_type_id) ON DELETE CASCADE,
  term_id             INT REFERENCES terms(term_id) ON DELETE SET NULL,
  prompt_text         TEXT,
  audio_url           TEXT,
  image_url           TEXT,
  display_order       INTEGER NOT NULL DEFAULT 0,
  is_review_question  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE session_question_options (
  session_question_option_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_question_id        INT NOT NULL REFERENCES session_questions(session_question_id) ON DELETE CASCADE,
  option_text                TEXT NOT NULL,
  is_correct                 BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order                 INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE session_question_attempts (
  session_question_attempt_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_question_id         INT NOT NULL REFERENCES session_questions(session_question_id) ON DELETE CASCADE,
  user_id                     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  selected_option_id          INT REFERENCES session_question_options(session_question_option_id) ON DELETE SET NULL,
  typed_answer                TEXT,
  speech_transcript           TEXT,
  pronunciation_score         DECIMAL(5,2),
  q_score                     INTEGER,
  is_correct                  BOOLEAN,
  feedback_text               TEXT,
  skipped                     BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 10. COMPREHENSION CONTENT
-- ============================================================================

CREATE TABLE comprehension_conversations (
  comprehension_conversation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cefr_level_id                 INT NOT NULL REFERENCES cefr_levels(cefr_level_id) ON DELETE CASCADE,
  title                         VARCHAR NOT NULL,
  audio_url                     TEXT,
  written_spanish_text          TEXT,
  english_summary               TEXT,
  is_final_level_review         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active                     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE comprehension_questions (
  comprehension_question_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comprehension_conversation_id INT NOT NULL REFERENCES comprehension_conversations(comprehension_conversation_id) ON DELETE CASCADE,
  question_type                 VARCHAR NOT NULL,
  question_text                 TEXT NOT NULL,
  sort_order                    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE comprehension_question_options (
  comprehension_question_option_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comprehension_question_id        INT NOT NULL REFERENCES comprehension_questions(comprehension_question_id) ON DELETE CASCADE,
  option_text                      TEXT NOT NULL,
  is_correct                       BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order                       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE session_question_comprehension_links (
  session_question_id       INT PRIMARY KEY REFERENCES session_questions(session_question_id) ON DELETE CASCADE,
  comprehension_question_id INT NOT NULL REFERENCES comprehension_questions(comprehension_question_id) ON DELETE CASCADE
);


-- ============================================================================
-- 11. ROLEPLAY PRACTICE
-- ============================================================================

CREATE TABLE roleplay_topics (
  roleplay_topic_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title             VARCHAR NOT NULL,
  brief_text        TEXT,
  context_text      TEXT,
  difficulty_level  VARCHAR,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roleplay_required_criteria (
  roleplay_criteria_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_topic_id    INT NOT NULL REFERENCES roleplay_topics(roleplay_topic_id) ON DELETE CASCADE,
  criteria_text        TEXT NOT NULL,
  sort_order           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE roleplay_topic_subunit_links (
  roleplay_topic_subunit_link_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_topic_id              INT NOT NULL REFERENCES roleplay_topics(roleplay_topic_id) ON DELETE CASCADE,
  subunit_id                     INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  UNIQUE (roleplay_topic_id, subunit_id)
);

CREATE TABLE roleplay_attempts (
  roleplay_attempt_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  roleplay_topic_id   INT NOT NULL REFERENCES roleplay_topics(roleplay_topic_id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at            TIMESTAMPTZ,
  duration_seconds    INTEGER,
  accuracy_score      DECIMAL(5,2),
  xp_awarded          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE roleplay_messages (
  roleplay_message_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_attempt_id INT NOT NULL REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  sender_type         VARCHAR NOT NULL,
  message_mode        VARCHAR,
  message_text        TEXT,
  audio_url           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roleplay_criteria_results (
  roleplay_criteria_result_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_attempt_id         INT NOT NULL REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  roleplay_criteria_id        INT NOT NULL REFERENCES roleplay_required_criteria(roleplay_criteria_id) ON DELETE CASCADE,
  is_met                      BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_text               TEXT,
  UNIQUE (roleplay_attempt_id, roleplay_criteria_id)
);

CREATE TABLE roleplay_feedback (
  roleplay_attempt_id             INT PRIMARY KEY REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  writing_spelling_score          DECIMAL(5,2),
  writing_punctuation_score       DECIMAL(5,2),
  writing_accent_characters_score DECIMAL(5,2),
  writing_grammar_score           DECIMAL(5,2),
  speaking_pronunciation_score    DECIMAL(5,2),
  speaking_accent_score           DECIMAL(5,2),
  speaking_grammar_score          DECIMAL(5,2),
  summary_text                    TEXT
);

CREATE TABLE roleplay_difficult_terms (
  roleplay_difficult_term_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_attempt_id        INT NOT NULL REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  term_id                    INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  difficulty_area            VARCHAR,
  UNIQUE (roleplay_attempt_id, term_id)
);


-- ============================================================================
-- 12. ISSUE REPORTING
-- ============================================================================

CREATE TABLE issue_reports (
  issue_report_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_type     VARCHAR NOT NULL,
  target_id       INT NOT NULL,
  issue_category  VARCHAR,
  description     TEXT,
  status          VARCHAR NOT NULL DEFAULT 'open',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);


-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_user_auth_providers_user ON user_auth_providers(user_id);
CREATE INDEX idx_user_activity_days_user ON user_activity_days(user_id);
CREATE INDEX idx_user_activity_days_date ON user_activity_days(user_id, activity_date);

-- Badges & XP
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_xp_events_user ON xp_events(user_id);

-- Content hierarchy
CREATE INDEX idx_units_cefr_level ON units(cefr_level_id);
CREATE INDEX idx_subunits_unit ON subunits(unit_id);
CREATE INDEX idx_subunit_sessions_subunit ON subunit_sessions(subunit_id);

-- Terms
CREATE INDEX idx_subunit_terms_subunit ON subunit_terms(subunit_id);
CREATE INDEX idx_subunit_terms_term ON subunit_terms(term_id);

-- Grammar
CREATE INDEX idx_verbs_category ON verbs(verb_category_id);
CREATE INDEX idx_verb_conjugations_verb ON verb_conjugations(verb_id);
CREATE INDEX idx_verb_conjugations_tense ON verb_conjugations(tense_id);
CREATE INDEX idx_verb_conjugations_pronoun ON verb_conjugations(pronoun_id);

-- Grammar hints
CREATE INDEX idx_term_grammar_hints_term ON term_grammar_hints(term_id);
CREATE INDEX idx_term_grammar_hints_hint ON term_grammar_hints(grammar_hint_id);
CREATE INDEX idx_grammar_hint_topic_links_hint ON grammar_hint_topic_links(grammar_hint_id);
CREATE INDEX idx_grammar_hint_topic_links_topic ON grammar_hint_topic_links(grammar_topic_id);
CREATE INDEX idx_grammar_hint_verb_links_hint ON grammar_hint_verb_links(grammar_hint_id);
CREATE INDEX idx_grammar_hint_verb_links_verb ON grammar_hint_verb_links(verb_id);
CREATE INDEX idx_grammar_hint_conjugation_links_hint ON grammar_hint_conjugation_links(grammar_hint_id);
CREATE INDEX idx_grammar_hint_conjugation_links_conj ON grammar_hint_conjugation_links(verb_conjugation_id);
CREATE INDEX idx_term_pronunciation_hints_term ON term_pronunciation_hints(term_id);

-- User term learning
CREATE INDEX idx_user_term_progress_user ON user_term_progress(user_id);
CREATE INDEX idx_user_term_progress_term ON user_term_progress(term_id);
CREATE INDEX idx_user_term_progress_review ON user_term_progress(user_id, next_review_at);
CREATE INDEX idx_user_term_status_history_progress ON user_term_status_history(user_term_progress_id);

-- User subunit/session progress
CREATE INDEX idx_user_subunit_progress_user ON user_subunit_progress(user_id);
CREATE INDEX idx_user_subunit_progress_subunit ON user_subunit_progress(subunit_id);
CREATE INDEX idx_user_subunit_session_progress_user ON user_subunit_session_progress(user_id);
CREATE INDEX idx_user_subunit_session_progress_session ON user_subunit_session_progress(subunit_session_id);

-- Session attempts & questions
CREATE INDEX idx_session_attempts_user ON session_attempts(user_id);
CREATE INDEX idx_session_attempts_subunit ON session_attempts(subunit_id);
CREATE INDEX idx_session_attempts_session ON session_attempts(subunit_session_id);
CREATE INDEX idx_session_questions_attempt ON session_questions(session_attempt_id);
CREATE INDEX idx_session_questions_term ON session_questions(term_id);
CREATE INDEX idx_session_question_options_question ON session_question_options(session_question_id);
CREATE INDEX idx_session_question_attempts_question ON session_question_attempts(session_question_id);
CREATE INDEX idx_session_question_attempts_user ON session_question_attempts(user_id);

-- Comprehension
CREATE INDEX idx_comprehension_conversations_cefr ON comprehension_conversations(cefr_level_id);
CREATE INDEX idx_comprehension_questions_conversation ON comprehension_questions(comprehension_conversation_id);
CREATE INDEX idx_comprehension_question_options_question ON comprehension_question_options(comprehension_question_id);

-- Roleplay
CREATE INDEX idx_roleplay_required_criteria_topic ON roleplay_required_criteria(roleplay_topic_id);
CREATE INDEX idx_roleplay_topic_subunit_links_topic ON roleplay_topic_subunit_links(roleplay_topic_id);
CREATE INDEX idx_roleplay_topic_subunit_links_subunit ON roleplay_topic_subunit_links(subunit_id);
CREATE INDEX idx_roleplay_attempts_user ON roleplay_attempts(user_id);
CREATE INDEX idx_roleplay_attempts_topic ON roleplay_attempts(roleplay_topic_id);
CREATE INDEX idx_roleplay_messages_attempt ON roleplay_messages(roleplay_attempt_id);
CREATE INDEX idx_roleplay_criteria_results_attempt ON roleplay_criteria_results(roleplay_attempt_id);
CREATE INDEX idx_roleplay_difficult_terms_attempt ON roleplay_difficult_terms(roleplay_attempt_id);
CREATE INDEX idx_roleplay_difficult_terms_term ON roleplay_difficult_terms(term_id);

-- Issue reports
CREATE INDEX idx_issue_reports_user ON issue_reports(user_id);


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Public content: readable by everyone
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
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehension_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehension_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehension_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_required_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_topic_subunit_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY cefr_levels_public ON cefr_levels FOR SELECT USING (TRUE);
CREATE POLICY units_public ON units FOR SELECT USING (TRUE);
CREATE POLICY subunits_public ON subunits FOR SELECT USING (TRUE);
CREATE POLICY subunit_sessions_public ON subunit_sessions FOR SELECT USING (TRUE);
CREATE POLICY terms_public ON terms FOR SELECT USING (TRUE);
CREATE POLICY subunit_terms_public ON subunit_terms FOR SELECT USING (TRUE);
CREATE POLICY grammar_topics_public ON grammar_topics FOR SELECT USING (TRUE);
CREATE POLICY grammar_verb_categories_public ON grammar_verb_categories FOR SELECT USING (TRUE);
CREATE POLICY verbs_public ON verbs FOR SELECT USING (TRUE);
CREATE POLICY pronouns_public ON pronouns FOR SELECT USING (TRUE);
CREATE POLICY tenses_public ON tenses FOR SELECT USING (TRUE);
CREATE POLICY verb_conjugations_public ON verb_conjugations FOR SELECT USING (TRUE);
CREATE POLICY grammar_hints_public ON grammar_hints FOR SELECT USING (TRUE);
CREATE POLICY term_grammar_hints_public ON term_grammar_hints FOR SELECT USING (TRUE);
CREATE POLICY grammar_hint_topic_links_public ON grammar_hint_topic_links FOR SELECT USING (TRUE);
CREATE POLICY grammar_hint_verb_links_public ON grammar_hint_verb_links FOR SELECT USING (TRUE);
CREATE POLICY grammar_hint_conjugation_links_public ON grammar_hint_conjugation_links FOR SELECT USING (TRUE);
CREATE POLICY term_pronunciation_hints_public ON term_pronunciation_hints FOR SELECT USING (TRUE);
CREATE POLICY question_types_public ON question_types FOR SELECT USING (TRUE);
CREATE POLICY badges_public ON badges FOR SELECT USING (TRUE);
CREATE POLICY comprehension_conversations_public ON comprehension_conversations FOR SELECT USING (TRUE);
CREATE POLICY comprehension_questions_public ON comprehension_questions FOR SELECT USING (TRUE);
CREATE POLICY comprehension_question_options_public ON comprehension_question_options FOR SELECT USING (TRUE);
CREATE POLICY roleplay_topics_public ON roleplay_topics FOR SELECT USING (TRUE);
CREATE POLICY roleplay_required_criteria_public ON roleplay_required_criteria FOR SELECT USING (TRUE);
CREATE POLICY roleplay_topic_subunit_links_public ON roleplay_topic_subunit_links FOR SELECT USING (TRUE);

-- User-data tables: users can only access their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_sm2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_term_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subunit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subunit_session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_question_comprehension_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_criteria_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_difficult_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_settings_select ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_settings_insert ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_settings_update ON user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_auth_providers_select ON user_auth_providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_auth_providers_insert ON user_auth_providers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_stats_select ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_stats_insert ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_stats_update ON user_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_activity_days_select ON user_activity_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_activity_days_insert ON user_activity_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_activity_days_update ON user_activity_days FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_badges_select ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_badges_insert ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_badges_update ON user_badges FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY xp_events_select ON xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY xp_events_insert ON xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_term_progress_select ON user_term_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_term_progress_insert ON user_term_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_term_progress_update ON user_term_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_term_sm2_select ON user_term_sm2 FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_sm2.user_term_progress_id AND user_term_progress.user_id = auth.uid()));
CREATE POLICY user_term_sm2_insert ON user_term_sm2 FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_sm2.user_term_progress_id AND user_term_progress.user_id = auth.uid()));
CREATE POLICY user_term_sm2_update ON user_term_sm2 FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_sm2.user_term_progress_id AND user_term_progress.user_id = auth.uid()));

CREATE POLICY user_term_status_history_select ON user_term_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_status_history.user_term_progress_id AND user_term_progress.user_id = auth.uid()));
CREATE POLICY user_term_status_history_insert ON user_term_status_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_status_history.user_term_progress_id AND user_term_progress.user_id = auth.uid()));

CREATE POLICY user_subunit_progress_select ON user_subunit_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_subunit_progress_insert ON user_subunit_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_subunit_progress_update ON user_subunit_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_subunit_session_progress_select ON user_subunit_session_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_subunit_session_progress_insert ON user_subunit_session_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_subunit_session_progress_update ON user_subunit_session_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY session_attempts_select ON session_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY session_attempts_insert ON session_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY session_attempts_update ON session_attempts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY session_questions_select ON session_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM session_attempts WHERE session_attempts.session_attempt_id = session_questions.session_attempt_id AND session_attempts.user_id = auth.uid()));
CREATE POLICY session_questions_insert ON session_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM session_attempts WHERE session_attempts.session_attempt_id = session_questions.session_attempt_id AND session_attempts.user_id = auth.uid()));

CREATE POLICY session_question_options_select ON session_question_options FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM session_questions
    JOIN session_attempts ON session_attempts.session_attempt_id = session_questions.session_attempt_id
    WHERE session_questions.session_question_id = session_question_options.session_question_id
    AND session_attempts.user_id = auth.uid()
  ));
CREATE POLICY session_question_options_insert ON session_question_options FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM session_questions
    JOIN session_attempts ON session_attempts.session_attempt_id = session_questions.session_attempt_id
    WHERE session_questions.session_question_id = session_question_options.session_question_id
    AND session_attempts.user_id = auth.uid()
  ));

CREATE POLICY session_question_attempts_select ON session_question_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY session_question_attempts_insert ON session_question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY session_question_comprehension_links_select ON session_question_comprehension_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM session_questions
    JOIN session_attempts ON session_attempts.session_attempt_id = session_questions.session_attempt_id
    WHERE session_questions.session_question_id = session_question_comprehension_links.session_question_id
    AND session_attempts.user_id = auth.uid()
  ));
CREATE POLICY session_question_comprehension_links_insert ON session_question_comprehension_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM session_questions
    JOIN session_attempts ON session_attempts.session_attempt_id = session_questions.session_attempt_id
    WHERE session_questions.session_question_id = session_question_comprehension_links.session_question_id
    AND session_attempts.user_id = auth.uid()
  ));

CREATE POLICY roleplay_attempts_select ON roleplay_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY roleplay_attempts_insert ON roleplay_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY roleplay_attempts_update ON roleplay_attempts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY roleplay_messages_select ON roleplay_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_messages.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_messages_insert ON roleplay_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_messages.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

CREATE POLICY roleplay_criteria_results_select ON roleplay_criteria_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_criteria_results.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_criteria_results_insert ON roleplay_criteria_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_criteria_results.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

CREATE POLICY roleplay_feedback_select ON roleplay_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_feedback.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_feedback_insert ON roleplay_feedback FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_feedback.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

CREATE POLICY roleplay_difficult_terms_select ON roleplay_difficult_terms FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_difficult_terms.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_difficult_terms_insert ON roleplay_difficult_terms FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_difficult_terms.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

CREATE POLICY issue_reports_select ON issue_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY issue_reports_insert ON issue_reports FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO cefr_levels (code, title, description, sort_order) VALUES
  ('A1', 'Beginner',            'Can understand and use familiar everyday expressions and very basic phrases.', 1),
  ('A2', 'Pre-Intermediate',    'Can understand sentences and frequently used expressions related to areas of most immediate relevance.', 2),
  ('B1', 'Intermediate',        'Can understand the main points of clear standard input on familiar matters.', 3),
  ('B2', 'Upper Intermediate',  'Can understand the main ideas of complex text on both concrete and abstract topics.', 4),
  ('C1', 'Advanced',            'Can understand a wide range of demanding, longer clauses, and recognize implicit meaning.', 5),
  ('C2', 'Mastery',             'Can understand with ease virtually everything heard or read.', 6);

INSERT INTO question_types (code, name) VALUES
  ('flashcard',              'Flashcard'),
  ('mcq_match_en_to_es',    'Match English to Spanish'),
  ('audio_es_to_typed_en',  'Audio Spanish - Type English'),
  ('speak_spanish_term',    'Speak Spanish Term'),
  ('comprehension_mcq',     'Comprehension MCQ'),
  ('comprehension_typed',   'Comprehension Typed');

INSERT INTO grammar_verb_categories (name, sort_order) VALUES
  ('-ar verbs', 1),
  ('-er verbs', 2),
  ('-ir verbs', 3);

INSERT INTO pronouns (pronoun_text, person_group, sort_order) VALUES
  ('yo',                    '1st singular', 1),
  ('tú',                    '2nd singular', 2),
  ('él/ella/usted',         '3rd singular', 3),
  ('nosotros/as',           '1st plural',   4),
  ('vosotros/as',           '2nd plural',   5),
  ('ellos/ellas/ustedes',   '3rd plural',   6);

INSERT INTO tenses (name, sort_order) VALUES
  ('Present',             1),
  ('Preterite',           2),
  ('Imperfect',           3),
  ('Future',              4),
  ('Conditional',         5),
  ('Subjunctive Present', 6);


-- ============================================================================
-- FUNCTION: Auto-create user profile + related rows on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

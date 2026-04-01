-- ============================================================================
-- Spanish Learning Platform — Full Database Schema
-- Supabase PostgreSQL Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- 1. COURSE STRUCTURE
-- ============================================================================

-- cefr_levels: A1 Beginner, A2 Pre-Intermediate, etc.
CREATE TABLE cefr_levels (
  cefr_level_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code            VARCHAR NOT NULL UNIQUE,
  title           VARCHAR NOT NULL,
  description     TEXT,
  sort_order      INT NOT NULL DEFAULT 0
);

-- units: "Unit 1: First Impressions"
CREATE TABLE units (
  unit_id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cefr_level_id   INT NOT NULL REFERENCES cefr_levels(cefr_level_id) ON DELETE CASCADE,
  unit_number     INT NOT NULL,
  title           VARCHAR NOT NULL,
  description     TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  UNIQUE (cefr_level_id, unit_number)
);

-- subunits: lesson tiles like "3.1 Day at the Café"
CREATE TABLE subunits (
  subunit_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unit_id         INT NOT NULL REFERENCES units(unit_id) ON DELETE CASCADE,
  subunit_code    VARCHAR NOT NULL,
  title           VARCHAR NOT NULL,
  goal_text       TEXT,
  description     TEXT,
  thumbnail_url   VARCHAR,
  sort_order      INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- subunit_sessions: learning, mixed practice, review, comprehension
CREATE TABLE subunit_sessions (
  subunit_session_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id          INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  session_number      INT NOT NULL,
  title               VARCHAR NOT NULL,
  session_type        VARCHAR NOT NULL,
  unlock_rule         VARCHAR,
  sort_order          INT NOT NULL DEFAULT 0
);


-- ============================================================================
-- 2. TERMS
-- ============================================================================

-- terms: each Spanish word/phrase stored once
CREATE TABLE terms (
  term_id               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  spanish_text          VARCHAR NOT NULL,
  english_text          VARCHAR NOT NULL,
  term_type             VARCHAR,
  part_of_speech        VARCHAR,
  gender                VARCHAR,
  audio_url             VARCHAR,
  image_url             VARCHAR,
  example_sentence_es   TEXT,
  example_sentence_en   TEXT,
  example_audio_url     VARCHAR,
  notes                 TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE
);

-- subunit_terms: bridge table (subunits M:M terms)
CREATE TABLE subunit_terms (
  subunit_term_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subunit_id      INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  term_id         INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  sort_order      INT NOT NULL DEFAULT 0,
  is_core_term    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (subunit_id, term_id)
);


-- ============================================================================
-- 3. GRAMMAR
-- ============================================================================

-- grammar_topics: Pronouns, Gender Rules, Ser vs Estar, etc.
CREATE TABLE grammar_topics (
  grammar_topic_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title             VARCHAR NOT NULL,
  slug              VARCHAR NOT NULL UNIQUE,
  description       TEXT,
  content_html      TEXT,
  sort_order        INT NOT NULL DEFAULT 0
);

-- grammar_verb_categories: -ar, -er, -ir
CREATE TABLE grammar_verb_categories (
  verb_category_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              VARCHAR NOT NULL,
  sort_order        INT NOT NULL DEFAULT 0
);

-- verbs: each infinitive stored once
CREATE TABLE verbs (
  verb_id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  verb_category_id    INT NOT NULL REFERENCES grammar_verb_categories(verb_category_id) ON DELETE CASCADE,
  infinitive          VARCHAR NOT NULL,
  english_meaning     VARCHAR NOT NULL,
  is_irregular        BOOLEAN NOT NULL DEFAULT FALSE,
  notes               TEXT
);

-- pronouns: yo, tú, él/ella, etc.
CREATE TABLE pronouns (
  pronoun_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pronoun_text    VARCHAR NOT NULL,
  person_group    VARCHAR,
  sort_order      INT NOT NULL DEFAULT 0
);

-- tenses: present, preterite, imperfect, etc.
CREATE TABLE tenses (
  tense_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);

-- verb_conjugations: each conjugated form as one row
CREATE TABLE verb_conjugations (
  verb_conjugation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  verb_id             INT NOT NULL REFERENCES verbs(verb_id) ON DELETE CASCADE,
  pronoun_id          INT NOT NULL REFERENCES pronouns(pronoun_id) ON DELETE CASCADE,
  tense_id            INT NOT NULL REFERENCES tenses(tense_id) ON DELETE CASCADE,
  conjugated_form     VARCHAR NOT NULL,
  UNIQUE (verb_id, pronoun_id, tense_id)
);

-- term_grammar_links: bridge table (terms M:M grammar_topics)
CREATE TABLE term_grammar_links (
  term_grammar_link_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  term_id               INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  grammar_topic_id      INT NOT NULL REFERENCES grammar_topics(grammar_topic_id) ON DELETE CASCADE,
  link_note             TEXT,
  UNIQUE (term_id, grammar_topic_id)
);

-- term_pronunciation_hints: pronunciation help per term
CREATE TABLE term_pronunciation_hints (
  pronunciation_hint_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  term_id               INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  hint_text             TEXT NOT NULL,
  sort_order            INT NOT NULL DEFAULT 0
);


-- ============================================================================
-- 4. USERS & SETTINGS
-- ============================================================================

-- users: extends Supabase auth.users
CREATE TABLE users (
  user_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username            VARCHAR UNIQUE NOT NULL,
  email               VARCHAR UNIQUE NOT NULL,
  display_name        VARCHAR,
  profile_image_url   VARCHAR,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

-- user_settings: slim settings table (1:1 with users)
CREATE TABLE user_settings (
  user_id                 UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  listening_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  speaking_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  notifications_enabled   BOOLEAN NOT NULL DEFAULT TRUE
);

-- user_auth_providers: OAuth providers (Google, Apple, Facebook)
CREATE TABLE user_auth_providers (
  auth_provider_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  provider_name       VARCHAR NOT NULL,
  provider_user_key   VARCHAR NOT NULL,
  linked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider_name)
);

-- user_stats: summary stats (1:1 with users)
CREATE TABLE user_stats (
  user_id                     UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  total_xp                    INT NOT NULL DEFAULT 0,
  current_streak              INT NOT NULL DEFAULT 0,
  streak_record               INT NOT NULL DEFAULT 0,
  last_lesson_completed_on    DATE
);

-- user_activity_days: daily completion tracking for streaks
CREATE TABLE user_activity_days (
  activity_day_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  activity_date       DATE NOT NULL,
  did_complete_lesson BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, activity_date)
);


-- ============================================================================
-- 5. BADGES & XP
-- ============================================================================

-- badges: badge definitions
CREATE TABLE badges (
  badge_id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label           VARCHAR NOT NULL,
  description     TEXT,
  icon_url        VARCHAR,
  criteria_type   VARCHAR,
  criteria_value  VARCHAR
);

-- user_badges: user progress on badges (users M:M badges)
CREATE TABLE user_badges (
  user_badge_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id        INT NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
  progress_value  INT NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  UNIQUE (user_id, badge_id)
);

-- xp_events: raw XP event log
CREATE TABLE xp_events (
  xp_event_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  source_type VARCHAR NOT NULL,
  source_id   INT,
  xp_amount   INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 6. USER TERM LEARNING & SM-2
-- ============================================================================

-- user_term_progress: one user's current state for one term
CREATE TABLE user_term_progress (
  user_term_progress_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                 UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  term_id                 INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  learning_status         VARCHAR NOT NULL DEFAULT 'new',
  correct_in_session      INT NOT NULL DEFAULT 0,
  times_seen              INT NOT NULL DEFAULT 0,
  times_correct           INT NOT NULL DEFAULT 0,
  times_incorrect         INT NOT NULL DEFAULT 0,
  times_skipped           INT NOT NULL DEFAULT 0,
  times_marked_known      INT NOT NULL DEFAULT 0,
  current_strength_level  INT NOT NULL DEFAULT 0,
  is_marked_known         BOOLEAN NOT NULL DEFAULT FALSE,
  is_due_for_review       BOOLEAN NOT NULL DEFAULT FALSE,
  last_answered_at        TIMESTAMPTZ,
  last_reviewed_at        TIMESTAMPTZ,
  next_review_at          TIMESTAMPTZ,
  UNIQUE (user_id, term_id)
);

-- user_term_sm2: SM-2 algorithm values (1:0..1 with user_term_progress)
CREATE TABLE user_term_sm2 (
  user_term_progress_id   INT PRIMARY KEY REFERENCES user_term_progress(user_term_progress_id) ON DELETE CASCADE,
  ef                      FLOAT NOT NULL DEFAULT 2.5,
  repetition              INT NOT NULL DEFAULT 0,
  interval_days           INT NOT NULL DEFAULT 0,
  last_q_score            INT DEFAULT 0,
  review_due_at           TIMESTAMPTZ
);

-- user_term_status_history: tracks status changes over time
CREATE TABLE user_term_status_history (
  status_history_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_term_progress_id   INT NOT NULL REFERENCES user_term_progress(user_term_progress_id) ON DELETE CASCADE,
  old_status              VARCHAR,
  new_status              VARCHAR NOT NULL,
  changed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_reason           VARCHAR
);


-- ============================================================================
-- 7. PROGRESS THROUGH SUBUNITS & SESSIONS
-- ============================================================================

-- user_subunit_progress: user's progress bar for a subunit
CREATE TABLE user_subunit_progress (
  user_subunit_progress_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                   UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_id                INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  progress_percent          INT NOT NULL DEFAULT 0,
  total_terms               INT NOT NULL DEFAULT 0,
  terms_learnt_count        INT NOT NULL DEFAULT 0,
  terms_marked_known_count  INT NOT NULL DEFAULT 0,
  is_completed              BOOLEAN NOT NULL DEFAULT FALSE,
  started_at                TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  last_activity_at          TIMESTAMPTZ,
  UNIQUE (user_id, subunit_id)
);

-- user_subunit_session_progress: user progress per session within a subunit
CREATE TABLE user_subunit_session_progress (
  user_subunit_session_progress_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_session_id                INT NOT NULL REFERENCES subunit_sessions(subunit_session_id) ON DELETE CASCADE,
  status                            VARCHAR NOT NULL DEFAULT 'not_started',
  started_at                        TIMESTAMPTZ,
  completed_at                      TIMESTAMPTZ,
  last_activity_at                  TIMESTAMPTZ,
  UNIQUE (user_id, subunit_session_id)
);

-- session_attempts: each actual attempt at a subunit session
CREATE TABLE session_attempts (
  session_attempt_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id               UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subunit_id            INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  subunit_session_id    INT NOT NULL REFERENCES subunit_sessions(subunit_session_id) ON DELETE CASCADE,
  attempt_number        INT NOT NULL DEFAULT 1,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at              TIMESTAMPTZ,
  status                VARCHAR NOT NULL DEFAULT 'in_progress',
  questions_answered    INT NOT NULL DEFAULT 0,
  score_percent         INT
);


-- ============================================================================
-- 8. QUESTION STRUCTURE FOR NORMAL SESSIONS
-- ============================================================================

-- question_types: flashcard, match, audio, speak, comprehension MCQ, etc.
CREATE TABLE question_types (
  question_type_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code              VARCHAR NOT NULL UNIQUE,
  name              VARCHAR NOT NULL
);

-- session_questions: each question shown in a session attempt
CREATE TABLE session_questions (
  session_question_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_attempt_id    INT NOT NULL REFERENCES session_attempts(session_attempt_id) ON DELETE CASCADE,
  subunit_session_id    INT NOT NULL REFERENCES subunit_sessions(subunit_session_id) ON DELETE CASCADE,
  question_type_id      INT NOT NULL REFERENCES question_types(question_type_id) ON DELETE CASCADE,
  term_id               INT REFERENCES terms(term_id) ON DELETE SET NULL,
  prompt_text           TEXT,
  audio_url             VARCHAR,
  image_url             VARCHAR,
  display_order         INT NOT NULL DEFAULT 0,
  is_review_question    BOOLEAN NOT NULL DEFAULT FALSE
);

-- session_question_options: selectable answer choices
CREATE TABLE session_question_options (
  session_question_option_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_question_id         INT NOT NULL REFERENCES session_questions(session_question_id) ON DELETE CASCADE,
  option_text                 VARCHAR NOT NULL,
  is_correct                  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order                  INT NOT NULL DEFAULT 0
);

-- session_question_attempts: user's answer to each question
CREATE TABLE session_question_attempts (
  session_question_attempt_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_question_id         INT NOT NULL REFERENCES session_questions(session_question_id) ON DELETE CASCADE,
  user_id                     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  selected_option_id          INT REFERENCES session_question_options(session_question_option_id) ON DELETE SET NULL,
  typed_answer                TEXT,
  speech_transcript           TEXT,
  pronunciation_score         INT,
  q_score                     INT,
  is_correct                  BOOLEAN,
  feedback_text               TEXT,
  skipped                     BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 9. COMPREHENSION CONVERSATIONS
-- ============================================================================

-- comprehension_conversations: reusable conversation/audio source
CREATE TABLE comprehension_conversations (
  comprehension_conversation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cefr_level_id                 INT NOT NULL REFERENCES cefr_levels(cefr_level_id) ON DELETE CASCADE,
  title                         VARCHAR NOT NULL,
  audio_url                     VARCHAR,
  written_spanish_text          TEXT,
  english_summary               TEXT,
  is_final_level_review         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active                     BOOLEAN NOT NULL DEFAULT TRUE
);

-- comprehension_questions: questions tied to a conversation
CREATE TABLE comprehension_questions (
  comprehension_question_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comprehension_conversation_id INT NOT NULL REFERENCES comprehension_conversations(comprehension_conversation_id) ON DELETE CASCADE,
  question_type                 VARCHAR NOT NULL,
  question_text                 TEXT NOT NULL,
  sort_order                    INT NOT NULL DEFAULT 0
);

-- comprehension_question_options: MCQ options
CREATE TABLE comprehension_question_options (
  comprehension_question_option_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comprehension_question_id         INT NOT NULL REFERENCES comprehension_questions(comprehension_question_id) ON DELETE CASCADE,
  option_text                       VARCHAR NOT NULL,
  is_correct                        BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order                        INT NOT NULL DEFAULT 0
);

-- session_question_comprehension_links: links session question to reusable comprehension content
CREATE TABLE session_question_comprehension_links (
  session_question_id       INT PRIMARY KEY REFERENCES session_questions(session_question_id) ON DELETE CASCADE,
  comprehension_question_id INT NOT NULL REFERENCES comprehension_questions(comprehension_question_id) ON DELETE CASCADE
);


-- ============================================================================
-- 10. ROLEPLAY
-- ============================================================================

-- roleplay_topics: scenario topics (Ordering at a Café, etc.)
CREATE TABLE roleplay_topics (
  roleplay_topic_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title               VARCHAR NOT NULL,
  brief_text          TEXT,
  context_text        TEXT,
  difficulty_level    VARCHAR,
  sort_order          INT NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

-- roleplay_required_criteria: things to include in roleplay
CREATE TABLE roleplay_required_criteria (
  roleplay_criteria_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_topic_id     INT NOT NULL REFERENCES roleplay_topics(roleplay_topic_id) ON DELETE CASCADE,
  criteria_text         TEXT NOT NULL,
  sort_order            INT NOT NULL DEFAULT 0
);

-- roleplay_topic_subunit_links: bridge (roleplay_topics M:M subunits)
CREATE TABLE roleplay_topic_subunit_links (
  roleplay_topic_subunit_link_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_topic_id               INT NOT NULL REFERENCES roleplay_topics(roleplay_topic_id) ON DELETE CASCADE,
  subunit_id                      INT NOT NULL REFERENCES subunits(subunit_id) ON DELETE CASCADE,
  UNIQUE (roleplay_topic_id, subunit_id)
);

-- roleplay_attempts: each user roleplay attempt
CREATE TABLE roleplay_attempts (
  roleplay_attempt_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  roleplay_topic_id   INT NOT NULL REFERENCES roleplay_topics(roleplay_topic_id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at            TIMESTAMPTZ,
  duration_seconds    INT,
  accuracy_score      INT,
  xp_awarded          INT NOT NULL DEFAULT 0
);

-- roleplay_messages: each dialogue turn
CREATE TABLE roleplay_messages (
  roleplay_message_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_attempt_id INT NOT NULL REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  sender_type         VARCHAR NOT NULL,
  message_mode        VARCHAR,
  message_text        TEXT,
  audio_url           VARCHAR,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- roleplay_criteria_results: whether each criterion was met
CREATE TABLE roleplay_criteria_results (
  roleplay_criteria_result_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_attempt_id         INT NOT NULL REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  roleplay_criteria_id        INT NOT NULL REFERENCES roleplay_required_criteria(roleplay_criteria_id) ON DELETE CASCADE,
  is_met                      BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_text               TEXT,
  UNIQUE (roleplay_attempt_id, roleplay_criteria_id)
);

-- roleplay_feedback: final feedback (1:0..1 with roleplay_attempts)
CREATE TABLE roleplay_feedback (
  roleplay_attempt_id             INT PRIMARY KEY REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  writing_spelling_score          INT,
  writing_punctuation_score       INT,
  writing_accent_characters_score INT,
  writing_grammar_score           INT,
  speaking_pronunciation_score    INT,
  speaking_accent_score           INT,
  speaking_grammar_score          INT,
  summary_text                    TEXT
);

-- roleplay_difficult_terms: difficult words flagged at end (roleplay_attempts M:M terms)
CREATE TABLE roleplay_difficult_terms (
  roleplay_difficult_term_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  roleplay_attempt_id         INT NOT NULL REFERENCES roleplay_attempts(roleplay_attempt_id) ON DELETE CASCADE,
  term_id                     INT NOT NULL REFERENCES terms(term_id) ON DELETE CASCADE,
  difficulty_area             VARCHAR,
  UNIQUE (roleplay_attempt_id, term_id)
);


-- ============================================================================
-- 11. ISSUE REPORTING
-- ============================================================================

CREATE TABLE issue_reports (
  issue_report_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_type     VARCHAR NOT NULL,
  target_id       INT NOT NULL,
  issue_category  VARCHAR,
  description     TEXT,
  status          VARCHAR NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);


-- ============================================================================
-- INDEXES
-- ============================================================================

-- Course structure
CREATE INDEX idx_units_cefr_level ON units(cefr_level_id);
CREATE INDEX idx_subunits_unit ON subunits(unit_id);
CREATE INDEX idx_subunit_sessions_subunit ON subunit_sessions(subunit_id);

-- Terms
CREATE INDEX idx_subunit_terms_subunit ON subunit_terms(subunit_id);
CREATE INDEX idx_subunit_terms_term ON subunit_terms(term_id);
CREATE INDEX idx_term_pronunciation_hints_term ON term_pronunciation_hints(term_id);

-- Grammar
CREATE INDEX idx_verbs_category ON verbs(verb_category_id);
CREATE INDEX idx_verb_conjugations_verb ON verb_conjugations(verb_id);
CREATE INDEX idx_verb_conjugations_tense ON verb_conjugations(tense_id);
CREATE INDEX idx_verb_conjugations_pronoun ON verb_conjugations(pronoun_id);
CREATE INDEX idx_term_grammar_links_term ON term_grammar_links(term_id);
CREATE INDEX idx_term_grammar_links_topic ON term_grammar_links(grammar_topic_id);

-- User lookups
CREATE INDEX idx_user_auth_providers_user ON user_auth_providers(user_id);
CREATE INDEX idx_user_activity_days_user ON user_activity_days(user_id);
CREATE INDEX idx_user_activity_days_date ON user_activity_days(user_id, activity_date);

-- Badges & XP
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_xp_events_user ON xp_events(user_id);

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

-- Public content tables: readable by everyone
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
ALTER TABLE term_grammar_links ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY term_grammar_links_public ON term_grammar_links FOR SELECT USING (TRUE);
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

-- Users: own profile
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = user_id);

-- User settings
CREATE POLICY user_settings_select ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_settings_insert ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_settings_update ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- User auth providers
CREATE POLICY user_auth_providers_select ON user_auth_providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_auth_providers_insert ON user_auth_providers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User stats
CREATE POLICY user_stats_select ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_stats_insert ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_stats_update ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- User activity days
CREATE POLICY user_activity_days_select ON user_activity_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_activity_days_insert ON user_activity_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_activity_days_update ON user_activity_days FOR UPDATE USING (auth.uid() = user_id);

-- User badges
CREATE POLICY user_badges_select ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_badges_insert ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_badges_update ON user_badges FOR UPDATE USING (auth.uid() = user_id);

-- XP events
CREATE POLICY xp_events_select ON xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY xp_events_insert ON xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User term progress
CREATE POLICY user_term_progress_select ON user_term_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_term_progress_insert ON user_term_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_term_progress_update ON user_term_progress FOR UPDATE USING (auth.uid() = user_id);

-- User term SM2 (accessed via user_term_progress join)
CREATE POLICY user_term_sm2_select ON user_term_sm2 FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_sm2.user_term_progress_id AND user_term_progress.user_id = auth.uid()));
CREATE POLICY user_term_sm2_insert ON user_term_sm2 FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_sm2.user_term_progress_id AND user_term_progress.user_id = auth.uid()));
CREATE POLICY user_term_sm2_update ON user_term_sm2 FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_sm2.user_term_progress_id AND user_term_progress.user_id = auth.uid()));

-- User term status history
CREATE POLICY user_term_status_history_select ON user_term_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_status_history.user_term_progress_id AND user_term_progress.user_id = auth.uid()));
CREATE POLICY user_term_status_history_insert ON user_term_status_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_term_progress WHERE user_term_progress.user_term_progress_id = user_term_status_history.user_term_progress_id AND user_term_progress.user_id = auth.uid()));

-- User subunit progress
CREATE POLICY user_subunit_progress_select ON user_subunit_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_subunit_progress_insert ON user_subunit_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_subunit_progress_update ON user_subunit_progress FOR UPDATE USING (auth.uid() = user_id);

-- User subunit session progress
CREATE POLICY user_subunit_session_progress_select ON user_subunit_session_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_subunit_session_progress_insert ON user_subunit_session_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_subunit_session_progress_update ON user_subunit_session_progress FOR UPDATE USING (auth.uid() = user_id);

-- Session attempts
CREATE POLICY session_attempts_select ON session_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY session_attempts_insert ON session_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY session_attempts_update ON session_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Session questions (accessed via session_attempts join)
CREATE POLICY session_questions_select ON session_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM session_attempts WHERE session_attempts.session_attempt_id = session_questions.session_attempt_id AND session_attempts.user_id = auth.uid()));
CREATE POLICY session_questions_insert ON session_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM session_attempts WHERE session_attempts.session_attempt_id = session_questions.session_attempt_id AND session_attempts.user_id = auth.uid()));

-- Session question options (accessed via session_questions -> session_attempts join)
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

-- Session question attempts
CREATE POLICY session_question_attempts_select ON session_question_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY session_question_attempts_insert ON session_question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Session question comprehension links (accessed via session_questions -> session_attempts)
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

-- Roleplay attempts
CREATE POLICY roleplay_attempts_select ON roleplay_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY roleplay_attempts_insert ON roleplay_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY roleplay_attempts_update ON roleplay_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Roleplay messages (via roleplay_attempts join)
CREATE POLICY roleplay_messages_select ON roleplay_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_messages.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_messages_insert ON roleplay_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_messages.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

-- Roleplay criteria results
CREATE POLICY roleplay_criteria_results_select ON roleplay_criteria_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_criteria_results.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_criteria_results_insert ON roleplay_criteria_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_criteria_results.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

-- Roleplay feedback
CREATE POLICY roleplay_feedback_select ON roleplay_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_feedback.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_feedback_insert ON roleplay_feedback FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_feedback.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

-- Roleplay difficult terms
CREATE POLICY roleplay_difficult_terms_select ON roleplay_difficult_terms FOR SELECT
  USING (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_difficult_terms.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));
CREATE POLICY roleplay_difficult_terms_insert ON roleplay_difficult_terms FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM roleplay_attempts WHERE roleplay_attempts.roleplay_attempt_id = roleplay_difficult_terms.roleplay_attempt_id AND roleplay_attempts.user_id = auth.uid()));

-- Issue reports
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
  ('flashcard',           'Flashcard'),
  ('match_en_es',         'Match English to Spanish'),
  ('audio_es_type_en',    'Audio Spanish - Type English'),
  ('speak_es',            'Speak Spanish Term'),
  ('comprehension_mcq',   'Comprehension MCQ'),
  ('comprehension_typed', 'Comprehension Typed');

INSERT INTO grammar_verb_categories (name, sort_order) VALUES
  ('-ar verbs', 1),
  ('-er verbs', 2),
  ('-ir verbs', 3);

INSERT INTO pronouns (pronoun_text, person_group, sort_order) VALUES
  ('yo',              '1st singular', 1),
  ('tú',              '2nd singular', 2),
  ('él/ella/usted',   '3rd singular', 3),
  ('nosotros/as',     '1st plural',   4),
  ('vosotros/as',     '2nd plural',   5),
  ('ellos/ellas/ustedes', '3rd plural', 6);

INSERT INTO tenses (name, sort_order) VALUES
  ('Present',    1),
  ('Preterite',  2),
  ('Imperfect',  3),
  ('Future',     4),
  ('Conditional', 5),
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

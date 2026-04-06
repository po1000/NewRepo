-- ============================================================
-- SEED: Tenses, Pronouns, Verbs, Conjugations, Grammar Hints
-- ============================================================

-- Clean existing grammar data
DELETE FROM grammar_hint_conjugation_links;
DELETE FROM grammar_hint_verb_links;
DELETE FROM term_grammar_hints;
DELETE FROM grammar_hints;
DELETE FROM verb_conjugations;
DELETE FROM verbs;
DELETE FROM grammar_verb_categories;
DELETE FROM pronouns;
DELETE FROM tenses;

-- ============================================================
-- VERB CATEGORIES
-- ============================================================

INSERT INTO grammar_verb_categories (name, description, sort_order) VALUES
  ('ar', 'Regular -ar verbs', 1),
  ('er', 'Regular -er verbs', 2),
  ('ir', 'Regular -ir verbs', 3),
  ('irregular', 'Irregular verbs', 4),
  ('reflexive', 'Reflexive verbs', 5);

-- ============================================================
-- TENSES (with hover descriptions)
-- ============================================================

INSERT INTO tenses (name, english_name, description, sort_order) VALUES
  ('present', 'Present', 'Used for actions happening now or habitual actions. "I eat, I am eating."', 1),
  ('preterite', 'Preterite', 'Used for completed actions in the past. "I ate, I did eat."', 2),
  ('imperfect', 'Imperfect', 'Used for ongoing or repeated past actions. "I used to eat, I was eating."', 3),
  ('future', 'Future', 'Used for actions that will happen. "I will eat."', 4),
  ('conditional', 'Conditional', 'Used for hypothetical actions or polite requests. "I would eat."', 5),
  ('subjunctive_present', 'Present Subjunctive', 'Used when an action is not definitely happening - hypothetical, wished for, or imagined. "I wish I were taller."', 6);

-- ============================================================
-- PRONOUNS
-- ============================================================

INSERT INTO pronouns (pronoun_text, person_group, sort_order) VALUES
  ('yo', '1st singular', 1),
  ('tú', '2nd singular', 2),
  ('él/ella/usted', '3rd singular', 3),
  ('nosotros/as', '1st plural', 4),
  ('vosotros/as', '2nd plural', 5),
  ('ellos/ellas/ustedes', '3rd plural', 6);

-- ============================================================
-- VERBS
-- ============================================================

INSERT INTO verbs (infinitive, english_meaning, is_irregular, verb_category_id) VALUES
  ('estar', 'to be (temporary)', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('ser', 'to be (permanent)', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('hablar', 'to speak', false, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'ar')),
  ('poder', 'to be able to', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('entender', 'to understand', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'er')),
  ('decir', 'to say/tell', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('tener', 'to have', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('necesitar', 'to need', false, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'ar')),
  ('querer', 'to want', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('llamarse', 'to call oneself', false, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'reflexive')),
  ('ir', 'to go', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('hacer', 'to do/make', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('ver', 'to see', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular')),
  ('pagar', 'to pay', false, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'ar')),
  ('haber', 'to have (auxiliary)', true, (SELECT verb_category_id FROM grammar_verb_categories WHERE name = 'irregular'));

-- ============================================================
-- CONJUGATIONS — Present tense
-- ============================================================

-- estar
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','estoy'),('tú','estás'),('él/ella/usted','está'),('nosotros/as','estamos'),('vosotros/as','estáis'),('ellos/ellas/ustedes','están')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'estar' AND t.name = 'present';

-- ser
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','soy'),('tú','eres'),('él/ella/usted','es'),('nosotros/as','somos'),('vosotros/as','sois'),('ellos/ellas/ustedes','son')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'ser' AND t.name = 'present';

-- hablar
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, false
FROM verbs v, tenses t,
  (VALUES ('yo','hablo'),('tú','hablas'),('él/ella/usted','habla'),('nosotros/as','hablamos'),('vosotros/as','habláis'),('ellos/ellas/ustedes','hablan')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'hablar' AND t.name = 'present';

-- poder
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','puedo'),('tú','puedes'),('él/ella/usted','puede'),('nosotros/as','podemos'),('vosotros/as','podéis'),('ellos/ellas/ustedes','pueden')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'poder' AND t.name = 'present';

-- entender
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','entiendo'),('tú','entiendes'),('él/ella/usted','entiende'),('nosotros/as','entendemos'),('vosotros/as','entendéis'),('ellos/ellas/ustedes','entienden')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'entender' AND t.name = 'present';

-- decir
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','digo'),('tú','dices'),('él/ella/usted','dice'),('nosotros/as','decimos'),('vosotros/as','decís'),('ellos/ellas/ustedes','dicen')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'decir' AND t.name = 'present';

-- tener
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','tengo'),('tú','tienes'),('él/ella/usted','tiene'),('nosotros/as','tenemos'),('vosotros/as','tenéis'),('ellos/ellas/ustedes','tienen')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'tener' AND t.name = 'present';

-- necesitar
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, false
FROM verbs v, tenses t,
  (VALUES ('yo','necesito'),('tú','necesitas'),('él/ella/usted','necesita'),('nosotros/as','necesitamos'),('vosotros/as','necesitáis'),('ellos/ellas/ustedes','necesitan')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'necesitar' AND t.name = 'present';

-- querer
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','quiero'),('tú','quieres'),('él/ella/usted','quiere'),('nosotros/as','queremos'),('vosotros/as','queréis'),('ellos/ellas/ustedes','quieren')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'querer' AND t.name = 'present';

-- ir
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','voy'),('tú','vas'),('él/ella/usted','va'),('nosotros/as','vamos'),('vosotros/as','vais'),('ellos/ellas/ustedes','van')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'ir' AND t.name = 'present';

-- hacer
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','hago'),('tú','haces'),('él/ella/usted','hace'),('nosotros/as','hacemos'),('vosotros/as','hacéis'),('ellos/ellas/ustedes','hacen')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'hacer' AND t.name = 'present';

-- ver
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','veo'),('tú','ves'),('él/ella/usted','ve'),('nosotros/as','vemos'),('vosotros/as','veis'),('ellos/ellas/ustedes','ven')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'ver' AND t.name = 'present';

-- pagar
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, false
FROM verbs v, tenses t,
  (VALUES ('yo','pago'),('tú','pagas'),('él/ella/usted','paga'),('nosotros/as','pagamos'),('vosotros/as','pagáis'),('ellos/ellas/ustedes','pagan')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'pagar' AND t.name = 'present';

-- haber
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','he'),('tú','has'),('él/ella/usted','ha/hay'),('nosotros/as','hemos'),('vosotros/as','habéis'),('ellos/ellas/ustedes','han')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'haber' AND t.name = 'present';

-- ============================================================
-- CONJUGATIONS — Preterite tense (key verbs)
-- ============================================================

-- ir (preterite)
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','fui'),('tú','fuiste'),('él/ella/usted','fue'),('nosotros/as','fuimos'),('vosotros/as','fuisteis'),('ellos/ellas/ustedes','fueron')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'ir' AND t.name = 'preterite';

-- hacer (preterite)
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','hice'),('tú','hiciste'),('él/ella/usted','hizo'),('nosotros/as','hicimos'),('vosotros/as','hicisteis'),('ellos/ellas/ustedes','hicieron')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'hacer' AND t.name = 'preterite';

-- ver (preterite)
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','vi'),('tú','viste'),('él/ella/usted','vio'),('nosotros/as','vimos'),('vosotros/as','visteis'),('ellos/ellas/ustedes','vieron')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'ver' AND t.name = 'preterite';

-- estar (preterite)
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','estuve'),('tú','estuviste'),('él/ella/usted','estuvo'),('nosotros/as','estuvimos'),('vosotros/as','estuvisteis'),('ellos/ellas/ustedes','estuvieron')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'estar' AND t.name = 'preterite';

-- tener (preterite)
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','tuve'),('tú','tuviste'),('él/ella/usted','tuvo'),('nosotros/as','tuvimos'),('vosotros/as','tuvisteis'),('ellos/ellas/ustedes','tuvieron')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'tener' AND t.name = 'preterite';

-- poder (preterite)
INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
SELECT v.verb_id, p.pronoun_id, t.tense_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','pude'),('tú','pudiste'),('él/ella/usted','pudo'),('nosotros/as','pudimos'),('vosotros/as','pudisteis'),('ellos/ellas/ustedes','pudieron')) AS c(pron, form)
  JOIN pronouns p ON p.pronoun_text = c.pron
WHERE v.infinitive = 'poder' AND t.name = 'preterite';

-- ============================================================
-- GRAMMAR HINTS — per subunit (linked via term_grammar_hints)
-- Full curriculum content with detailed explanations
-- ============================================================

-- === A1 1.1: Hola, How's It Going? ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Gender + Number Agreement', 'In Spanish, all nouns fit into these categories: Feminine/Masculine/Neutral | Singular/Plural.

If a noun is plural, the word(s) that describe it become plural too. If feminine, they become feminine too.

"día" means "day" and is a Masculine singular noun (día has no feminine form, but some words do have both masculine and feminine versions).

"bueno" means "good" and is a Masculine singular adjective.

"días" is the Masculine plural form of día which is used in "Good Morning" — think of it like you''re wishing someone good mornings in general, not just a single day.

You are using the word "good" (bueno) (Masculine singular) to describe "mornings" (días) (Masculine plural). Therefore, bueno needs to match the noun and become Masculine plural. Bueno → Buenos.', 'concept'),

  ('Infinitive: Estar', 'An infinitive is the base form of a verb — the "to ___" form. e.g. Estoy comes from Estar = "to be", used for temporary states (how you feel, where you are) and more.', 'concept'),

  ('Conjugation: Estar', 'Conjugation is when you change a verb to match who is doing the action. Estar: estoy, estás, está, estamos, estáis, están', 'conjugation'),

  ('Formality: Tú vs Usted', 'When speaking to friends, family, or people your age, you use the informal form (tú). When speaking to strangers, elders, or in professional settings, you use the formal form (usted). Tú (singular informal) vs Usted (singular formal).', 'concept');

-- Link Gender + Number Agreement to Buenos días, Buenas tardes, Buenas noches
INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Buenos días' AND gh.hint_title = 'Gender + Number Agreement';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Buenas tardes' AND gh.hint_title = 'Gender + Number Agreement';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Buenas noches' AND gh.hint_title = 'Gender + Number Agreement';

-- Link Infinitive + Conjugation Estar to Estoy feliz, Estoy triste
INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy feliz' AND gh.hint_title = 'Infinitive: Estar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy feliz' AND gh.hint_title = 'Conjugation: Estar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy triste' AND gh.hint_title = 'Infinitive: Estar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy triste' AND gh.hint_title = 'Conjugation: Estar';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Estar' AND v.infinitive = 'estar';

-- Link Formality to ¿Cómo estás? and ¿Cómo está?
INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Cómo estás?' AND gh.hint_title = 'Formality: Tú vs Usted';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Cómo está?' AND gh.hint_title = 'Formality: Tú vs Usted';


-- === A1 1.2: Putting Names to Faces ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Articles Intro', '"El" is "the" for masculine singular words and "La" is "the" for feminine singular words. "Las" is "the" for feminine plural words and "Los" is "the" for masculine plural words.', 'concept'),

  ('Ser: to be (permanent)', 'Soy comes from Ser = "to be", used for permanence and more (identity, nationality, profession) — vs. Estar which is for temporary states.', 'concept'),

  ('Conjugation: Ser', 'Ser: soy, eres, es, somos, sois, son', 'conjugation'),

  ('Demonstratives', '"This and these have the t''s, that and those don''t."

This/These: este (masc.), esta (fem.), esto (neutral), estos (masc. pl.), estas (fem. pl.)
That/Those: ese, esa, eso, esos, esas

Gender agreement applies — use the form that matches the noun.', 'concept'),

  ('Reflexive Infinitive Intro', 'Me llamo comes from Llamarse = "to call oneself". The "-se" ending on an infinitive means the action reflects back on the person doing it.', 'concept'),

  ('The -mente Suffix', '''-mente'' is always ''-ly'' in English. So "igualmente" literally means "equal-ly" (likewise). "Generalmente" = "general-ly".', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'El nombre' AND gh.hint_title = 'Articles Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'El apellido' AND gh.hint_title = 'Articles Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Soy...' AND gh.hint_title = 'Ser: to be (permanent)';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Soy...' AND gh.hint_title = 'Conjugation: Ser';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Ser' AND v.infinitive = 'ser';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Este es' AND gh.hint_title = 'Demonstratives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Esta es' AND gh.hint_title = 'Demonstratives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Me llamo' AND gh.hint_title = 'Reflexive Infinitive Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Cómo te llamas?' AND gh.hint_title = 'Reflexive Infinitive Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Igualmente' AND gh.hint_title = 'The -mente Suffix';


-- === A1 2.1: Lost in Translation ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Conjugation: Hablar', 'Hablar (to speak): hablo, hablas, habla, hablamos, habláis, hablan', 'conjugation'),

  ('Conjugation: Poder', 'Poder (to be able to): puedo, puedes, puede, podemos, podéis, pueden', 'conjugation'),

  ('Stem-Changing Verbs Intro', 'When you take an infinitive e.g. "Hablar" and remove the ar/ir/er — Habl, you''re left with the stem of a word. When you conjugate words, you add new endings based on who''s doing the action.

Stem-changing verbs don''t only change their ending but also change their stem when talking about different people.

PATTERNS: The ''we'' form NEVER changes stem regardless of the verb. When a stem changes, ''o'' usually becomes ''ue'', ''e'' usually becomes ''ie'' or ''i''.

Examples: Poder → Puedo, Puedes, Puede, Podemos… | Entender → Entiendo, Entiendes, Entiende, Entendemos | Decir → Digo, Dices, Dice, Decimos', 'concept'),

  ('Poder + Infinitive', 'Poder + Infinitive for polite requests: "¿Puede repetir?" = "Can you repeat?" "¿Puede hablar más despacio?" = "Can you speak more slowly?"', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Habla inglés?' AND gh.hint_title = 'Conjugation: Hablar';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Hablar' AND v.infinitive = 'hablar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_title = 'Conjugation: Poder';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_title = 'Stem-Changing Verbs Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'No entiendo' AND gh.hint_title = 'Stem-Changing Verbs Intro';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Poder' AND v.infinitive = 'poder';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Puede repetir por favor?' AND gh.hint_title = 'Poder + Infinitive';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Más despacio, por favor' AND gh.hint_title = 'Poder + Infinitive';


-- === A1 2.2: Help is on the Way ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Conjugation: Tener', 'Tener (to have): tengo, tienes, tiene, tenemos, tenéis, tienen', 'conjugation'),

  ('Conjugation: Necesitar', 'Necesitar (to need): necesito, necesitas, necesita, necesitamos, necesitáis, necesitan', 'conjugation'),

  ('Personal A', 'In English you say "Call the police" or "Call Lucy" — verb then person/service. In Spanish, when a person (subject) is doing an action to another person or service of people (the object), you need to put ''a'' meaning ''to'' in-between the verb and object.

Hence ''Llame a la policía'' literally means ''Call to the police'' but is grammatically correct. Personal ''a'' signifies that humans are the recipients of the action. You make calls to people or services of people.

How come ''Llame a una ambulancia'' needs personal ''a'' but ''Necesito una ambulancia'' doesn''t? You''re expressing the need for what the service actually provides, so ''una ambulancia'' becomes the physical vehicle service here, no longer the people.

Think of it like ''Call the <service of people who send the ambulance>'' vs ''I need <an ambulance vehicle>''.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Tengo un problema' AND gh.hint_title = 'Conjugation: Tener';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Tener' AND v.infinitive = 'tener';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Necesito ayuda' AND gh.hint_title = 'Conjugation: Necesitar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Necesitar' AND gh.hint_title = 'Conjugation: Necesitar';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Necesitar' AND v.infinitive = 'necesitar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Llame a la policía' AND gh.hint_title = 'Personal A';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Llame a una ambulancia' AND gh.hint_title = 'Personal A';


-- === A1 3.1: Day at the Café ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Conjugation: Querer', 'Querer (to want): quiero, quieres, quiere, queremos, queréis, quieren', 'conjugation'),

  ('Me pone Idiom', '"Me pone un/una…" is common in Spain (cafés, bars). Literally "Will you put…?" but used to mean "serve / get me a…"', 'info');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Quiero...' AND gh.hint_title = 'Conjugation: Querer';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Querer' AND gh.hint_title = 'Conjugation: Querer';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Querer' AND v.infinitive = 'querer';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text LIKE 'Me pone un/una%' AND gh.hint_title = 'Me pone Idiom';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Me pone un café?' AND gh.hint_title = 'Me pone Idiom';


-- === A1 4.1: Map Mode ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Interrogatives', 'What? ¿Qué? — ¿Qué es esto?
Who? ¿Quién? (Singular) / ¿Quiénes? (Plural) — ¿Quién es tu profesor favorito? ¿Quiénes son tus mejores amigos?
Where? ¿Dónde? — ¿Dónde está el baño?
When? ¿Cuándo? — ¿Cuándo es tu cumple?
How? ¿Cómo? — ¿Cómo estás?
Which? ¿Cuál? (Singular) / ¿Cuáles? (Plural) — ¿Cuál es tu color favorito? ¿Cuáles son tus películas favoritas?
Why? ¿Por qué? — ¿Por qué preguntas?
How much? ¿Cuánto/a? — ¿Cuánto cuesta?', 'concept'),

  ('Simple Imperatives', 'Simple Imperatives are commands. They are formed from the usted (formal) form of the verb. Examples: Girar → Gire (turn), Seguir → Siga (continue), Cruzar → Cruce (cross). Used when giving directions.', 'concept'),

  ('Haber and Hay', '"Hay" means "there is / there are". It comes from Haber, an auxiliary verb. Conjugation: he, has, ha/hay, hemos, habéis, han.', 'conjugation');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Dónde está...?' AND gh.hint_title = 'Interrogatives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Cómo llego a...?' AND gh.hint_title = 'Interrogatives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Girar' AND gh.hint_title = 'Simple Imperatives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Cruzar' AND gh.hint_title = 'Simple Imperatives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Hay' AND gh.hint_title = 'Haber and Hay';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Dónde hay un/una...?' AND gh.hint_title = 'Haber and Hay';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Haber and Hay' AND v.infinitive = 'haber';


-- === A2 1.1: Relative Truths: Family ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Possessives', 'Family vocabulary with possessives: mi (my), tu (your), su (his/her/your formal). "Mi madre" = my mother, "tu hermano" = your brother, "su padre" = his/her father.', 'concept'),

  ('Parecerse a', 'Parecerse a = to resemble / look like someone. "Se parece a su padre" = He/she looks like his/her father. The reflexive "se" + "a" before the person being resembled.', 'concept'),

  ('Muy/Bastante + Adjective', 'Muy/bastante + adjective for degree. "Es muy simpático" = He''s very nice. "Bastante trabajadora" = quite hardworking. Muy = very, bastante = quite/fairly.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Mi madre es amable' AND gh.hint_title = 'Possessives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Mi hermano es divertido' AND gh.hint_title = 'Possessives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Mi hermana es muy trabajadora' AND gh.hint_title = 'Possessives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Se parece a su padre' AND gh.hint_title = 'Parecerse a';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿A quién te pareces?' AND gh.hint_title = 'Parecerse a';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Es muy simpático/a' AND gh.hint_title = 'Muy/Bastante + Adjective';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Mi hermana es muy trabajadora' AND gh.hint_title = 'Muy/Bastante + Adjective';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Somos muy diferentes' AND gh.hint_title = 'Muy/Bastante + Adjective';


-- === A2 2.1: Rinse and Repeat ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Frequency Adverbs', 'Frequency adverbs usually go before the verb: "Siempre desayuno" (I always have breakfast). They can also go at the start or end of the sentence.', 'concept'),

  ('Cada + Time / Todos los + Plural', 'Cada + time: cada día (every day), cada semana (every week).

Todos los + plural time: todos los días (every day), todos los lunes (every Monday). "Todos" means "all" or "every" — so "todos los días" literally means "all the days", and "todos los lunes" literally means "all the Mondays".', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Siempre' AND gh.hint_title = 'Frequency Adverbs';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Nunca' AND gh.hint_title = 'Frequency Adverbs';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'A veces' AND gh.hint_title = 'Frequency Adverbs';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Normalmente' AND gh.hint_title = 'Frequency Adverbs';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Siempre desayuno' AND gh.hint_title = 'Frequency Adverbs';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Nunca como carne' AND gh.hint_title = 'Frequency Adverbs';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Todos los días' AND gh.hint_title = 'Cada + Time / Todos los + Plural';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Cada semana' AND gh.hint_title = 'Cada + Time / Todos los + Plural';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Dos veces a la semana' AND gh.hint_title = 'Cada + Time / Todos los + Plural';


-- === A2 3.1: Fill Me In ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Preterite Tense', 'Preterite tense is used for completed past actions.

Regular -ar endings: -é, -aste, -ó, -amos, -asteis, -aron
Regular -er/-ir endings: -í, -iste, -ió, -imos, -isteis, -ieron

Key irregulars: ir/ser → fui, fuiste, fue, fuimos, fuisteis, fueron. hacer → hice, hiciste, hizo, hicimos, hicisteis, hicieron. ver → vi, viste, vio, vimos, visteis, vieron.

More irregular preterites: ir → fui, salir → salí, estar → estuve, tener → tuve, poder → pude.', 'concept'),

  ('Conjugation: Ir', 'Ir (to go):
Present: voy, vas, va, vamos, vais, van
Preterite: fui, fuiste, fue, fuimos, fuisteis, fueron', 'conjugation');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ayer' AND gh.hint_title = 'Preterite Tense';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Anoche' AND gh.hint_title = 'Preterite Tense';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ayer fui a...' AND gh.hint_title = 'Preterite Tense';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Fuimos a un restaurante' AND gh.hint_title = 'Preterite Tense';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ir' AND gh.hint_title = 'Conjugation: Ir';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ayer fui a...' AND gh.hint_title = 'Conjugation: Ir';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Fuimos a un restaurante' AND gh.hint_title = 'Conjugation: Ir';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Dónde fuiste?' AND gh.hint_title = 'Conjugation: Ir';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Ir' AND v.infinitive = 'ir';


-- === A2 4.1: Tap and Go ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Sin + Noun', 'Sin + noun = "Without" + thing. Sin recibo = without receipt. Sin contacto = contactless.', 'concept'),

  ('No + Verb Negation', 'Put "no" directly before the verb. No funciona = It doesn''t work. No tengo cambio = I don''t have change. No aceptamos tarjeta = We don''t accept card.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'El recibo' AND gh.hint_title = 'Sin + Noun';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'En efectivo' AND gh.hint_title = 'Sin + Noun';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'No funciona' AND gh.hint_title = 'No + Verb Negation';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Con tarjeta' AND gh.hint_title = 'No + Verb Negation';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Aceptan tarjeta?' AND gh.hint_title = 'No + Verb Negation';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Tiene cambio?' AND gh.hint_title = 'No + Verb Negation';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Quédese con el cambio' AND gh.hint_title = 'No + Verb Negation';


-- ============================================================
-- GRANTS for grammar tables
-- ============================================================

GRANT SELECT ON tenses TO anon, authenticated;
GRANT SELECT ON pronouns TO anon, authenticated;
GRANT SELECT ON verbs TO anon, authenticated;
GRANT SELECT ON verb_conjugations TO anon, authenticated;
GRANT SELECT ON grammar_hints TO anon, authenticated;
GRANT SELECT ON term_grammar_hints TO anon, authenticated;
GRANT SELECT ON grammar_hint_verb_links TO anon, authenticated;
GRANT SELECT ON grammar_hint_conjugation_links TO anon, authenticated;

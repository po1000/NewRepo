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
-- ============================================================

-- === A1 1.1: Hola, How's It Going? ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Gender + Number Agreement', 'All Spanish nouns are Feminine, Masculine, or Neutral and Singular or Plural. If a noun is plural, the words describing it become plural too. If feminine, they become feminine too.', 'concept'),
  ('Buenos días Example', '"día" means "day" and is a Masculine singular noun. "bueno" means "good" and is a Masculine singular adjective. "días" is the plural — used in "Buenos días" because you''re wishing someone good mornings in general. "bueno" must match: Bueno → Buenos (Masculine plural).', 'example'),
  ('Infinitive: Estar', '"Estoy" comes from Estar = "to be", used for temporary states (how you feel, where you are).', 'concept'),
  ('Conjugation: Estar', 'estoy, estás, está, estamos, estáis, están', 'conjugation'),
  ('Formality: Tú vs Usted', '"Tú" (informal you, singular) vs "Usted" (formal you, singular). Use "tú" with friends/peers, "usted" with strangers/elders.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Buenos días' AND gh.hint_title = 'Gender + Number Agreement';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Buenos días' AND gh.hint_title = 'Buenos días Example';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy feliz' AND gh.hint_title = 'Infinitive: Estar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy feliz' AND gh.hint_title = 'Conjugation: Estar';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Estar' AND v.infinitive = 'estar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Cómo está?' AND gh.hint_title = 'Formality: Tú vs Usted';

-- === A1 1.2: Putting Names to Faces ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Articles Intro', 'Articles Intro: "El" is "the" for masculine singular words. "La" is "the" for feminine singular. "Los" is "the" for masculine plural. "Las" is "the" for feminine plural.', 'concept'),
  ('Infinitive: Ser', '"Soy" comes from Ser = "to be", used for permanent things (identity, nationality, profession) — vs Estar for temporary states.', 'concept'),
  ('Conjugation: Ser', 'Conjugation: Ser — soy, eres, es, somos, sois, son', 'conjugation'),
  ('Demonstratives', 'Demonstratives: "This/these have the t''s, that/those don''t." This: este (m), esta (f), esto (neutral), estos (m.pl), estas (f.pl). That: ese, esa, eso, esos, esas.', 'concept'),
  ('Reflexive Infinitive Intro', 'Reflexive Infinitive Intro: "Me llamo" comes from Llamarse = "to call oneself". The "-se" ending means the action reflects back on the person doing it.', 'concept'),
  ('The -mente Suffix', '''-mente'' is always "-ly" in English. So "igualmente" literally means "equal-ly" (likewise).', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'El nombre' AND gh.hint_title = 'Articles Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Soy...' AND gh.hint_title = 'Infinitive: Ser';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Soy...' AND gh.hint_title = 'Conjugation: Ser';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Ser' AND v.infinitive = 'ser';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Este es' AND gh.hint_title = 'Demonstratives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Me llamo' AND gh.hint_title = 'Reflexive Infinitive Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Igualmente' AND gh.hint_title = 'The -mente Suffix';

-- === A1 2.1: Lost in Translation ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Conjugation: Hablar', 'Conjugation: Hablar — hablo, hablas, habla, hablamos, habláis, hablan', 'conjugation'),
  ('Conjugation: Poder', 'Conjugation: Poder — puedo, puedes, puede, podemos, podéis, pueden', 'conjugation'),
  ('Stem-Changing Verbs Intro', 'Stem-changing verbs Intro: When you conjugate, some verbs change their stem (not just the ending). The "we" form NEVER changes stem. Common patterns: o→ue, e→ie, e→i.', 'concept'),
  ('Stem-Changing Examples', 'Examples: Poder → Puedo, Puedes, Puede, Podemos... | Entender → Entiendo, Entiendes, Entiende, Entendemos... | Decir → Digo, Dices, Dice, Decimos...', 'example'),
  ('Poder + Infinitive', 'Poder + Infinitive for polite requests: "¿Puede repetir?" = "Can you repeat?"', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Habla inglés?' AND gh.hint_title = 'Conjugation: Hablar';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Hablar' AND v.infinitive = 'hablar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_title = 'Conjugation: Poder';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Poder' AND v.infinitive = 'poder';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_title = 'Stem-Changing Verbs Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_title = 'Stem-Changing Examples';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Puede repetir por favor?' AND gh.hint_title = 'Poder + Infinitive';

-- === A1 2.2: Help is on the Way ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Conjugation: Tener', 'Conjugation: Tener — tengo, tienes, tiene, tenemos, tenéis, tienen', 'conjugation'),
  ('Conjugation: Necesitar', 'Conjugation: Necesitar — necesito, necesitas, necesita, necesitamos, necesitáis, necesitan', 'conjugation'),
  ('Personal A Intro', 'Personal "a" Intro: When a person does an action TO another person or service of people, put "a" between verb and object. "Llame a la policía" = "Call (to) the police". It signifies humans are the recipients.', 'concept'),
  ('Personal A Example', '"Llame a una ambulancia" needs personal "a" but "Necesito una ambulancia" doesn''t — you''re calling the service (people), but you need the vehicle.', 'example');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Tengo un problema' AND gh.hint_title = 'Conjugation: Tener';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Tener' AND v.infinitive = 'tener';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Necesitar' AND gh.hint_title = 'Conjugation: Necesitar';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Necesitar' AND v.infinitive = 'necesitar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Llame a la policía' AND gh.hint_title = 'Personal A Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Llame a una ambulancia' AND gh.hint_title = 'Personal A Example';

-- === A1 3.1: Day at the Café ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Conjugation: Querer', 'Conjugation: Querer — quiero, quieres, quiere, queremos, queréis, quieren', 'conjugation'),
  ('Me pone Idiom', '"Me pone un/una..." is common in Spain (cafés, bars). Literally "Will you put...?" but used to mean "serve/get me a..."', 'info');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Querer' AND gh.hint_title = 'Conjugation: Querer';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Querer' AND v.infinitive = 'querer';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text LIKE 'Me pone un/una%' AND gh.hint_title = 'Me pone Idiom';

-- === A1 4.1: Map Mode ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Interrogatives', 'Interrogatives: ¿Qué? (What), ¿Quién/Quiénes? (Who), ¿Dónde? (Where), ¿Cuándo? (When), ¿Cómo? (How), ¿Cuál/Cuáles? (Which), ¿Por qué? (Why), ¿Cuánto/a? (How much)', 'concept'),
  ('Simple Imperatives', 'Simple Imperatives: Commands formed from the usted form. Girar→Gire (turn), Seguir→Siga (continue), Cruzar→Cruce (cross).', 'concept'),
  ('Conjugation: Haber', 'Haber → "Hay" means "there is/there are". Haber is an auxiliary verb. Conjugation: he, has, ha/hay, hemos, habéis, han.', 'conjugation');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Dónde está...?' AND gh.hint_title = 'Interrogatives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Girar' AND gh.hint_title = 'Simple Imperatives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Hay' AND gh.hint_title = 'Conjugation: Haber';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Haber' AND v.infinitive = 'haber';

-- === A2 1.1: Relative Truths: Family ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Possessives', 'Possessives: mi (my), tu (your), su (his/her/your formal). "Mi madre" = my mother, "tu hermano" = your brother.', 'concept'),
  ('Parecerse a', 'Parecerse a = to resemble/look like. "Se parece a su padre" = He/she looks like his/her father.', 'concept'),
  ('Muy/Bastante + Adjective', 'Muy/bastante + adjective for degree: "Es muy simpático" = very nice, "bastante trabajadora" = quite hardworking.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Mi madre es amable' AND gh.hint_title = 'Possessives';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Se parece a su padre' AND gh.hint_title = 'Parecerse a';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Es muy simpático/a' AND gh.hint_title = 'Muy/Bastante + Adjective';

-- === A2 2.1: Rinse and Repeat ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Frequency Adverbs', 'Frequency adverbs usually go before the verb: "Siempre desayuno" (I always have breakfast). Or at the start/end of the sentence.', 'concept'),
  ('Cada + Time', 'Cada + time: cada día (every day), cada semana (every week). Todos los + plural: todos los días (every day), todos los lunes (every Monday) — "todos" means "all/every".', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Siempre' AND gh.hint_title = 'Frequency Adverbs';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Todos los días' AND gh.hint_title = 'Cada + Time';

-- === A2 3.1: Fill Me In ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Preterite Tense Intro', 'Preterite tense for completed past actions. Regular -ar: -é, -aste, -ó, -amos, -asteis, -aron. Regular -er/-ir: -í, -iste, -ió, -imos, -isteis, -ieron.', 'concept'),
  ('Irregular Preterites', 'Key irregular preterites: ir/ser → fui, fuiste, fue, fuimos, fuisteis, fueron. hacer → hice, hiciste, hizo. ver → vi, viste, vio.', 'concept'),
  ('Conjugation: Ir', 'Conjugation: Ir (present) — voy, vas, va, vamos, vais, van. Ir (preterite) — fui, fuiste, fue, fuimos, fuisteis, fueron.', 'conjugation');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ayer' AND gh.hint_title = 'Preterite Tense Intro';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ir' AND gh.hint_title = 'Irregular Preterites';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ir' AND gh.hint_title = 'Conjugation: Ir';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_title = 'Conjugation: Ir' AND v.infinitive = 'ir';

-- === A2 4.1: Tap and Go ===

INSERT INTO grammar_hints (hint_title, hint_text, hint_type) VALUES
  ('Sin + Noun', 'Sin + noun = "Without" + thing. Sin recibo = without receipt. Sin contacto = contactless.', 'concept'),
  ('No + Verb Negation', 'No + verb: Put "no" directly before the verb. No funciona = It doesn''t work. No tengo cambio = I don''t have change. No aceptamos tarjeta = We don''t accept card.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'El recibo' AND gh.hint_title = 'Sin + Noun';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'No funciona' AND gh.hint_title = 'No + Verb Negation';

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

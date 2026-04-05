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
DELETE FROM pronouns;
DELETE FROM tenses;

-- ============================================================
-- TENSES (with hover descriptions)
-- ============================================================

INSERT INTO tenses (name, english_name, description, sort_order) VALUES
  ('present', 'Present', 'Used for actions happening now or habitual actions. "I eat, I am eating."', 1),
  ('preterite', 'Preterite', 'Used for completed actions in the past. "I ate, I did eat."', 2),
  ('imperfect', 'Imperfect', 'Used for ongoing or repeated past actions. "I used to eat, I was eating."', 3),
  ('future', 'Future', 'Used for actions that will happen. "I will eat."', 4),
  ('conditional', 'Conditional', 'Used for hypothetical actions or polite requests. "I would eat."', 5),
  ('subjunctive_present', 'Present Subjunctive', 'Used when an action is not definitely happening — hypothetical, wished for, or imagined. "I wish I were taller."', 6);

-- ============================================================
-- PRONOUNS
-- ============================================================

INSERT INTO pronouns (spanish, english, person, sort_order) VALUES
  ('yo', 'I', '1s', 1),
  ('tú', 'you (informal)', '2s', 2),
  ('él/ella/usted', 'he/she/you (formal)', '3s', 3),
  ('nosotros/as', 'we', '1p', 4),
  ('vosotros/as', 'you all (Spain)', '2p', 5),
  ('ellos/ellas/ustedes', 'they/you all', '3p', 6);

-- ============================================================
-- VERBS
-- ============================================================

INSERT INTO verbs (infinitive, english, is_irregular) VALUES
  ('estar', 'to be (temporary)', true),
  ('ser', 'to be (permanent)', true),
  ('hablar', 'to speak', false),
  ('poder', 'to be able to', true),
  ('entender', 'to understand', true),
  ('decir', 'to say/tell', true),
  ('tener', 'to have', true),
  ('necesitar', 'to need', false),
  ('querer', 'to want', true),
  ('llamarse', 'to call oneself', false),
  ('ir', 'to go', true),
  ('hacer', 'to do/make', true),
  ('ver', 'to see', true),
  ('pagar', 'to pay', false),
  ('haber', 'to have (auxiliary)', true);

-- ============================================================
-- CONJUGATIONS — Present tense
-- ============================================================

-- estar
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','estoy'),('tú','estás'),('él/ella/usted','está'),('nosotros/as','estamos'),('vosotros/as','estáis'),('ellos/ellas/ustedes','están')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'estar' AND t.name = 'present';

-- ser
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','soy'),('tú','eres'),('él/ella/usted','es'),('nosotros/as','somos'),('vosotros/as','sois'),('ellos/ellas/ustedes','son')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'ser' AND t.name = 'present';

-- hablar
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, false
FROM verbs v, tenses t,
  (VALUES ('yo','hablo'),('tú','hablas'),('él/ella/usted','habla'),('nosotros/as','hablamos'),('vosotros/as','habláis'),('ellos/ellas/ustedes','hablan')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'hablar' AND t.name = 'present';

-- poder
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','puedo'),('tú','puedes'),('él/ella/usted','puede'),('nosotros/as','podemos'),('vosotros/as','podéis'),('ellos/ellas/ustedes','pueden')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'poder' AND t.name = 'present';

-- entender
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','entiendo'),('tú','entiendes'),('él/ella/usted','entiende'),('nosotros/as','entendemos'),('vosotros/as','entendéis'),('ellos/ellas/ustedes','entienden')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'entender' AND t.name = 'present';

-- decir
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','digo'),('tú','dices'),('él/ella/usted','dice'),('nosotros/as','decimos'),('vosotros/as','decís'),('ellos/ellas/ustedes','dicen')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'decir' AND t.name = 'present';

-- tener
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','tengo'),('tú','tienes'),('él/ella/usted','tiene'),('nosotros/as','tenemos'),('vosotros/as','tenéis'),('ellos/ellas/ustedes','tienen')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'tener' AND t.name = 'present';

-- necesitar
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, false
FROM verbs v, tenses t,
  (VALUES ('yo','necesito'),('tú','necesitas'),('él/ella/usted','necesita'),('nosotros/as','necesitamos'),('vosotros/as','necesitáis'),('ellos/ellas/ustedes','necesitan')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'necesitar' AND t.name = 'present';

-- querer
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','quiero'),('tú','quieres'),('él/ella/usted','quiere'),('nosotros/as','queremos'),('vosotros/as','queréis'),('ellos/ellas/ustedes','quieren')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'querer' AND t.name = 'present';

-- ir
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','voy'),('tú','vas'),('él/ella/usted','va'),('nosotros/as','vamos'),('vosotros/as','vais'),('ellos/ellas/ustedes','van')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'ir' AND t.name = 'present';

-- hacer
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','hago'),('tú','haces'),('él/ella/usted','hace'),('nosotros/as','hacemos'),('vosotros/as','hacéis'),('ellos/ellas/ustedes','hacen')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'hacer' AND t.name = 'present';

-- ver
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','veo'),('tú','ves'),('él/ella/usted','ve'),('nosotros/as','vemos'),('vosotros/as','veis'),('ellos/ellas/ustedes','ven')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'ver' AND t.name = 'present';

-- pagar
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, false
FROM verbs v, tenses t,
  (VALUES ('yo','pago'),('tú','pagas'),('él/ella/usted','paga'),('nosotros/as','pagamos'),('vosotros/as','pagáis'),('ellos/ellas/ustedes','pagan')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'pagar' AND t.name = 'present';

-- haber (present - hay is impersonal)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','he'),('tú','has'),('él/ella/usted','ha/hay'),('nosotros/as','hemos'),('vosotros/as','habéis'),('ellos/ellas/ustedes','han')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'haber' AND t.name = 'present';

-- ============================================================
-- CONJUGATIONS — Preterite tense (key verbs)
-- ============================================================

-- ir (preterite = same as ser)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','fui'),('tú','fuiste'),('él/ella/usted','fue'),('nosotros/as','fuimos'),('vosotros/as','fuisteis'),('ellos/ellas/ustedes','fueron')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'ir' AND t.name = 'preterite';

-- hacer
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','hice'),('tú','hiciste'),('él/ella/usted','hizo'),('nosotros/as','hicimos'),('vosotros/as','hicisteis'),('ellos/ellas/ustedes','hicieron')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'hacer' AND t.name = 'preterite';

-- ver
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','vi'),('tú','viste'),('él/ella/usted','vio'),('nosotros/as','vimos'),('vosotros/as','visteis'),('ellos/ellas/ustedes','vieron')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'ver' AND t.name = 'preterite';

-- estar (preterite)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','estuve'),('tú','estuviste'),('él/ella/usted','estuvo'),('nosotros/as','estuvimos'),('vosotros/as','estuvisteis'),('ellos/ellas/ustedes','estuvieron')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'estar' AND t.name = 'preterite';

-- tener (preterite)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','tuve'),('tú','tuviste'),('él/ella/usted','tuvo'),('nosotros/as','tuvimos'),('vosotros/as','tuvisteis'),('ellos/ellas/ustedes','tuvieron')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'tener' AND t.name = 'preterite';

-- poder (preterite)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated, is_irregular)
SELECT v.verb_id, t.tense_id, p.pronoun_id, c.form, true
FROM verbs v, tenses t,
  (VALUES ('yo','pude'),('tú','pudiste'),('él/ella/usted','pudo'),('nosotros/as','pudimos'),('vosotros/as','pudisteis'),('ellos/ellas/ustedes','pudieron')) AS c(pron, form)
  JOIN pronouns p ON p.spanish = c.pron
WHERE v.infinitive = 'poder' AND t.name = 'preterite';

-- ============================================================
-- GRAMMAR HINTS — per subunit (linked via term_grammar_hints)
-- ============================================================

-- === A1 1.1: Hola, How's It Going? ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Gender + Number Agreement Intro: All Spanish nouns are Feminine, Masculine, or Neutral and Singular or Plural. If a noun is plural, the words describing it become plural too. If feminine, they become feminine too.', 'concept'),
  ('"día" means "day" and is a Masculine singular noun. "bueno" means "good" and is a Masculine singular adjective. "días" is the plural — used in "Buenos días" because you''re wishing someone good mornings in general. "bueno" must match: Bueno → Buenos (Masculine plural).', 'example'),
  ('Infinitive Intro: "Estoy" comes from Estar = "to be", used for temporary states (how you feel, where you are).', 'concept'),
  ('Conjugation: Estar — estoy, estás, está, estamos, estáis, están', 'conjugation'),
  ('Formality Intro: "Tú" (informal you, singular) vs "Usted" (formal you, singular). Use "tú" with friends/peers, "usted" with strangers/elders.', 'concept');

-- Link these hints to terms in subunit 1.1
INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Buenos días' AND gh.hint_text LIKE 'Gender + Number Agreement%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Buenos días' AND gh.hint_text LIKE '"día" means%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy feliz' AND gh.hint_text LIKE 'Infinitive Intro%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Estoy feliz' AND gh.hint_text LIKE 'Conjugation: Estar%';

-- Link estar verb to the conjugation hint
INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Estar%' AND v.infinitive = 'estar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Cómo está?' AND gh.hint_text LIKE 'Formality Intro%';

-- === A1 1.2: Putting Names to Faces ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Articles Intro: "El" is "the" for masculine singular words. "La" is "the" for feminine singular. "Los" is "the" for masculine plural. "Las" is "the" for feminine plural.', 'concept'),
  ('"Soy" comes from Ser = "to be", used for permanent things (identity, nationality, profession) — vs Estar for temporary states.', 'concept'),
  ('Conjugation: Ser — soy, eres, es, somos, sois, son', 'conjugation'),
  ('Demonstratives: "This/these have the t''s, that/those don''t." This: este (m), esta (f), esto (neutral), estos (m.pl), estas (f.pl). That: ese, esa, eso, esos, esas.', 'concept'),
  ('Reflexive Infinitive Intro: "Me llamo" comes from Llamarse = "to call oneself". The "-se" ending means the action reflects back on the person doing it.', 'concept'),
  ('''-mente'' is always "-ly" in English. So "igualmente" literally means "equal-ly" (likewise).', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'El nombre' AND gh.hint_text LIKE 'Articles Intro%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Soy...' AND gh.hint_text LIKE '"Soy" comes from Ser%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Soy...' AND gh.hint_text LIKE 'Conjugation: Ser%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Ser%' AND v.infinitive = 'ser';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Este es' AND gh.hint_text LIKE 'Demonstratives%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Me llamo' AND gh.hint_text LIKE 'Reflexive Infinitive%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Igualmente' AND gh.hint_text LIKE '''-mente''%';

-- === A1 2.1: Lost in Translation ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Conjugation: Hablar — hablo, hablas, habla, hablamos, habláis, hablan', 'conjugation'),
  ('Conjugation: Poder — puedo, puedes, puede, podemos, podéis, pueden', 'conjugation'),
  ('Stem-changing verbs Intro: When you conjugate, some verbs change their stem (not just the ending). The "we" form NEVER changes stem. Common patterns: o→ue, e→ie, e→i.', 'concept'),
  ('Examples: Poder → Puedo, Puedes, Puede, Podemos... | Entender → Entiendo, Entiendes, Entiende, Entendemos... | Decir → Digo, Dices, Dice, Decimos...', 'example'),
  ('Poder + Infinitive for polite requests: "¿Puede repetir?" = "Can you repeat?"', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Habla inglés?' AND gh.hint_text LIKE 'Conjugation: Hablar%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Hablar%' AND v.infinitive = 'hablar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_text LIKE 'Conjugation: Poder%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Poder%' AND v.infinitive = 'poder';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_text LIKE 'Stem-changing verbs%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Poder' AND gh.hint_text LIKE 'Examples: Poder%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Puede repetir por favor?' AND gh.hint_text LIKE 'Poder + Infinitive%';

-- === A1 2.2: Help is on the Way ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Conjugation: Tener — tengo, tienes, tiene, tenemos, tenéis, tienen', 'conjugation'),
  ('Conjugation: Necesitar — necesito, necesitas, necesita, necesitamos, necesitáis, necesitan', 'conjugation'),
  ('Personal "a" Intro: When a person does an action TO another person or service of people, put "a" between verb and object. "Llame a la policía" = "Call (to) the police". It signifies humans are the recipients.', 'concept'),
  ('"Llame a una ambulancia" needs personal "a" but "Necesito una ambulancia" doesn''t — you''re calling the service (people), but you need the vehicle.', 'example');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Tengo un problema' AND gh.hint_text LIKE 'Conjugation: Tener%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Tener%' AND v.infinitive = 'tener';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Necesitar' AND gh.hint_text LIKE 'Conjugation: Necesitar%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Necesitar%' AND v.infinitive = 'necesitar';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Llame a la policía' AND gh.hint_text LIKE 'Personal "a" Intro%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Llame a una ambulancia' AND gh.hint_text LIKE '"Llame a una ambulancia"%';

-- === A1 3.1: Day at the Café ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Conjugation: Querer — quiero, quieres, quiere, queremos, queréis, quieren', 'conjugation'),
  ('"Me pone un/una..." is common in Spain (cafés, bars). Literally "Will you put...?" but used to mean "serve/get me a..."', 'info');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Querer' AND gh.hint_text LIKE 'Conjugation: Querer%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Querer%' AND v.infinitive = 'querer';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text LIKE 'Me pone un/una%' AND gh.hint_text LIKE '"Me pone un/una%';

-- === A1 4.1: Map Mode ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Interrogatives: ¿Qué? (What), ¿Quién/Quiénes? (Who), ¿Dónde? (Where), ¿Cuándo? (When), ¿Cómo? (How), ¿Cuál/Cuáles? (Which), ¿Por qué? (Why), ¿Cuánto/a? (How much)', 'concept'),
  ('Simple Imperatives: Commands formed from the usted form. Girar→Gire (turn), Seguir→Siga (continue), Cruzar→Cruce (cross).', 'concept'),
  ('Haber → "Hay" means "there is/there are". Haber is an auxiliary verb. Conjugation: he, has, ha/hay, hemos, habéis, han.', 'conjugation');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = '¿Dónde está...?' AND gh.hint_text LIKE 'Interrogatives%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Girar' AND gh.hint_text LIKE 'Simple Imperatives%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Hay' AND gh.hint_text LIKE 'Haber →%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Haber →%' AND v.infinitive = 'haber';

-- === A2 1.1: Relative Truths: Family ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Possessives: mi (my), tu (your), su (his/her/your formal). "Mi madre" = my mother, "tu hermano" = your brother.', 'concept'),
  ('Parecerse a = to resemble/look like. "Se parece a su padre" = He/she looks like his/her father.', 'concept'),
  ('Muy/bastante + adjective for degree: "Es muy simpático" = very nice, "bastante trabajadora" = quite hardworking.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Mi madre es amable' AND gh.hint_text LIKE 'Possessives%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Se parece a su padre' AND gh.hint_text LIKE 'Parecerse a%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Es muy simpático/a' AND gh.hint_text LIKE 'Muy/bastante%';

-- === A2 2.1: Rinse and Repeat ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Frequency adverbs usually go before the verb: "Siempre desayuno" (I always have breakfast). Or at the start/end of the sentence.', 'concept'),
  ('Cada + time: cada día (every day), cada semana (every week). Todos los + plural: todos los días (every day), todos los lunes (every Monday) — "todos" means "all/every".', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Siempre' AND gh.hint_text LIKE 'Frequency adverbs%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Todos los días' AND gh.hint_text LIKE 'Cada + time%';

-- === A2 3.1: Fill Me In ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Preterite tense for completed past actions. Regular -ar: -é, -aste, -ó, -amos, -asteis, -aron. Regular -er/-ir: -í, -iste, -ió, -imos, -isteis, -ieron.', 'concept'),
  ('Key irregular preterites: ir/ser → fui, fuiste, fue, fuimos, fuisteis, fueron. hacer → hice, hiciste, hizo. ver → vi, viste, vio.', 'concept'),
  ('Conjugation: Ir (present) — voy, vas, va, vamos, vais, van. Ir (preterite) — fui, fuiste, fue, fuimos, fuisteis, fueron.', 'conjugation');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ayer' AND gh.hint_text LIKE 'Preterite tense for%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ir' AND gh.hint_text LIKE 'Key irregular preterites%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'Ir' AND gh.hint_text LIKE 'Conjugation: Ir%';

INSERT INTO grammar_hint_verb_links (hint_id, verb_id)
SELECT gh.hint_id, v.verb_id
FROM grammar_hints gh, verbs v
WHERE gh.hint_text LIKE 'Conjugation: Ir%' AND v.infinitive = 'ir';

-- === A2 4.1: Tap and Go ===

INSERT INTO grammar_hints (hint_text, hint_type) VALUES
  ('Sin + noun = "Without" + thing. Sin recibo = without receipt. Sin contacto = contactless.', 'concept'),
  ('No + verb: Put "no" directly before the verb. No funciona = It doesn''t work. No tengo cambio = I don''t have change. No aceptamos tarjeta = We don''t accept card.', 'concept');

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'El recibo' AND gh.hint_text LIKE 'Sin + noun%';

INSERT INTO term_grammar_hints (term_id, hint_id)
SELECT t.term_id, gh.hint_id
FROM terms t, grammar_hints gh
WHERE t.spanish_text = 'No funciona' AND gh.hint_text LIKE 'No + verb%';

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

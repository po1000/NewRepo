-- Migration: 00002_seed_curriculum
-- Description: Seed CEFR levels, units, subunits, terms, verb categories,
--              tenses, pronouns, verbs, and present-tense conjugations.

-- ============================================================
-- CEFR Levels
-- ============================================================
INSERT INTO cefr_levels (code, title, sort_order) VALUES
    ('A1', 'Beginner',   1),
    ('A2', 'Elementary', 2);

-- ============================================================
-- Units  (cefr_level_id = 1 is A1, 2 is A2)
-- ============================================================
INSERT INTO units (cefr_level_id, unit_number, title, description, sort_order) VALUES
    (1, 1, 'Greetings & Basics',  'Learn essential greetings and basic phrases.',  1),
    (1, 2, 'Numbers & Colors',    'Learn numbers 1-10 and basic colors.',          2);

-- ============================================================
-- Subunits
-- ============================================================
INSERT INTO subunits (unit_id, subunit_code, title, description, image_url, goal_text, sort_order) VALUES
    (1, '1.1', 'Hola, How''s It Going?', 'Greetings, farewells, and polite expressions.', NULL, 'Master basic Spanish greetings and polite phrases.', 1),
    (2, '2.1', 'Numbers 1-10',           'Learn to count from one to ten in Spanish.',    NULL, 'Count from 1 to 10 in Spanish.',                     1);

-- ============================================================
-- Terms – Subunit 1.1: Greetings & Basics
-- ============================================================
INSERT INTO terms (spanish_text, english_text, part_of_speech, example_sentence_es, example_sentence_en) VALUES
    ('Hola',           'Hello',            'interjection', 'Hola, me llamo Pedro.',                'Hello, my name is Pedro.'),
    ('Adiós',          'Goodbye',          'interjection', 'Adiós, nos vemos mañana.',             'Goodbye, see you tomorrow.'),
    ('Buenos días',    'Good morning',     'phrase',       'Buenos días, ¿cómo estás?',            'Good morning, how are you?'),
    ('Buenas tardes',  'Good afternoon',   'phrase',       'Buenas tardes, señora García.',         'Good afternoon, Mrs. García.'),
    ('Buenas noches',  'Good night',       'phrase',       'Buenas noches, que duermas bien.',      'Good night, sleep well.'),
    ('Muy bien',       'Very well',        'adverb',       'Estoy muy bien, gracias.',              'I am very well, thank you.'),
    ('Muy mal',        'Very bad',         'adverb',       'Me siento muy mal hoy.',                'I feel very bad today.'),
    ('¿Cómo estás?',  'How are you?',     'phrase',       '¿Cómo estás? ¿Todo bien?',             'How are you? Everything okay?'),
    ('Gracias',        'Thank you',        'interjection', 'Gracias por tu ayuda.',                 'Thank you for your help.'),
    ('Por favor',      'Please',           'adverb',       'Un café, por favor.',                   'A coffee, please.'),
    ('De nada',        'You''re welcome',  'phrase',       'De nada, fue un placer.',               'You''re welcome, it was a pleasure.'),
    ('Lo siento',      'I''m sorry',       'phrase',       'Lo siento, no fue mi intención.',       'I''m sorry, it was not my intention.');

-- ============================================================
-- Terms – Subunit 2.1: Numbers 1-10
-- ============================================================
INSERT INTO terms (spanish_text, english_text, part_of_speech, example_sentence_es, example_sentence_en) VALUES
    ('uno',    'one',    'numeral', 'Solo quiero uno.',            'I only want one.'),
    ('dos',    'two',    'numeral', 'Tengo dos hermanos.',         'I have two siblings.'),
    ('tres',   'three',  'numeral', 'Tres gatos en el jardín.',    'Three cats in the garden.'),
    ('cuatro', 'four',   'numeral', 'Son las cuatro de la tarde.', 'It is four in the afternoon.'),
    ('cinco',  'five',   'numeral', 'Cinco días de vacaciones.',   'Five days of vacation.'),
    ('seis',   'six',    'numeral', 'Seis meses del año.',         'Six months of the year.'),
    ('siete',  'seven',  'numeral', 'Siete colores del arcoíris.', 'Seven colors of the rainbow.'),
    ('ocho',   'eight',  'numeral', 'Ocho horas de sueño.',        'Eight hours of sleep.'),
    ('nueve',  'nine',   'numeral', 'Nueve planetas… o no.',       'Nine planets… or not.'),
    ('diez',   'ten',    'numeral', 'Diez dedos en las manos.',    'Ten fingers on the hands.');

-- ============================================================
-- Link terms to subunits via subunit_terms
-- Subunit 1 (Greetings) gets term_ids 1-12
-- Subunit 2 (Numbers)   gets term_ids 13-22
-- ============================================================
INSERT INTO subunit_terms (subunit_id, term_id, sort_order) VALUES
    -- Subunit 1.1 – Greetings & Basics
    (1,  1,  1),
    (1,  2,  2),
    (1,  3,  3),
    (1,  4,  4),
    (1,  5,  5),
    (1,  6,  6),
    (1,  7,  7),
    (1,  8,  8),
    (1,  9,  9),
    (1, 10, 10),
    (1, 11, 11),
    (1, 12, 12),
    -- Subunit 2.1 – Numbers 1-10
    (2, 13,  1),
    (2, 14,  2),
    (2, 15,  3),
    (2, 16,  4),
    (2, 17,  5),
    (2, 18,  6),
    (2, 19,  7),
    (2, 20,  8),
    (2, 21,  9),
    (2, 22, 10);

-- ============================================================
-- Verb Categories
-- ============================================================
INSERT INTO verb_categories (name, description) VALUES
    ('AR Regular', 'Regular verbs ending in -ar'),
    ('ER Regular', 'Regular verbs ending in -er'),
    ('IR Regular', 'Regular verbs ending in -ir');

-- ============================================================
-- Tenses
-- ============================================================
INSERT INTO tenses (name, english_name, description, sort_order) VALUES
    ('Presente',              'Present',            'Actions happening now or habitually.',           1),
    ('Pretérito indefinido',  'Preterite',          'Completed past actions.',                       2),
    ('Pretérito imperfecto',  'Imperfect',          'Ongoing or habitual past actions.',             3),
    ('Futuro simple',         'Future',             'Actions that will happen.',                     4),
    ('Condicional simple',    'Conditional',        'Hypothetical or polite actions.',               5),
    ('Subjuntivo presente',   'Subjunctive Present','Subjective or uncertain present actions.',      6);

-- ============================================================
-- Pronouns
-- ============================================================
INSERT INTO pronouns (pronoun_text, person_group, sort_order) VALUES
    ('yo',                       '1st singular', 1),
    ('tú',                       '2nd singular', 2),
    ('él/ella/usted',            '3rd singular', 3),
    ('nosotros/nosotras',        '1st plural',   4),
    ('vosotros/vosotras',        '2nd plural',   5),
    ('ellos/ellas/ustedes',      '3rd plural',   6);

-- ============================================================
-- Verbs – AR Regular (category_id = 1)
-- ============================================================
INSERT INTO verbs (infinitive, english_meaning, verb_category_id, is_irregular) VALUES
    ('hablar',    'to speak',  1, false),
    ('comprar',   'to buy',    1, false),
    ('estudiar',  'to study',  1, false),
    ('trabajar',  'to work',   1, false),
    ('cocinar',   'to cook',   1, false),
    ('caminar',   'to walk',   1, false),
    ('bailar',    'to dance',  1, false),
    ('cantar',    'to sing',   1, false);

-- ============================================================
-- Verbs – ER (category_id = 2)
-- ============================================================
INSERT INTO verbs (infinitive, english_meaning, verb_category_id, is_irregular) VALUES
    ('comer',     'to eat',        2, false),
    ('beber',     'to drink',      2, false),
    ('leer',      'to read',       2, false),
    ('aprender',  'to learn',      2, false),
    ('correr',    'to run',        2, false),
    ('tener',     'to have',       2, true),
    ('ser',       'to be',         2, true),
    ('ver',       'to see',        2, true),
    ('querer',    'to want',       2, true),
    ('poder',     'to be able to', 2, true),
    ('hacer',     'to do/make',    2, true),
    ('entender',  'to understand', 2, true);

-- ============================================================
-- Verbs – IR (category_id = 3)
-- ============================================================
INSERT INTO verbs (infinitive, english_meaning, verb_category_id, is_irregular) VALUES
    ('vivir',     'to live',    3, false),
    ('escribir',  'to write',   3, false),
    ('abrir',     'to open',    3, false),
    ('recibir',   'to receive', 3, false),
    ('subir',     'to go up',   3, false),
    ('ir',        'to go',      3, true),
    ('decir',     'to say',     3, true);

-- ============================================================
-- Present Tense Conjugations
-- Verb IDs (identity-generated, sequential from 1):
--   AR: 1=hablar, 2=comprar, 3=estudiar, 4=trabajar,
--       5=cocinar, 6=caminar, 7=bailar, 8=cantar
--   ER: 9=comer, 10=beber, 11=leer, 12=aprender, 13=correr,
--       14=tener, 15=ser, 16=ver, 17=querer, 18=poder,
--       19=hacer, 20=entender
--   IR: 21=vivir, 22=escribir, 23=abrir, 24=recibir,
--       25=subir, 26=ir, 27=decir
-- Tense ID 1 = Present
-- Pronoun IDs: 1=yo, 2=tú, 3=él/ella/usted,
--              4=nosotros, 5=vosotros, 6=ellos/ellas/ustedes
-- ============================================================

-- hablar (verb_id = 1)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (1, 1, 1, 'hablo'),
    (1, 1, 2, 'hablas'),
    (1, 1, 3, 'habla'),
    (1, 1, 4, 'hablamos'),
    (1, 1, 5, 'habláis'),
    (1, 1, 6, 'hablan');

-- comprar (verb_id = 2)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (2, 1, 1, 'compro'),
    (2, 1, 2, 'compras'),
    (2, 1, 3, 'compra'),
    (2, 1, 4, 'compramos'),
    (2, 1, 5, 'compráis'),
    (2, 1, 6, 'compran');

-- estudiar (verb_id = 3)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (3, 1, 1, 'estudio'),
    (3, 1, 2, 'estudias'),
    (3, 1, 3, 'estudia'),
    (3, 1, 4, 'estudiamos'),
    (3, 1, 5, 'estudiáis'),
    (3, 1, 6, 'estudian');

-- trabajar (verb_id = 4)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (4, 1, 1, 'trabajo'),
    (4, 1, 2, 'trabajas'),
    (4, 1, 3, 'trabaja'),
    (4, 1, 4, 'trabajamos'),
    (4, 1, 5, 'trabajáis'),
    (4, 1, 6, 'trabajan');

-- cocinar (verb_id = 5)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (5, 1, 1, 'cocino'),
    (5, 1, 2, 'cocinas'),
    (5, 1, 3, 'cocina'),
    (5, 1, 4, 'cocinamos'),
    (5, 1, 5, 'cocináis'),
    (5, 1, 6, 'cocinan');

-- caminar (verb_id = 6)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (6, 1, 1, 'camino'),
    (6, 1, 2, 'caminas'),
    (6, 1, 3, 'camina'),
    (6, 1, 4, 'caminamos'),
    (6, 1, 5, 'camináis'),
    (6, 1, 6, 'caminan');

-- bailar (verb_id = 7)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (7, 1, 1, 'bailo'),
    (7, 1, 2, 'bailas'),
    (7, 1, 3, 'baila'),
    (7, 1, 4, 'bailamos'),
    (7, 1, 5, 'bailáis'),
    (7, 1, 6, 'bailan');

-- cantar (verb_id = 8)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (8, 1, 1, 'canto'),
    (8, 1, 2, 'cantas'),
    (8, 1, 3, 'canta'),
    (8, 1, 4, 'cantamos'),
    (8, 1, 5, 'cantáis'),
    (8, 1, 6, 'cantan');

-- comer (verb_id = 9)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (9, 1, 1, 'como'),
    (9, 1, 2, 'comes'),
    (9, 1, 3, 'come'),
    (9, 1, 4, 'comemos'),
    (9, 1, 5, 'coméis'),
    (9, 1, 6, 'comen');

-- beber (verb_id = 10)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (10, 1, 1, 'bebo'),
    (10, 1, 2, 'bebes'),
    (10, 1, 3, 'bebe'),
    (10, 1, 4, 'bebemos'),
    (10, 1, 5, 'bebéis'),
    (10, 1, 6, 'beben');

-- leer (verb_id = 11)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (11, 1, 1, 'leo'),
    (11, 1, 2, 'lees'),
    (11, 1, 3, 'lee'),
    (11, 1, 4, 'leemos'),
    (11, 1, 5, 'leéis'),
    (11, 1, 6, 'leen');

-- aprender (verb_id = 12)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (12, 1, 1, 'aprendo'),
    (12, 1, 2, 'aprendes'),
    (12, 1, 3, 'aprende'),
    (12, 1, 4, 'aprendemos'),
    (12, 1, 5, 'aprendéis'),
    (12, 1, 6, 'aprenden');

-- correr (verb_id = 13)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (13, 1, 1, 'corro'),
    (13, 1, 2, 'corres'),
    (13, 1, 3, 'corre'),
    (13, 1, 4, 'corremos'),
    (13, 1, 5, 'corréis'),
    (13, 1, 6, 'corren');

-- tener (verb_id = 14, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (14, 1, 1, 'tengo'),
    (14, 1, 2, 'tienes'),
    (14, 1, 3, 'tiene'),
    (14, 1, 4, 'tenemos'),
    (14, 1, 5, 'tenéis'),
    (14, 1, 6, 'tienen');

-- ser (verb_id = 15, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (15, 1, 1, 'soy'),
    (15, 1, 2, 'eres'),
    (15, 1, 3, 'es'),
    (15, 1, 4, 'somos'),
    (15, 1, 5, 'sois'),
    (15, 1, 6, 'son');

-- ver (verb_id = 16, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (16, 1, 1, 'veo'),
    (16, 1, 2, 'ves'),
    (16, 1, 3, 've'),
    (16, 1, 4, 'vemos'),
    (16, 1, 5, 'veis'),
    (16, 1, 6, 'ven');

-- querer (verb_id = 17, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (17, 1, 1, 'quiero'),
    (17, 1, 2, 'quieres'),
    (17, 1, 3, 'quiere'),
    (17, 1, 4, 'queremos'),
    (17, 1, 5, 'queréis'),
    (17, 1, 6, 'quieren');

-- poder (verb_id = 18, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (18, 1, 1, 'puedo'),
    (18, 1, 2, 'puedes'),
    (18, 1, 3, 'puede'),
    (18, 1, 4, 'podemos'),
    (18, 1, 5, 'podéis'),
    (18, 1, 6, 'pueden');

-- hacer (verb_id = 19, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (19, 1, 1, 'hago'),
    (19, 1, 2, 'haces'),
    (19, 1, 3, 'hace'),
    (19, 1, 4, 'hacemos'),
    (19, 1, 5, 'hacéis'),
    (19, 1, 6, 'hacen');

-- entender (verb_id = 20, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (20, 1, 1, 'entiendo'),
    (20, 1, 2, 'entiendes'),
    (20, 1, 3, 'entiende'),
    (20, 1, 4, 'entendemos'),
    (20, 1, 5, 'entendéis'),
    (20, 1, 6, 'entienden');

-- vivir (verb_id = 21)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (21, 1, 1, 'vivo'),
    (21, 1, 2, 'vives'),
    (21, 1, 3, 'vive'),
    (21, 1, 4, 'vivimos'),
    (21, 1, 5, 'vivís'),
    (21, 1, 6, 'viven');

-- escribir (verb_id = 22)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (22, 1, 1, 'escribo'),
    (22, 1, 2, 'escribes'),
    (22, 1, 3, 'escribe'),
    (22, 1, 4, 'escribimos'),
    (22, 1, 5, 'escribís'),
    (22, 1, 6, 'escriben');

-- abrir (verb_id = 23)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (23, 1, 1, 'abro'),
    (23, 1, 2, 'abres'),
    (23, 1, 3, 'abre'),
    (23, 1, 4, 'abrimos'),
    (23, 1, 5, 'abrís'),
    (23, 1, 6, 'abren');

-- recibir (verb_id = 24)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (24, 1, 1, 'recibo'),
    (24, 1, 2, 'recibes'),
    (24, 1, 3, 'recibe'),
    (24, 1, 4, 'recibimos'),
    (24, 1, 5, 'recibís'),
    (24, 1, 6, 'reciben');

-- subir (verb_id = 25)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (25, 1, 1, 'subo'),
    (25, 1, 2, 'subes'),
    (25, 1, 3, 'sube'),
    (25, 1, 4, 'subimos'),
    (25, 1, 5, 'subís'),
    (25, 1, 6, 'suben');

-- ir (verb_id = 26, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (26, 1, 1, 'voy'),
    (26, 1, 2, 'vas'),
    (26, 1, 3, 'va'),
    (26, 1, 4, 'vamos'),
    (26, 1, 5, 'vais'),
    (26, 1, 6, 'van');

-- decir (verb_id = 27, irregular)
INSERT INTO verb_conjugations (verb_id, tense_id, pronoun_id, conjugated_form) VALUES
    (27, 1, 1, 'digo'),
    (27, 1, 2, 'dices'),
    (27, 1, 3, 'dice'),
    (27, 1, 4, 'decimos'),
    (27, 1, 5, 'decís'),
    (27, 1, 6, 'dicen');

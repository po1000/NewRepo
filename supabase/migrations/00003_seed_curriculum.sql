-- ============================================================
-- SEED: Full A1 + A2 Curriculum
-- ============================================================

-- Base URL for Supabase Storage
-- https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images

-- ============================================================
-- A1 UNITS
-- ============================================================

INSERT INTO units (cefr_level_id, unit_number, title, description, sort_order) VALUES
  (1, 1, 'First Impressions', 'Learn basic Spanish greetings and how to introduce yourself', 1),
  (1, 2, 'Asking for Help', 'Ask people to repeat, slow down, and get help in emergencies', 2),
  (1, 3, 'Getting What You Need', 'Order food, ask for things, and navigate daily situations', 3),
  (1, 4, 'Getting Around', 'Directions, transport, and exploring your surroundings', 4);

-- ============================================================
-- A2 UNITS
-- ============================================================

INSERT INTO units (cefr_level_id, unit_number, title, description, sort_order) VALUES
  (2, 1, 'Preferences & Who You Know', 'Describe family, friends, and personality traits', 1),
  (2, 2, 'Your Routine', 'Talk about daily routines and how often you do things', 2),
  (2, 3, 'Plans and The Past', 'Talk about what you did recently using simple past tense', 3),
  (2, 4, 'Life Admin', 'Handle money, payments, and practical transactions', 4);

-- ============================================================
-- A1 SUBUNITS
-- ============================================================

-- Unit 1: First Impressions
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (1, 1, 'Hola, How''s It Going?', 'Basic greetings, farewells, and asking how someone is', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2012.svg', 1),
  (1, 2, 'Putting Names to Faces', 'Introducing yourself and others, asking names', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2013.svg', 2);

-- Unit 2: Asking for Help
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (2, 1, 'Lost in Translation', 'Ask people to repeat, speak slowly, and explain words', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2012-1.svg', 1),
  (2, 2, 'Help is on the Way', 'Emergency vocabulary and asking for help', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2014.svg', 2);

-- Unit 3: Getting What You Need
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (3, 1, 'Day at the Café', 'Ordering food and drinks, allergies, polite requests', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2012-2.svg', 1);

-- Unit 4: Getting Around
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (4, 1, 'Map Mode', 'Asking for and giving directions', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2012-3.svg', 1);

-- ============================================================
-- A2 SUBUNITS
-- ============================================================

-- Unit 5 (A2 Unit 1): Preferences & Who You Know
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (5, 1, 'Relative Truths: Family', 'Describe family members and friends with personality traits', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2012-4.svg', 1);

-- Unit 6 (A2 Unit 2): Your Routine
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (6, 1, 'Rinse and Repeat', 'Frequency adverbs and daily routine vocabulary', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2015.svg', 1);

-- Unit 7 (A2 Unit 3): Plans and The Past
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (7, 1, 'Fill Me In', 'Past tense vocabulary and talking about recent events', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2012-5.svg', 1);

-- Unit 8 (A2 Unit 4): Life Admin
INSERT INTO subunits (unit_id, subunit_number, title, description, image_url, sort_order) VALUES
  (8, 1, 'Tap and Go', 'Money, payments, ATMs, and transactions', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/subunit-sessions/image%2012-6.svg', 1);

-- ============================================================
-- A1 TERMS — Unit 1, Subunit 1.1: Hola, How's It Going?
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech, image_url) VALUES
  ('¡Hola!', 'Hello!', 'interjection', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/01_hola.jpg'),
  ('Adiós', 'Goodbye', 'interjection', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/02_adios.jpg'),
  ('Buenos días', 'Good morning', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/03_buenos_dias.jpg'),
  ('Buenas tardes', 'Good afternoon', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/04_buenas_tardes.jpg'),
  ('Buenas noches', 'Good evening / Good night', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/05_buenas_noches.jpg'),
  ('(Muy) bien', '(Very) well', 'adverb', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/06_muy_bien.jpg'),
  ('(Muy) mal', '(Very) bad', 'adverb', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/07_muy_mal.jpg'),
  ('¿Y tú?', 'And you?', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/08_y_tu.jpg'),
  ('Así así', 'So-so', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/09_asi_asi.jpg'),
  ('Estoy triste', 'I am sad', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/10_estoy_triste.jpg'),
  ('Estoy feliz', 'I am happy', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/11_estoy_feliz.jpg'),
  ('¿Qué tal?', 'How''s it going?', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/12_que_tal.jpg'),
  ('¿Cómo estás?', 'How are you? (informal)', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/13_como_estas_informal.jpg'),
  ('¿Cómo está?', 'How are you? (formal)', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_greetings_real_photos/14_como_esta_formal.jpg');

-- Link terms to subunit 1.1
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 1, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 1 AND 14;

-- ============================================================
-- A1 TERMS — Unit 1, Subunit 1.2: Putting Names to Faces
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('El nombre', 'The name', 'noun'),
  ('El apellido', 'The surname', 'noun'),
  ('Llamarse', 'To call oneself', 'verb'),
  ('Me llamo', 'My name is (I call myself)', 'phrase'),
  ('Soy...', 'I am...', 'phrase'),
  ('Mucho gusto', 'Nice to meet you', 'phrase'),
  ('Igualmente', 'Likewise', 'adverb'),
  ('Este es', 'This is (masc.)', 'phrase'),
  ('Esta es', 'This is (fem.)', 'phrase'),
  ('Esto es', 'This is (neutral)', 'phrase'),
  ('¿Cómo te llamas?', 'What is your name? (informal)', 'phrase'),
  ('¿Cómo se llama?', 'What is your name? (formal)', 'phrase');

-- Link terms to subunit 1.2
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 2, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 15 AND 26;

-- ============================================================
-- A1 TERMS — Unit 2, Subunit 2.1: Lost in Translation
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('Poder', 'To be able to / Can', 'verb'),
  ('Decir', 'To say / To tell', 'verb'),
  ('Entender', 'To understand', 'verb'),
  ('Repetir', 'To repeat', 'verb'),
  ('Explicar', 'To explain', 'verb'),
  ('No entiendo', 'I don''t understand', 'phrase'),
  ('Inglés', 'English', 'noun'),
  ('No hablo mucho español', 'I don''t speak much Spanish', 'phrase'),
  ('¿Puede repetir por favor?', 'Can you repeat please?', 'phrase'),
  ('¿Puede hablar más despacio?', 'Can you speak more slowly?', 'phrase'),
  ('¿Qué significa...?', 'What does ... mean?', 'phrase'),
  ('¿Cómo se dice... en español?', 'How do you say ... in Spanish?', 'phrase'),
  ('¿Habla inglés?', 'Do you speak English?', 'phrase');

-- Link terms to subunit 2.1
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 3, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 27 AND 39;

-- ============================================================
-- A1 TERMS — Unit 2, Subunit 2.2: Help is on the Way
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('Necesitar', 'To need', 'verb'),
  ('Ayuda', 'Help', 'noun'),
  ('La policía', 'The police', 'noun'),
  ('El hospital', 'The hospital', 'noun'),
  ('Fuego', 'Fire', 'noun'),
  ('Peligro', 'Danger', 'noun'),
  ('Necesito un médico', 'I need a doctor', 'phrase'),
  ('Llame a la policía', 'Call the police', 'phrase'),
  ('Llame a una ambulancia', 'Call an ambulance', 'phrase'),
  ('Es una emergencia', 'It''s an emergency', 'phrase'),
  ('Tengo un problema', 'I have a problem', 'phrase'),
  ('¿Puede ayudarme?', 'Can you help me?', 'phrase'),
  ('¿Dónde está el hospital?', 'Where is the hospital?', 'phrase'),
  ('¿Dónde está la policía?', 'Where is the police station?', 'phrase');

-- Link terms to subunit 2.2
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 4, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 40 AND 53;

-- ============================================================
-- A1 TERMS — Unit 3, Subunit 3.1: Day at the Café
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech, image_url) VALUES
  ('Querer', 'To want', 'verb', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/360_F_362369029_MdmfC4iNvzP2wZfHM9qYQcY6vEsx4lQH.jpg'),
  ('Tomar', 'To take / To have (food/drink)', 'verb', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/young-man-drinking-coffee-from-cup-science-photo-library.jpg'),
  ('Café con leche', 'Coffee with milk', 'noun', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/l-intro-1685463467.jpg'),
  ('Agua', 'Water', 'noun', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/png-clipart-clear-glass-cup-drinking-water-glass-cup-mineral-water-glass-food.png'),
  ('El menú', 'The menu', 'noun', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/orelles-1440x1080.jpg'),
  ('El pollo', 'The chicken', 'noun', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/middle-eastern-spatchcocked-roast-chicken-and-vegetables-1-25-600x901.jpg'),
  ('La ensalada', 'The salad', 'noun', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/fresh-green-salad-bowl-radicchio-tomatoes-pumpkin-seeds-fresh-green-salad-bowl-radicchio-tomatoes-pumpkin-seeds-144838499.jpg.webp'),
  ('El arroz', 'The rice', 'noun', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/how-to-cook-rice.jpg'),
  ('Para llevar', 'To go / Takeaway', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/takeaway.png'),
  ('Para tomar aquí', 'To eat/drink here', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/people-dining-eating-spending-time-together-inside-spanish-cafe-barcelona-spain-nov-view-street-restaurant-bar-pub-150353990.jpg.webp'),
  ('Quisiera', 'I would like (formal)', 'phrase', NULL),
  ('Me pone un/una…', 'Can I get a... (Spain)', 'phrase', NULL),
  ('Soy alérgico/a a...', 'I am allergic to...', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/By_insemarDrawings1-1.jpg.webp'),
  ('¿Lleva [alérgeno]?', 'Does it contain [allergen]?', 'phrase', NULL),
  ('Nada más', 'Nothing else', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/phew-no-thanks-i-pass-displeased-unimpressed-and-uninterested-handsome-mature-redhead-man-with-beard-turning-away-and-pulling-palm-towards-camera-R60940.jpg'),
  ('¿Para tomar aquí o para llevar?', 'For here or to go?', 'phrase', NULL),
  ('¿Qué me recomienda?', 'What do you recommend?', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/Please-Never-Ask-Your-Waiter-This-Question-FT-BLOG0125-3129cba2a55c44539883831b6f6d8947.jpg'),
  ('¿Tiene alguna alergia?', 'Do you have any allergies?', 'phrase', NULL),
  ('¿Algo más?', 'Anything else?', 'phrase', NULL),
  ('¿Me pone un café?', 'Can I get a coffee?', 'phrase', NULL),
  ('¿Para beber?', 'To drink?', 'phrase', 'https://gpplxflzkjmbomzafqju.supabase.co/storage/v1/object/public/content-images/terms/spanish_cafe_terms_pngs/il_570xN.3987462371_dt3j.jpg.webp');

-- Link terms to subunit 3.1
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 5, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 54 AND 74;

-- ============================================================
-- A1 TERMS — Unit 4, Subunit 4.1: Map Mode
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('Hay', 'There is / There are', 'verb'),
  ('Cerca', 'Near', 'adverb'),
  ('Lejos', 'Far', 'adverb'),
  ('Al lado de', 'Next to', 'preposition'),
  ('Enfrente de', 'In front of / Opposite', 'preposition'),
  ('A la derecha', 'To the right', 'phrase'),
  ('A la izquierda', 'To the left', 'phrase'),
  ('Todo recto', 'Straight ahead', 'phrase'),
  ('Girar', 'To turn', 'verb'),
  ('Cruzar', 'To cross', 'verb'),
  ('¿Dónde está...?', 'Where is...?', 'phrase'),
  ('¿Dónde hay un/una...?', 'Where is there a...?', 'phrase'),
  ('¿Está cerca de aquí?', 'Is it near here?', 'phrase'),
  ('¿Por aquí hay...?', 'Is there a ... around here?', 'phrase'),
  ('¿Cómo llego a...?', 'How do I get to...?', 'phrase');

-- Link terms to subunit 4.1
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 6, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 75 AND 89;

-- ============================================================
-- A2 TERMS — Unit 1, Subunit 1.1: Relative Truths: Family
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('Padre', 'Father', 'noun'),
  ('Hermano/a', 'Brother/Sister', 'noun'),
  ('Hijo/a', 'Son/Daughter', 'noun'),
  ('Amigo/a', 'Friend', 'noun'),
  ('Novio/a', 'Boyfriend/Girlfriend', 'noun'),
  ('Es muy simpático/a', 'He/She is very nice', 'phrase'),
  ('Mi madre es amable', 'My mother is kind', 'phrase'),
  ('Mi hermano es divertido', 'My brother is fun', 'phrase'),
  ('Mi hermana es muy trabajadora', 'My sister is very hardworking', 'phrase'),
  ('Se parece a su padre', 'He/She looks like his/her father', 'phrase'),
  ('Somos muy diferentes', 'We are very different', 'phrase'),
  ('¿Cómo es tu madre?', 'What is your mother like?', 'phrase'),
  ('¿A quién te pareces?', 'Who do you look like?', 'phrase'),
  ('¿Tienes hermanos?', 'Do you have siblings?', 'phrase'),
  ('¿Cómo es tu mejor amigo/a?', 'What is your best friend like?', 'phrase');

-- Link terms to subunit A2 1.1 (subunit_id = 7)
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 7, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 90 AND 104;

-- ============================================================
-- A2 TERMS — Unit 2, Subunit 2.1: Rinse and Repeat
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('Siempre', 'Always', 'adverb'),
  ('Nunca', 'Never', 'adverb'),
  ('A veces', 'Sometimes', 'adverb'),
  ('Normalmente', 'Normally', 'adverb'),
  ('Generalmente', 'Generally', 'adverb'),
  ('Frecuentemente', 'Frequently', 'adverb'),
  ('Raramente', 'Rarely', 'adverb'),
  ('Todos los días', 'Every day', 'phrase'),
  ('Cada semana', 'Every week', 'phrase'),
  ('Una vez', 'Once', 'phrase'),
  ('Dos veces', 'Twice', 'phrase'),
  ('Siempre desayuno', 'I always have breakfast', 'phrase'),
  ('Nunca como carne', 'I never eat meat', 'phrase'),
  ('A veces voy al gimnasio', 'Sometimes I go to the gym', 'phrase'),
  ('Normalmente trabajo desde casa', 'I normally work from home', 'phrase'),
  ('Dos veces a la semana', 'Twice a week', 'phrase'),
  ('¿Con qué frecuencia...?', 'How often...?', 'phrase'),
  ('¿Cada cuánto...?', 'How often...? (alt)', 'phrase'),
  ('¿Siempre haces eso?', 'Do you always do that?', 'phrase'),
  ('¿Nunca comes carne?', 'Do you never eat meat?', 'phrase');

-- Link terms to subunit A2 2.1 (subunit_id = 8)
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 8, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 105 AND 124;

-- ============================================================
-- A2 TERMS — Unit 3, Subunit 3.1: Fill Me In
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('Ayer', 'Yesterday', 'adverb'),
  ('Anoche', 'Last night', 'adverb'),
  ('Esta mañana', 'This morning', 'phrase'),
  ('La semana pasada', 'Last week', 'phrase'),
  ('El mes pasado', 'Last month', 'phrase'),
  ('El año pasado', 'Last year', 'phrase'),
  ('El otro día', 'The other day', 'phrase'),
  ('Ir', 'To go', 'verb'),
  ('Pasarlo bien/mal', 'To have a good/bad time', 'phrase'),
  ('Fuimos a un restaurante', 'We went to a restaurant', 'phrase'),
  ('Vimos una película', 'We watched a movie', 'phrase'),
  ('Me divertí mucho', 'I had a lot of fun', 'phrase'),
  ('Ayer fui a...', 'Yesterday I went to...', 'phrase'),
  ('Anoche vi una película', 'Last night I watched a movie', 'phrase'),
  ('Esta mañana comí...', 'This morning I ate...', 'phrase'),
  ('La semana pasada trabajé mucho', 'Last week I worked a lot', 'phrase'),
  ('Hace dos días...', 'Two days ago...', 'phrase'),
  ('¿Lo pasaste bien?', 'Did you have a good time?', 'phrase'),
  ('¿Qué hiciste ayer?', 'What did you do yesterday?', 'phrase'),
  ('¿Dónde fuiste?', 'Where did you go?', 'phrase');

-- Link terms to subunit A2 3.1 (subunit_id = 9)
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 9, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 125 AND 144;

-- ============================================================
-- A2 TERMS — Unit 4, Subunit 4.1: Tap and Go
-- ============================================================

INSERT INTO terms (spanish, english, part_of_speech) VALUES
  ('El dinero', 'Money', 'noun'),
  ('Pagar', 'To pay', 'verb'),
  ('El cajero automático', 'ATM', 'noun'),
  ('Sacar dinero', 'To withdraw money', 'phrase'),
  ('Con tarjeta', 'By card', 'phrase'),
  ('En efectivo', 'In cash', 'phrase'),
  ('El recibo', 'The receipt', 'noun'),
  ('La cuenta', 'The bill', 'noun'),
  ('Quiero sacar dinero', 'I want to withdraw money', 'phrase'),
  ('No funciona', 'It doesn''t work', 'phrase'),
  ('Quédese con el cambio', 'Keep the change', 'phrase'),
  ('¿Aceptan tarjeta?', 'Do you accept card?', 'phrase'),
  ('¿Tiene cambio?', 'Do you have change?', 'phrase'),
  ('¿Me da un recibo, por favor?', 'Can I have a receipt, please?', 'phrase'),
  ('¿Puedo pagar en efectivo?', 'Can I pay in cash?', 'phrase'),
  ('¿Dónde hay un cajero?', 'Where is there an ATM?', 'phrase');

-- Link terms to subunit A2 4.1 (subunit_id = 10)
INSERT INTO subunit_terms (subunit_id, term_id, sort_order)
SELECT 10, term_id, row_number() OVER (ORDER BY term_id)
FROM terms WHERE term_id BETWEEN 145 AND 160;

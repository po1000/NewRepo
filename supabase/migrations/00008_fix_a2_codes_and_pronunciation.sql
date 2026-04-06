-- ============================================================
-- Migration 00008: Fix A2 subunit_codes + Seed pronunciation hints
-- ============================================================

-- Fix A2 subunit codes in live database (they were all '1.1')
UPDATE subunits SET subunit_code = '2.1'
WHERE title = 'Rinse and Repeat'
  AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 2 AND unit_number = 2);

UPDATE subunits SET subunit_code = '3.1'
WHERE title = 'Fill Me In'
  AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 2 AND unit_number = 3);

UPDATE subunits SET subunit_code = '4.1'
WHERE title = 'Tap and Go'
  AND unit_id = (SELECT unit_id FROM units WHERE cefr_level_id = 2 AND unit_number = 4);

-- ============================================================
-- Seed pronunciation hints for all subunits
-- ============================================================

-- Clear existing pronunciation hints
DELETE FROM term_pronunciation_hints;

-- A1 1.1: Hola, How's It Going?
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'The "ll" in "¿Cómo te llamas?" sounds like the English "y" in "yes". In some regions it sounds like "j" in "jeans".'
FROM terms WHERE spanish_text = '¿Cómo te llamas?';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Buenos → BWEH-nos. The "ue" diphthong sounds like "weh". Días → DEE-ahs with stress on the first syllable.'
FROM terms WHERE spanish_text = 'Buenos días';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Buenas → BWEH-nas. Noches → NOH-ches. The "ch" sounds the same as in English "church".'
FROM terms WHERE spanish_text = 'Buenas noches';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'The "H" in "Hola" is always silent in Spanish. Say OH-lah.'
FROM terms WHERE spanish_text = 'Hola';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Estoy → ehs-TOY. The stress falls on the second syllable. Feliz → feh-LEES.'
FROM terms WHERE spanish_text = 'Estoy feliz';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'The accent on "á" in "está" tells you the stress falls on the last syllable: ehs-TAH.'
FROM terms WHERE spanish_text = '¿Cómo está?';

-- A1 1.2: Putting Names to Faces
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Nombre → NOHM-breh. The "o" is a short pure vowel, never a diphthong like English "no".'
FROM terms WHERE spanish_text = 'El nombre';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Me llamo → meh YAH-moh. Remember "ll" = "y" sound.'
FROM terms WHERE spanish_text = 'Me llamo';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Igualmente → ee-GWAL-MEN-teh. The stress is on "men". Four syllables.'
FROM terms WHERE spanish_text = 'Igualmente';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Mucho gusto → MOO-cho GOOS-toh. The "u" in "gusto" is pronounced (unlike in "que" or "gui").'
FROM terms WHERE spanish_text = 'Mucho gusto';

-- A1 2.1: Lost in Translation
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Habla → AH-blah. The "h" is silent, the "b" is soft (almost like a "v").'
FROM terms WHERE spanish_text = '¿Habla inglés?';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Entiendo → en-TYEHN-doh. The "ie" diphthong sounds like "yeh".'
FROM terms WHERE spanish_text = 'No entiendo';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Repetir → reh-peh-TEER. The Spanish "r" is a single tap of the tongue against the roof of the mouth.'
FROM terms WHERE spanish_text = '¿Puede repetir por favor?';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Despacio → dehs-PAH-syoh. The "c" before "i" sounds like "s" (in Latin American Spanish) or "th" (in Spain).'
FROM terms WHERE spanish_text = 'Más despacio, por favor';

-- A1 2.2: Help is on the Way
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Necesito → neh-seh-SEE-toh. Four syllables with stress on the third.'
FROM terms WHERE spanish_text = 'Necesito ayuda';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Policía → poh-lee-SEE-ah. The accent on "í" forces stress there. Four syllables.'
FROM terms WHERE spanish_text = 'Llame a la policía';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Ambulancia → ahm-boo-LAHN-syah. The "c" before "i" is soft.'
FROM terms WHERE spanish_text = 'Llame a una ambulancia';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Problema → proh-BLEH-mah. Stress on the second syllable. The "r" after "p" is a single tongue tap.'
FROM terms WHERE spanish_text = 'Tengo un problema';

-- A1 3.1: Day at the Café
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Quiero → KYEH-roh. The "qu" sounds like English "k". The "ie" diphthong sounds like "yeh".'
FROM terms WHERE spanish_text = 'Quiero...';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Café → kah-FEH. Stress on the last syllable (accent mark). The "a" is open like "ah".'
FROM terms WHERE spanish_text = 'Un café, por favor';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Cuenta → KWEHN-tah. The "ue" diphthong sounds like "weh".'
FROM terms WHERE spanish_text = 'La cuenta, por favor';

-- A1 4.1: Map Mode
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Dónde → DOHN-deh. The accent on "ó" indicates stress and that it''s a question word.'
FROM terms WHERE spanish_text = '¿Dónde está...?';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Derecha → deh-REH-chah. The "ch" is like English "church".'
FROM terms WHERE spanish_text = 'A la derecha';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Izquierda → eez-KYEHR-dah. The "z" sounds like "s" in Latin America or "th" in Spain.'
FROM terms WHERE spanish_text = 'A la izquierda';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'The word "hay" is pronounced like the English word "eye". It''s a special form of "haber".'
FROM terms WHERE spanish_text = 'Hay';

-- A2 1.1: Relative Truths: Family
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Hermano → ehr-MAH-noh. The "h" is silent. Hermana → ehr-MAH-nah.'
FROM terms WHERE spanish_text = 'Hermano/a';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Simpático → seem-PAH-tee-koh. The accent on "á" marks the stress. Four syllables.'
FROM terms WHERE spanish_text = 'Es muy simpático/a';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Parece → pah-REH-seh. "Se parece a" → seh pah-REH-seh ah.'
FROM terms WHERE spanish_text = 'Se parece a su padre';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Diferentes → dee-feh-REHN-tehs. The "r" is a single tongue tap, not rolled.'
FROM terms WHERE spanish_text = 'Somos muy diferentes';

-- A2 2.1: Rinse and Repeat
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Siempre → SYEHM-preh. The "ie" diphthong sounds like "yeh".'
FROM terms WHERE spanish_text = 'Siempre';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Nunca → NOON-kah. Short, crisp. Stress on the first syllable.'
FROM terms WHERE spanish_text = 'Nunca';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Frecuentemente → freh-kwehn-teh-MEHN-teh. Five syllables, stress on the fourth.'
FROM terms WHERE spanish_text = 'Frecuentemente';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Frecuencia → freh-KWEHN-syah. The "cu" before "e" makes a "kw" sound.'
FROM terms WHERE spanish_text = '¿Con qué frecuencia...?';

-- A2 3.1: Fill Me In
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Ayer → ah-YEHR. Two syllables. Stress on the last syllable.'
FROM terms WHERE spanish_text = 'Ayer';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Anoche → ah-NOH-cheh. The "ch" is like English "church".'
FROM terms WHERE spanish_text = 'Anoche';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Hiciste → ee-SEES-teh. The "h" is silent. The "c" before "i" is soft.'
FROM terms WHERE spanish_text = '¿Qué hiciste ayer?';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Divertí → dee-vehr-TEE. The accent forces stress on the final syllable.'
FROM terms WHERE spanish_text = 'Me divertí mucho';

-- A2 4.1: Tap and Go
INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Dinero → dee-NEH-roh. The "r" is a single tongue tap.'
FROM terms WHERE spanish_text = 'El dinero';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Cajero → kah-HEH-roh. The "j" sounds like a strong English "h".'
FROM terms WHERE spanish_text = 'El cajero automático';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Efectivo → eh-fehk-TEE-voh. Four syllables, stress on the third.'
FROM terms WHERE spanish_text = 'En efectivo';

INSERT INTO term_pronunciation_hints (term_id, hint_text)
SELECT term_id, 'Recibo → reh-SEE-boh. The "b" between vowels is very soft, almost like "v".'
FROM terms WHERE spanish_text = 'El recibo';

-- ============================================================
-- Grant access to pronunciation hints
-- ============================================================
GRANT SELECT ON term_pronunciation_hints TO anon, authenticated;

-- RLS policy for pronunciation hints
ALTER TABLE term_pronunciation_hints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read pronunciation hints" ON term_pronunciation_hints;
CREATE POLICY "Anyone can read pronunciation hints" ON term_pronunciation_hints
  FOR SELECT USING (true);

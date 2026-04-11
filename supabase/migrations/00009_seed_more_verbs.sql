-- ============================================================
-- SEED: Additional beginner Spanish verbs + all 6 tenses
-- ============================================================
-- Adds 17 new regular verbs (7 -ar, 5 -er, 5 -ir) with all
-- six tenses, plus fills in missing tenses (imperfect, future,
-- conditional, subjunctive_present) for the existing irregular
-- verbs that 00005_seed_grammar.sql only populated for
-- present and preterite.
-- ============================================================

-- ------------------------------------------------------------
-- 1. ADD NEW VERBS (idempotent: only inserts if not present)
-- ------------------------------------------------------------

INSERT INTO verbs (infinitive, english_meaning, is_irregular, verb_category_id)
SELECT v.infinitive, v.english, false,
       (SELECT verb_category_id FROM grammar_verb_categories WHERE name = v.cat)
FROM (VALUES
  -- AR verbs
  ('comprar',   'to buy',       'ar'),
  ('estudiar',  'to study',     'ar'),
  ('trabajar',  'to work',      'ar'),
  ('cocinar',   'to cook',      'ar'),
  ('caminar',   'to walk',      'ar'),
  ('bailar',    'to dance',     'ar'),
  ('cantar',    'to sing',      'ar'),
  -- ER verbs
  ('comer',     'to eat',       'er'),
  ('beber',     'to drink',     'er'),
  ('leer',      'to read',      'er'),
  ('aprender',  'to learn',     'er'),
  ('correr',    'to run',       'er'),
  -- IR verbs
  ('vivir',     'to live',      'ir'),
  ('escribir',  'to write',     'ir'),
  ('abrir',     'to open',      'ir'),
  ('recibir',   'to receive',   'ir'),
  ('subir',     'to go up',     'ir')
) AS v(infinitive, english, cat)
WHERE NOT EXISTS (
  SELECT 1 FROM verbs WHERE verbs.infinitive = v.infinitive
);

-- ------------------------------------------------------------
-- 2. HELPER FUNCTION — inserts a full set of 6 pronoun
--    conjugations for (verb, tense) using an array of forms
--    ordered: yo, tú, él/ella/usted, nosotros, vosotros, ellos
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION _seed_conj(
  p_infinitive TEXT,
  p_tense TEXT,
  p_forms TEXT[],
  p_irregular BOOLEAN DEFAULT false
) RETURNS VOID AS $$
DECLARE
  v_verb_id INT;
  v_tense_id INT;
  v_prons TEXT[] := ARRAY['yo','tú','él/ella/usted','nosotros/as','vosotros/as','ellos/ellas/ustedes'];
  i INT;
BEGIN
  SELECT verb_id INTO v_verb_id FROM verbs WHERE infinitive = p_infinitive LIMIT 1;
  SELECT tense_id INTO v_tense_id FROM tenses WHERE name = p_tense LIMIT 1;
  IF v_verb_id IS NULL OR v_tense_id IS NULL THEN RETURN; END IF;

  FOR i IN 1..6 LOOP
    INSERT INTO verb_conjugations (verb_id, pronoun_id, tense_id, conjugated_form, is_irregular)
    SELECT v_verb_id, p.pronoun_id, v_tense_id, p_forms[i], p_irregular
    FROM pronouns p
    WHERE p.pronoun_text = v_prons[i]
    ON CONFLICT (verb_id, tense_id, pronoun_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 3. NEW AR VERBS — all 6 tenses
-- ------------------------------------------------------------

-- comprar
SELECT _seed_conj('comprar','present',             ARRAY['compro','compras','compra','compramos','compráis','compran']);
SELECT _seed_conj('comprar','preterite',           ARRAY['compré','compraste','compró','compramos','comprasteis','compraron']);
SELECT _seed_conj('comprar','imperfect',           ARRAY['compraba','comprabas','compraba','comprábamos','comprabais','compraban']);
SELECT _seed_conj('comprar','future',              ARRAY['compraré','comprarás','comprará','compraremos','compraréis','comprarán']);
SELECT _seed_conj('comprar','conditional',         ARRAY['compraría','comprarías','compraría','compraríamos','compraríais','comprarían']);
SELECT _seed_conj('comprar','subjunctive_present', ARRAY['compre','compres','compre','compremos','compréis','compren']);

-- estudiar
SELECT _seed_conj('estudiar','present',             ARRAY['estudio','estudias','estudia','estudiamos','estudiáis','estudian']);
SELECT _seed_conj('estudiar','preterite',           ARRAY['estudié','estudiaste','estudió','estudiamos','estudiasteis','estudiaron']);
SELECT _seed_conj('estudiar','imperfect',           ARRAY['estudiaba','estudiabas','estudiaba','estudiábamos','estudiabais','estudiaban']);
SELECT _seed_conj('estudiar','future',              ARRAY['estudiaré','estudiarás','estudiará','estudiaremos','estudiaréis','estudiarán']);
SELECT _seed_conj('estudiar','conditional',         ARRAY['estudiaría','estudiarías','estudiaría','estudiaríamos','estudiaríais','estudiarían']);
SELECT _seed_conj('estudiar','subjunctive_present', ARRAY['estudie','estudies','estudie','estudiemos','estudiéis','estudien']);

-- trabajar
SELECT _seed_conj('trabajar','present',             ARRAY['trabajo','trabajas','trabaja','trabajamos','trabajáis','trabajan']);
SELECT _seed_conj('trabajar','preterite',           ARRAY['trabajé','trabajaste','trabajó','trabajamos','trabajasteis','trabajaron']);
SELECT _seed_conj('trabajar','imperfect',           ARRAY['trabajaba','trabajabas','trabajaba','trabajábamos','trabajabais','trabajaban']);
SELECT _seed_conj('trabajar','future',              ARRAY['trabajaré','trabajarás','trabajará','trabajaremos','trabajaréis','trabajarán']);
SELECT _seed_conj('trabajar','conditional',         ARRAY['trabajaría','trabajarías','trabajaría','trabajaríamos','trabajaríais','trabajarían']);
SELECT _seed_conj('trabajar','subjunctive_present', ARRAY['trabaje','trabajes','trabaje','trabajemos','trabajéis','trabajen']);

-- cocinar
SELECT _seed_conj('cocinar','present',             ARRAY['cocino','cocinas','cocina','cocinamos','cocináis','cocinan']);
SELECT _seed_conj('cocinar','preterite',           ARRAY['cociné','cocinaste','cocinó','cocinamos','cocinasteis','cocinaron']);
SELECT _seed_conj('cocinar','imperfect',           ARRAY['cocinaba','cocinabas','cocinaba','cocinábamos','cocinabais','cocinaban']);
SELECT _seed_conj('cocinar','future',              ARRAY['cocinaré','cocinarás','cocinará','cocinaremos','cocinaréis','cocinarán']);
SELECT _seed_conj('cocinar','conditional',         ARRAY['cocinaría','cocinarías','cocinaría','cocinaríamos','cocinaríais','cocinarían']);
SELECT _seed_conj('cocinar','subjunctive_present', ARRAY['cocine','cocines','cocine','cocinemos','cocinéis','cocinen']);

-- caminar
SELECT _seed_conj('caminar','present',             ARRAY['camino','caminas','camina','caminamos','camináis','caminan']);
SELECT _seed_conj('caminar','preterite',           ARRAY['caminé','caminaste','caminó','caminamos','caminasteis','caminaron']);
SELECT _seed_conj('caminar','imperfect',           ARRAY['caminaba','caminabas','caminaba','caminábamos','caminabais','caminaban']);
SELECT _seed_conj('caminar','future',              ARRAY['caminaré','caminarás','caminará','caminaremos','caminaréis','caminarán']);
SELECT _seed_conj('caminar','conditional',         ARRAY['caminaría','caminarías','caminaría','caminaríamos','caminaríais','caminarían']);
SELECT _seed_conj('caminar','subjunctive_present', ARRAY['camine','camines','camine','caminemos','caminéis','caminen']);

-- bailar
SELECT _seed_conj('bailar','present',             ARRAY['bailo','bailas','baila','bailamos','bailáis','bailan']);
SELECT _seed_conj('bailar','preterite',           ARRAY['bailé','bailaste','bailó','bailamos','bailasteis','bailaron']);
SELECT _seed_conj('bailar','imperfect',           ARRAY['bailaba','bailabas','bailaba','bailábamos','bailabais','bailaban']);
SELECT _seed_conj('bailar','future',              ARRAY['bailaré','bailarás','bailará','bailaremos','bailaréis','bailarán']);
SELECT _seed_conj('bailar','conditional',         ARRAY['bailaría','bailarías','bailaría','bailaríamos','bailaríais','bailarían']);
SELECT _seed_conj('bailar','subjunctive_present', ARRAY['baile','bailes','baile','bailemos','bailéis','bailen']);

-- cantar
SELECT _seed_conj('cantar','present',             ARRAY['canto','cantas','canta','cantamos','cantáis','cantan']);
SELECT _seed_conj('cantar','preterite',           ARRAY['canté','cantaste','cantó','cantamos','cantasteis','cantaron']);
SELECT _seed_conj('cantar','imperfect',           ARRAY['cantaba','cantabas','cantaba','cantábamos','cantabais','cantaban']);
SELECT _seed_conj('cantar','future',              ARRAY['cantaré','cantarás','cantará','cantaremos','cantaréis','cantarán']);
SELECT _seed_conj('cantar','conditional',         ARRAY['cantaría','cantarías','cantaría','cantaríamos','cantaríais','cantarían']);
SELECT _seed_conj('cantar','subjunctive_present', ARRAY['cante','cantes','cante','cantemos','cantéis','canten']);

-- ------------------------------------------------------------
-- 4. NEW ER VERBS — all 6 tenses
-- ------------------------------------------------------------

-- comer
SELECT _seed_conj('comer','present',             ARRAY['como','comes','come','comemos','coméis','comen']);
SELECT _seed_conj('comer','preterite',           ARRAY['comí','comiste','comió','comimos','comisteis','comieron']);
SELECT _seed_conj('comer','imperfect',           ARRAY['comía','comías','comía','comíamos','comíais','comían']);
SELECT _seed_conj('comer','future',              ARRAY['comeré','comerás','comerá','comeremos','comeréis','comerán']);
SELECT _seed_conj('comer','conditional',         ARRAY['comería','comerías','comería','comeríamos','comeríais','comerían']);
SELECT _seed_conj('comer','subjunctive_present', ARRAY['coma','comas','coma','comamos','comáis','coman']);

-- beber
SELECT _seed_conj('beber','present',             ARRAY['bebo','bebes','bebe','bebemos','bebéis','beben']);
SELECT _seed_conj('beber','preterite',           ARRAY['bebí','bebiste','bebió','bebimos','bebisteis','bebieron']);
SELECT _seed_conj('beber','imperfect',           ARRAY['bebía','bebías','bebía','bebíamos','bebíais','bebían']);
SELECT _seed_conj('beber','future',              ARRAY['beberé','beberás','beberá','beberemos','beberéis','beberán']);
SELECT _seed_conj('beber','conditional',         ARRAY['bebería','beberías','bebería','beberíamos','beberíais','beberían']);
SELECT _seed_conj('beber','subjunctive_present', ARRAY['beba','bebas','beba','bebamos','bebáis','beban']);

-- leer (note: preterite has y in 3rd person — small irregularity)
SELECT _seed_conj('leer','present',             ARRAY['leo','lees','lee','leemos','leéis','leen']);
SELECT _seed_conj('leer','preterite',           ARRAY['leí','leíste','leyó','leímos','leísteis','leyeron'], true);
SELECT _seed_conj('leer','imperfect',           ARRAY['leía','leías','leía','leíamos','leíais','leían']);
SELECT _seed_conj('leer','future',              ARRAY['leeré','leerás','leerá','leeremos','leeréis','leerán']);
SELECT _seed_conj('leer','conditional',         ARRAY['leería','leerías','leería','leeríamos','leeríais','leerían']);
SELECT _seed_conj('leer','subjunctive_present', ARRAY['lea','leas','lea','leamos','leáis','lean']);

-- aprender
SELECT _seed_conj('aprender','present',             ARRAY['aprendo','aprendes','aprende','aprendemos','aprendéis','aprenden']);
SELECT _seed_conj('aprender','preterite',           ARRAY['aprendí','aprendiste','aprendió','aprendimos','aprendisteis','aprendieron']);
SELECT _seed_conj('aprender','imperfect',           ARRAY['aprendía','aprendías','aprendía','aprendíamos','aprendíais','aprendían']);
SELECT _seed_conj('aprender','future',              ARRAY['aprenderé','aprenderás','aprenderá','aprenderemos','aprenderéis','aprenderán']);
SELECT _seed_conj('aprender','conditional',         ARRAY['aprendería','aprenderías','aprendería','aprenderíamos','aprenderíais','aprenderían']);
SELECT _seed_conj('aprender','subjunctive_present', ARRAY['aprenda','aprendas','aprenda','aprendamos','aprendáis','aprendan']);

-- correr
SELECT _seed_conj('correr','present',             ARRAY['corro','corres','corre','corremos','corréis','corren']);
SELECT _seed_conj('correr','preterite',           ARRAY['corrí','corriste','corrió','corrimos','corristeis','corrieron']);
SELECT _seed_conj('correr','imperfect',           ARRAY['corría','corrías','corría','corríamos','corríais','corrían']);
SELECT _seed_conj('correr','future',              ARRAY['correré','correrás','correrá','correremos','correréis','correrán']);
SELECT _seed_conj('correr','conditional',         ARRAY['correría','correrías','correría','correríamos','correríais','correrían']);
SELECT _seed_conj('correr','subjunctive_present', ARRAY['corra','corras','corra','corramos','corráis','corran']);

-- ------------------------------------------------------------
-- 5. NEW IR VERBS — all 6 tenses
-- ------------------------------------------------------------

-- vivir
SELECT _seed_conj('vivir','present',             ARRAY['vivo','vives','vive','vivimos','vivís','viven']);
SELECT _seed_conj('vivir','preterite',           ARRAY['viví','viviste','vivió','vivimos','vivisteis','vivieron']);
SELECT _seed_conj('vivir','imperfect',           ARRAY['vivía','vivías','vivía','vivíamos','vivíais','vivían']);
SELECT _seed_conj('vivir','future',              ARRAY['viviré','vivirás','vivirá','viviremos','viviréis','vivirán']);
SELECT _seed_conj('vivir','conditional',         ARRAY['viviría','vivirías','viviría','viviríamos','viviríais','vivirían']);
SELECT _seed_conj('vivir','subjunctive_present', ARRAY['viva','vivas','viva','vivamos','viváis','vivan']);

-- escribir
SELECT _seed_conj('escribir','present',             ARRAY['escribo','escribes','escribe','escribimos','escribís','escriben']);
SELECT _seed_conj('escribir','preterite',           ARRAY['escribí','escribiste','escribió','escribimos','escribisteis','escribieron']);
SELECT _seed_conj('escribir','imperfect',           ARRAY['escribía','escribías','escribía','escribíamos','escribíais','escribían']);
SELECT _seed_conj('escribir','future',              ARRAY['escribiré','escribirás','escribirá','escribiremos','escribiréis','escribirán']);
SELECT _seed_conj('escribir','conditional',         ARRAY['escribiría','escribirías','escribiría','escribiríamos','escribiríais','escribirían']);
SELECT _seed_conj('escribir','subjunctive_present', ARRAY['escriba','escribas','escriba','escribamos','escribáis','escriban']);

-- abrir
SELECT _seed_conj('abrir','present',             ARRAY['abro','abres','abre','abrimos','abrís','abren']);
SELECT _seed_conj('abrir','preterite',           ARRAY['abrí','abriste','abrió','abrimos','abristeis','abrieron']);
SELECT _seed_conj('abrir','imperfect',           ARRAY['abría','abrías','abría','abríamos','abríais','abrían']);
SELECT _seed_conj('abrir','future',              ARRAY['abriré','abrirás','abrirá','abriremos','abriréis','abrirán']);
SELECT _seed_conj('abrir','conditional',         ARRAY['abriría','abrirías','abriría','abriríamos','abriríais','abrirían']);
SELECT _seed_conj('abrir','subjunctive_present', ARRAY['abra','abras','abra','abramos','abráis','abran']);

-- recibir
SELECT _seed_conj('recibir','present',             ARRAY['recibo','recibes','recibe','recibimos','recibís','reciben']);
SELECT _seed_conj('recibir','preterite',           ARRAY['recibí','recibiste','recibió','recibimos','recibisteis','recibieron']);
SELECT _seed_conj('recibir','imperfect',           ARRAY['recibía','recibías','recibía','recibíamos','recibíais','recibían']);
SELECT _seed_conj('recibir','future',              ARRAY['recibiré','recibirás','recibirá','recibiremos','recibiréis','recibirán']);
SELECT _seed_conj('recibir','conditional',         ARRAY['recibiría','recibirías','recibiría','recibiríamos','recibiríais','recibirían']);
SELECT _seed_conj('recibir','subjunctive_present', ARRAY['reciba','recibas','reciba','recibamos','recibáis','reciban']);

-- subir
SELECT _seed_conj('subir','present',             ARRAY['subo','subes','sube','subimos','subís','suben']);
SELECT _seed_conj('subir','preterite',           ARRAY['subí','subiste','subió','subimos','subisteis','subieron']);
SELECT _seed_conj('subir','imperfect',           ARRAY['subía','subías','subía','subíamos','subíais','subían']);
SELECT _seed_conj('subir','future',              ARRAY['subiré','subirás','subirá','subiremos','subiréis','subirán']);
SELECT _seed_conj('subir','conditional',         ARRAY['subiría','subirías','subiría','subiríamos','subiríais','subirían']);
SELECT _seed_conj('subir','subjunctive_present', ARRAY['suba','subas','suba','subamos','subáis','suban']);

-- ------------------------------------------------------------
-- 6. EXISTING REGULAR VERBS — fill in missing tenses
--    (hablar, necesitar, pagar, entender)
-- ------------------------------------------------------------

-- hablar (ar regular)
SELECT _seed_conj('hablar','preterite',           ARRAY['hablé','hablaste','habló','hablamos','hablasteis','hablaron']);
SELECT _seed_conj('hablar','imperfect',           ARRAY['hablaba','hablabas','hablaba','hablábamos','hablabais','hablaban']);
SELECT _seed_conj('hablar','future',              ARRAY['hablaré','hablarás','hablará','hablaremos','hablaréis','hablarán']);
SELECT _seed_conj('hablar','conditional',         ARRAY['hablaría','hablarías','hablaría','hablaríamos','hablaríais','hablarían']);
SELECT _seed_conj('hablar','subjunctive_present', ARRAY['hable','hables','hable','hablemos','habléis','hablen']);

-- necesitar (ar regular)
SELECT _seed_conj('necesitar','preterite',           ARRAY['necesité','necesitaste','necesitó','necesitamos','necesitasteis','necesitaron']);
SELECT _seed_conj('necesitar','imperfect',           ARRAY['necesitaba','necesitabas','necesitaba','necesitábamos','necesitabais','necesitaban']);
SELECT _seed_conj('necesitar','future',              ARRAY['necesitaré','necesitarás','necesitará','necesitaremos','necesitaréis','necesitarán']);
SELECT _seed_conj('necesitar','conditional',         ARRAY['necesitaría','necesitarías','necesitaría','necesitaríamos','necesitaríais','necesitarían']);
SELECT _seed_conj('necesitar','subjunctive_present', ARRAY['necesite','necesites','necesite','necesitemos','necesitéis','necesiten']);

-- pagar (ar regular with spelling change before e)
SELECT _seed_conj('pagar','preterite',           ARRAY['pagué','pagaste','pagó','pagamos','pagasteis','pagaron'], true);
SELECT _seed_conj('pagar','imperfect',           ARRAY['pagaba','pagabas','pagaba','pagábamos','pagabais','pagaban']);
SELECT _seed_conj('pagar','future',              ARRAY['pagaré','pagarás','pagará','pagaremos','pagaréis','pagarán']);
SELECT _seed_conj('pagar','conditional',         ARRAY['pagaría','pagarías','pagaría','pagaríamos','pagaríais','pagarían']);
SELECT _seed_conj('pagar','subjunctive_present', ARRAY['pague','pagues','pague','paguemos','paguéis','paguen'], true);

-- entender (er stem-changing e->ie in present, regular elsewhere)
SELECT _seed_conj('entender','preterite',           ARRAY['entendí','entendiste','entendió','entendimos','entendisteis','entendieron']);
SELECT _seed_conj('entender','imperfect',           ARRAY['entendía','entendías','entendía','entendíamos','entendíais','entendían']);
SELECT _seed_conj('entender','future',              ARRAY['entenderé','entenderás','entenderá','entenderemos','entenderéis','entenderán']);
SELECT _seed_conj('entender','conditional',         ARRAY['entendería','entenderías','entendería','entenderíamos','entenderíais','entenderían']);
SELECT _seed_conj('entender','subjunctive_present', ARRAY['entienda','entiendas','entienda','entendamos','entendáis','entiendan'], true);

-- ------------------------------------------------------------
-- 7. EXISTING IRREGULAR VERBS — fill in missing tenses
-- ------------------------------------------------------------

-- ser: imperfect (era), future (seré — regular), conditional (sería — regular), subjunctive (sea)
SELECT _seed_conj('ser','imperfect',           ARRAY['era','eras','era','éramos','erais','eran'], true);
SELECT _seed_conj('ser','future',              ARRAY['seré','serás','será','seremos','seréis','serán']);
SELECT _seed_conj('ser','conditional',         ARRAY['sería','serías','sería','seríamos','seríais','serían']);
SELECT _seed_conj('ser','subjunctive_present', ARRAY['sea','seas','sea','seamos','seáis','sean'], true);

-- estar: imperfect (regular), future (regular), conditional (regular), subjunctive (esté)
SELECT _seed_conj('estar','imperfect',           ARRAY['estaba','estabas','estaba','estábamos','estabais','estaban']);
SELECT _seed_conj('estar','future',              ARRAY['estaré','estarás','estará','estaremos','estaréis','estarán']);
SELECT _seed_conj('estar','conditional',         ARRAY['estaría','estarías','estaría','estaríamos','estaríais','estarían']);
SELECT _seed_conj('estar','subjunctive_present', ARRAY['esté','estés','esté','estemos','estéis','estén'], true);

-- ir: imperfect (iba — very irregular), future (iré — regular), conditional, subjunctive (vaya)
SELECT _seed_conj('ir','imperfect',           ARRAY['iba','ibas','iba','íbamos','ibais','iban'], true);
SELECT _seed_conj('ir','future',              ARRAY['iré','irás','irá','iremos','iréis','irán']);
SELECT _seed_conj('ir','conditional',         ARRAY['iría','irías','iría','iríamos','iríais','irían']);
SELECT _seed_conj('ir','subjunctive_present', ARRAY['vaya','vayas','vaya','vayamos','vayáis','vayan'], true);

-- tener: imperfect (regular), future (tendré), conditional (tendría), subjunctive (tenga)
SELECT _seed_conj('tener','imperfect',           ARRAY['tenía','tenías','tenía','teníamos','teníais','tenían']);
SELECT _seed_conj('tener','future',              ARRAY['tendré','tendrás','tendrá','tendremos','tendréis','tendrán'], true);
SELECT _seed_conj('tener','conditional',         ARRAY['tendría','tendrías','tendría','tendríamos','tendríais','tendrían'], true);
SELECT _seed_conj('tener','subjunctive_present', ARRAY['tenga','tengas','tenga','tengamos','tengáis','tengan'], true);

-- hacer: imperfect (regular), future (haré), conditional (haría), subjunctive (haga)
SELECT _seed_conj('hacer','imperfect',           ARRAY['hacía','hacías','hacía','hacíamos','hacíais','hacían']);
SELECT _seed_conj('hacer','future',              ARRAY['haré','harás','hará','haremos','haréis','harán'], true);
SELECT _seed_conj('hacer','conditional',         ARRAY['haría','harías','haría','haríamos','haríais','harían'], true);
SELECT _seed_conj('hacer','subjunctive_present', ARRAY['haga','hagas','haga','hagamos','hagáis','hagan'], true);

-- decir: imperfect (regular), future (diré), conditional (diría), subjunctive (diga)
SELECT _seed_conj('decir','imperfect',           ARRAY['decía','decías','decía','decíamos','decíais','decían']);
SELECT _seed_conj('decir','future',              ARRAY['diré','dirás','dirá','diremos','diréis','dirán'], true);
SELECT _seed_conj('decir','conditional',         ARRAY['diría','dirías','diría','diríamos','diríais','dirían'], true);
SELECT _seed_conj('decir','subjunctive_present', ARRAY['diga','digas','diga','digamos','digáis','digan'], true);

-- querer: imperfect (regular), future (querré), conditional (querría), subjunctive (quiera)
SELECT _seed_conj('querer','imperfect',           ARRAY['quería','querías','quería','queríamos','queríais','querían']);
SELECT _seed_conj('querer','future',              ARRAY['querré','querrás','querrá','querremos','querréis','querrán'], true);
SELECT _seed_conj('querer','conditional',         ARRAY['querría','querrías','querría','querríamos','querríais','querrían'], true);
SELECT _seed_conj('querer','subjunctive_present', ARRAY['quiera','quieras','quiera','queramos','queráis','quieran'], true);

-- poder: imperfect (regular), future (podré), conditional (podría), subjunctive (pueda)
SELECT _seed_conj('poder','imperfect',           ARRAY['podía','podías','podía','podíamos','podíais','podían']);
SELECT _seed_conj('poder','future',              ARRAY['podré','podrás','podrá','podremos','podréis','podrán'], true);
SELECT _seed_conj('poder','conditional',         ARRAY['podría','podrías','podría','podríamos','podríais','podrían'], true);
SELECT _seed_conj('poder','subjunctive_present', ARRAY['pueda','puedas','pueda','podamos','podáis','puedan'], true);

-- ver: imperfect (veía — retains e), future (regular), conditional (regular), subjunctive (vea)
SELECT _seed_conj('ver','imperfect',           ARRAY['veía','veías','veía','veíamos','veíais','veían'], true);
SELECT _seed_conj('ver','future',              ARRAY['veré','verás','verá','veremos','veréis','verán']);
SELECT _seed_conj('ver','conditional',         ARRAY['vería','verías','vería','veríamos','veríais','verían']);
SELECT _seed_conj('ver','subjunctive_present', ARRAY['vea','veas','vea','veamos','veáis','vean']);

-- haber: imperfect (regular), future (habré), conditional (habría), subjunctive (haya)
SELECT _seed_conj('haber','imperfect',           ARRAY['había','habías','había','habíamos','habíais','habían']);
SELECT _seed_conj('haber','future',              ARRAY['habré','habrás','habrá','habremos','habréis','habrán'], true);
SELECT _seed_conj('haber','conditional',         ARRAY['habría','habrías','habría','habríamos','habríais','habrían'], true);
SELECT _seed_conj('haber','subjunctive_present', ARRAY['haya','hayas','haya','hayamos','hayáis','hayan'], true);

-- ------------------------------------------------------------
-- 8. CLEAN UP HELPER FUNCTION
-- ------------------------------------------------------------

DROP FUNCTION IF EXISTS _seed_conj(TEXT, TEXT, TEXT[], BOOLEAN);

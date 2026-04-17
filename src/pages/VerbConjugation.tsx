import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { GrammarBreadcrumb } from '../components/GrammarBreadcrumb';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';

interface TenseInfo {
  tense_id: number;
  name: string;
  english_name: string;
  description: string;
  sort_order: number;
}

interface ConjugationRow {
  pronoun_text: string;
  person_group: string;
  sort_order: number;
  forms: Record<string, string>; // tense_name -> conjugated_form
}

interface VerbInfo {
  verb_id: number;
  infinitive: string;
  english_meaning: string;
  is_irregular: boolean;
  category_name: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ar: '-ar Verbs',
  er: '-er Verbs',
  ir: '-ir Verbs',
  irregular: 'Irregular Verbs',
  reflexive: 'Reflexive Verbs',
};


const SINGULAR_PRONOUNS = ['1st singular', '2nd singular', '3rd singular'];
const PLURAL_PRONOUNS = ['1st plural', '2nd plural', '3rd plural'];

export function VerbConjugation() {
  usePageTitle('Verb Conjugation');
  const { t } = useLanguage();
  const { verb: verbSlug } = useParams<{ verb: string }>();
  const location = useLocation();
  // Extract category from URL path: /grammar/er-verbs/ser → 'er'
  const pathCategory = location.pathname.match(/\/grammar\/(\w+)-verbs\//)?.[1] || 'er';
  const [verb, setVerb] = useState<VerbInfo | null>(null);
  const [tenses, setTenses] = useState<TenseInfo[]>([]);
  const [rows, setRows] = useState<ConjugationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTense, setHoveredTense] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!verbSlug) return;

      // Fetch the verb
      const { data: verbData } = await supabase
        .from('verbs')
        .select('verb_id, infinitive, english_meaning, is_irregular, grammar_verb_categories ( name )')
        .ilike('infinitive', verbSlug)
        .single();

      if (!verbData) {
        setLoading(false);
        return;
      }

      const catName = (verbData as any).grammar_verb_categories?.name || 'irregular';
      setVerb({
        verb_id: verbData.verb_id,
        infinitive: verbData.infinitive,
        english_meaning: verbData.english_meaning,
        is_irregular: verbData.is_irregular,
        category_name: catName,
      });

      // Fetch all tenses
      const { data: tenseData } = await supabase
        .from('tenses')
        .select('tense_id, name, english_name, description, sort_order')
        .order('sort_order');

      if (tenseData) setTenses(tenseData);

      // Fetch conjugations for this verb
      const { data: conjData } = await supabase
        .from('verb_conjugations')
        .select('conjugated_form, tenses ( name, sort_order ), pronouns ( pronoun_text, person_group, sort_order )')
        .eq('verb_id', verbData.verb_id);

      if (conjData?.length) {
        // Group by pronoun
        const pronMap = new Map<string, ConjugationRow>();

        for (const c of conjData) {
          const pron = (c as any).pronouns;
          const tense = (c as any).tenses;

          if (!pronMap.has(pron.pronoun_text)) {
            pronMap.set(pron.pronoun_text, {
              pronoun_text: pron.pronoun_text,
              person_group: pron.person_group,
              sort_order: pron.sort_order,
              forms: {},
            });
          }
          pronMap.get(pron.pronoun_text)!.forms[tense.name] = c.conjugated_form;
        }

        const sorted = Array.from(pronMap.values()).sort((a, b) => a.sort_order - b.sort_order);
        setRows(sorted);
      }

      setLoading(false);
    }

    load();
  }, [verbSlug]);

  // Filter tenses that have at least one conjugation for this verb
  const activeTenses = tenses.filter(t => rows.some(r => r.forms[t.name]));

  const catLabel = CATEGORY_LABELS[pathCategory] || (verb ? CATEGORY_LABELS[verb.category_name] : '') || 'Verbs';
  const displayCategory = pathCategory;

  const crumbs = [
    { label: 'Grammar', to: '/grammar' },
    { label: 'Conjugations', to: '/grammar' },
    { label: catLabel || `${displayCategory} Verbs`, to: `/grammar/${displayCategory}-verbs` },
    { label: verb?.infinitive ? verb.infinitive.charAt(0).toUpperCase() + verb.infinitive.slice(1) : '' },
  ];

  const singularRows = rows.filter(r => SINGULAR_PRONOUNS.includes(r.person_group));
  const pluralRows = rows.filter(r => PLURAL_PRONOUNS.includes(r.person_group));

  return (
    <PageLayout backgroundColor="#FF4D01" navOverrideClass="[&_a]:text-white [&_button]:text-white [&_svg]:text-white">
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#FF7032] origin-top-left -skew-y-3 pointer-events-none" />

      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-[684px] mx-auto pt-8 pb-20 px-4 sm:px-8">
          <GrammarBreadcrumb crumbs={crumbs} />

          {loading ? (
            <p className="text-white text-lg">Loading...</p>
          ) : !verb ? (
            <p className="text-white text-lg">Verb not found.</p>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-inter text-[25.5px] leading-[36px] text-white">
                  <span className="font-bold">{verb.infinitive.charAt(0).toUpperCase() + verb.infinitive.slice(1)}</span>{' '}
                  ({verb.english_meaning})
                </h1>
                {verb.is_irregular && (
                  <span className="inline-block mt-2 px-3 py-0.5 bg-white/20 rounded-full text-[12px] font-semibold text-white">
                    {t('grammar.irregular')}
                  </span>
                )}
              </div>

              {activeTenses.length === 0 ? (
                <p className="text-white/80 text-[14px]">No conjugation data available yet for this verb.</p>
              ) : (
                <div className="w-full overflow-x-auto">
                  {/* Table Headers */}
                  <div className="flex mb-4 ml-[45px] min-w-fit">
                    <div className="w-[100px] flex justify-center shrink-0">
                      <span className="font-inter font-medium text-[14px] leading-[28px] text-white">
                        {t('grammar.pronounsCol')}
                      </span>
                    </div>
                    {activeTenses.map(t => (
                      <div
                        key={t.tense_id}
                        className="w-[100px] ml-[8px] flex justify-center shrink-0 relative"
                        onMouseEnter={() => setHoveredTense(t.name)}
                        onMouseLeave={() => setHoveredTense(null)}
                      >
                        <span className="font-inter font-medium text-[14px] leading-[28px] text-white cursor-help">
                          {t.english_name}
                        </span>
                        {hoveredTense === t.name && t.description && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#372213] text-white text-[12px] leading-[16px] rounded-xl shadow-lg z-30 font-inter pointer-events-none">
                            {t.description}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#372213] rotate-45 -mt-1.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 min-w-fit">
                    {/* Singular/Plural sidebar */}
                    <div className="w-[33px] flex flex-col gap-4 shrink-0">
                      {singularRows.length > 0 && (
                        <div
                          className="w-full bg-[#FF7032] rounded-lg flex items-center justify-center"
                          style={{ height: `${singularRows.length * 70 + (singularRows.length - 1) * 8}px` }}
                        >
                          <span className="font-inter font-semibold text-[15px] text-white -rotate-90 whitespace-nowrap">
                            {t('grammar.singular')}
                          </span>
                        </div>
                      )}
                      {pluralRows.length > 0 && (
                        <div
                          className="w-full bg-[#FF7032] rounded-lg flex items-center justify-center"
                          style={{ height: `${pluralRows.length * 70 + (pluralRows.length - 1) * 8}px` }}
                        >
                          <span className="font-inter font-semibold text-[15px] text-white -rotate-90 whitespace-nowrap">
                            {t('grammar.plural')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pronouns column */}
                    <div className="w-[100px] flex flex-col gap-4 shrink-0">
                      <div className="flex flex-col gap-2">
                        {singularRows.map(r => (
                          <div key={r.pronoun_text} className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                            <span className="font-inter font-medium text-[12px] leading-[18px] text-[#372213] text-center">
                              {r.pronoun_text.split('/').join('\n')}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2">
                        {pluralRows.map(r => (
                          <div key={r.pronoun_text} className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                            <span className="font-inter font-medium text-[12px] leading-[18px] text-[#372213] text-center whitespace-pre-line">
                              {r.pronoun_text.split('/').join('\n')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tense columns */}
                    {activeTenses.map(t => (
                      <div key={t.tense_id} className="w-[100px] flex flex-col gap-4 shrink-0">
                        <div className="flex flex-col gap-2">
                          {singularRows.map(r => (
                            <div key={r.pronoun_text} className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                              <span className="font-inter font-semibold text-[16px] leading-[20px] text-[#372213]">
                                {r.forms[t.name] || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col gap-2">
                          {pluralRows.map(r => (
                            <div key={r.pronoun_text} className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                              <span className="font-inter font-semibold text-[16px] leading-[20px] text-[#372213]">
                                {r.forms[t.name] || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

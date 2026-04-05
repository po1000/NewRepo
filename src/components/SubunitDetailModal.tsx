import React, { useEffect, useState } from 'react';
import { X, Star, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Term {
  term_id: number;
  spanish_text: string;
  english_text: string;
  part_of_speech: string;
  status: 'new' | 'seen' | 'learning' | 'reinforced' | 'mastered';
}

interface Conjugation {
  pronoun: string;
  form: string;
}

interface TenseData {
  tense_id: number;
  name: string;
  english_name: string;
  description: string;
  conjugations: Conjugation[];
}

interface GrammarHint {
  hint_id: number;
  hint_text: string;
  hint_type: string;
  verb?: { infinitive: string; english: string; tenses: TenseData[] };
}

interface SubunitDetailModalProps {
  subunitId: number;
  subunitCode: string;
  title: string;
  goalText: string;
  userId: string;
  onClose: () => void;
  onStartLesson: () => void;
}

function MasteryIcon({ status }: { status: string }) {
  if (status === 'mastered') {
    return (
      <div className="flex items-end gap-[2px] h-[18px]">
        <div className="w-[4px] h-[6px] rounded-[1px] bg-[#F97316]" />
        <div className="w-[4px] h-[12px] rounded-[1px] bg-[#F97316]" />
        <div className="w-[4px] h-[18px] rounded-[1px] bg-[#F97316]" />
      </div>
    );
  }
  if (status === 'reinforced') {
    return (
      <div className="flex items-end gap-[2px] h-[18px]">
        <div className="w-[4px] h-[6px] rounded-[1px] bg-[#F97316]" />
        <div className="w-[4px] h-[12px] rounded-[1px] bg-[#F97316]" />
        <div className="w-[4px] h-[18px] rounded-[1px] bg-[#E5E7EB]" />
      </div>
    );
  }
  if (status === 'learning') {
    return (
      <div className="flex items-end gap-[2px] h-[18px]">
        <div className="w-[4px] h-[6px] rounded-[1px] bg-[#F97316]" />
        <div className="w-[4px] h-[12px] rounded-[1px] bg-[#E5E7EB]" />
        <div className="w-[4px] h-[18px] rounded-[1px] bg-[#E5E7EB]" />
      </div>
    );
  }
  if (status === 'seen') {
    return <Eye className="w-[18px] h-[18px] text-[#9CA3AF]" />;
  }
  return <EyeOff className="w-[18px] h-[18px] text-[#D1D5DB]" />;
}

function ConjugationTable({ verb }: { verb: GrammarHint['verb'] }) {
  const [selectedTense, setSelectedTense] = useState(0);
  const [hoveredTense, setHoveredTense] = useState<number | null>(null);

  if (!verb || !verb.tenses.length) return null;

  const currentTense = verb.tenses[selectedTense];

  return (
    <div className="mt-2 bg-[#FFF8F0] rounded-[10px] p-3">
      <p className="font-inter font-bold text-[13px] text-[#372213] mb-2">
        {verb.infinitive} — {verb.english}
      </p>

      {/* Tense tabs */}
      <div className="flex flex-wrap gap-1 mb-2">
        {verb.tenses.map((tense, i) => (
          <div key={tense.tense_id} className="relative">
            <button
              onClick={() => setSelectedTense(i)}
              onMouseEnter={() => setHoveredTense(i)}
              onMouseLeave={() => setHoveredTense(null)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-inter font-medium transition-colors ${
                selectedTense === i
                  ? 'bg-[#F97316] text-white'
                  : 'bg-white text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {tense.english_name}
            </button>
            {/* Hover tooltip */}
            {hoveredTense === i && tense.description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-[#372213] text-white text-[11px] leading-[14px] rounded-lg shadow-lg z-10 font-inter">
                {tense.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#372213] rotate-45 -mt-1" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Conjugation grid */}
      {currentTense && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {currentTense.conjugations.map((c, i) => (
            <div key={i} className="flex justify-between text-[12px] font-inter py-0.5">
              <span className="text-[#9CA3AF]">{c.pronoun}</span>
              <span className="text-[#372213] font-medium">{c.form}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubunitDetailModal({
  subunitId,
  subunitCode,
  title,
  goalText,
  userId,
  onClose,
  onStartLesson,
}: SubunitDetailModalProps) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [grammarHints, setGrammarHints] = useState<GrammarHint[]>([]);
  const [showGrammar, setShowGrammar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubunitData() {
      // Fetch terms linked to this subunit
      const { data: subunitTerms } = await supabase
        .from('subunit_terms')
        .select('term_id, sort_order, terms ( term_id, spanish_text, english_text, part_of_speech )')
        .eq('subunit_id', subunitId)
        .order('sort_order');

      // Fetch user progress for these terms
      let progressMap: Record<number, string> = {};
      if (userId && subunitTerms?.length) {
        const termIds = subunitTerms.map((st: any) => st.term_id);
        const { data: progress } = await supabase
          .from('user_term_progress')
          .select('term_id, status')
          .eq('user_id', userId)
          .in('term_id', termIds);

        if (progress) {
          progress.forEach((p: any) => {
            progressMap[p.term_id] = p.status;
          });
        }
      }

      const termsList: Term[] = (subunitTerms || []).map((st: any) => {
        const t = st.terms;
        return {
          term_id: t.term_id,
          spanish_text: t.spanish_text,
          english_text: t.english_text,
          part_of_speech: t.part_of_speech,
          status: (progressMap[t.term_id] || 'new') as Term['status'],
        };
      });

      setTerms(termsList);

      // Fetch grammar hints linked to these terms
      if (termsList.length) {
        const termIds = termsList.map(t => t.term_id);
        const { data: hintLinks } = await supabase
          .from('term_grammar_hints')
          .select('grammar_hints ( hint_id, hint_text, hint_type )')
          .in('term_id', termIds);

        if (hintLinks?.length) {
          const seen = new Set<number>();
          const hints: GrammarHint[] = [];

          for (const h of hintLinks) {
            const hint = (h as any).grammar_hints;
            if (!hint || seen.has(hint.hint_id)) continue;
            seen.add(hint.hint_id);

            const hintData: GrammarHint = { ...hint };

            // Check if this hint is linked to a verb
            if (hint.hint_type === 'conjugation') {
              const { data: verbLinks } = await supabase
                .from('grammar_hint_verb_links')
                .select('verbs ( verb_id, infinitive, english )')
                .eq('hint_id', hint.hint_id);

              if (verbLinks?.length) {
                const verb = (verbLinks[0] as any).verbs;
                // Fetch all conjugations for this verb
                const { data: conjugations } = await supabase
                  .from('verb_conjugations')
                  .select('conjugated, tenses ( tense_id, name, english_name, description, sort_order ), pronouns ( spanish, sort_order )')
                  .eq('verb_id', verb.verb_id)
                  .order('tense_id');

                if (conjugations?.length) {
                  // Group by tense
                  const tenseMap = new Map<number, TenseData>();
                  for (const c of conjugations) {
                    const t = (c as any).tenses;
                    const p = (c as any).pronouns;
                    if (!tenseMap.has(t.tense_id)) {
                      tenseMap.set(t.tense_id, {
                        tense_id: t.tense_id,
                        name: t.name,
                        english_name: t.english_name,
                        description: t.description || '',
                        conjugations: [],
                      });
                    }
                    tenseMap.get(t.tense_id)!.conjugations.push({
                      pronoun: p.spanish,
                      form: c.conjugated,
                    });
                  }

                  // Sort tenses by sort_order, sort conjugations by pronoun sort_order
                  const tenses = Array.from(tenseMap.values());
                  tenses.sort((a, b) => {
                    const aConj = conjugations.find((c: any) => (c as any).tenses.tense_id === a.tense_id);
                    const bConj = conjugations.find((c: any) => (c as any).tenses.tense_id === b.tense_id);
                    return ((aConj as any)?.tenses?.sort_order || 0) - ((bConj as any)?.tenses?.sort_order || 0);
                  });

                  for (const tense of tenses) {
                    tense.conjugations.sort((a, b) => {
                      const aP = conjugations.find((c: any) => (c as any).pronouns.spanish === a.pronoun);
                      const bP = conjugations.find((c: any) => (c as any).pronouns.spanish === b.pronoun);
                      return ((aP as any)?.pronouns?.sort_order || 0) - ((bP as any)?.pronouns?.sort_order || 0);
                    });
                  }

                  hintData.verb = {
                    infinitive: verb.infinitive,
                    english: verb.english,
                    tenses,
                  };
                }
              }
            }

            hints.push(hintData);
          }

          setGrammarHints(hints);
        }
      }

      setLoading(false);
    }

    fetchSubunitData();
  }, [subunitId, userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="relative w-[90%] max-w-[420px] max-h-[80vh] flex flex-col rounded-[20px] shadow-xl"
        style={{ background: 'linear-gradient(to bottom, #FFF8E1, #FFFDF5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-5 h-5 text-[#6B7280]" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-start justify-between pr-8">
              <h2 className="font-inter font-bold text-[18px] leading-[24px] text-[#372213]">
                {subunitCode} {title}
              </h2>
              <button
                onClick={() => setShowGrammar(!showGrammar)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-semibold transition-colors whitespace-nowrap ${
                  showGrammar
                    ? 'border-[#F97316] bg-[#F97316] text-white'
                    : 'border-[#372213] text-[#372213] hover:bg-[#372213]/5'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showGrammar ? 'fill-white text-white' : 'fill-[#F97316] text-[#F97316]'}`} />
                Grammar
              </button>
            </div>
            {goalText && (
              <p className="font-inter italic text-[13px] leading-[20px] text-[#6B7280] mt-2">
                Goal: {goalText}
              </p>
            )}
          </div>

          {/* Grammar Hints Section */}
          {showGrammar && (
            <div className="mx-5 mb-3 p-3 bg-white/80 rounded-[12px] border border-[#F97316]/20">
              <h3 className="font-inter font-bold text-[14px] text-[#372213] mb-2">Grammar Hints</h3>
              {grammarHints.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {grammarHints.map((hint) => (
                    <li key={hint.hint_id}>
                      <p className="font-inter text-[13px] text-[#4B5563] leading-[18px]">
                        {hint.hint_text}
                      </p>
                      {hint.verb && <ConjugationTable verb={hint.verb} />}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-inter text-[13px] text-[#9CA3AF]">No grammar hints yet for this subunit.</p>
              )}
            </div>
          )}

          {/* Words & Phrases */}
          <div className="mx-5 mb-4 bg-white rounded-[16px] p-4">
            <h3 className="font-inter font-bold text-[15px] text-[#372213] mb-3">Words & Phrases</h3>

            {loading ? (
              <p className="font-inter text-[13px] text-[#9CA3AF] text-center py-4">Loading terms...</p>
            ) : terms.length === 0 ? (
              <p className="font-inter text-[13px] text-[#9CA3AF] text-center py-4">No terms found.</p>
            ) : (
              <ul className="flex flex-col">
                {terms.map((term, i) => (
                  <li
                    key={term.term_id}
                    className={`flex items-center justify-between py-3 px-1 ${
                      i < terms.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                    }`}
                  >
                    <div className="flex flex-col min-w-0 mr-3">
                      <span className="font-inter font-medium text-[14px] text-[#372213] truncate">
                        {term.spanish_text}
                      </span>
                      <span className="font-inter text-[12px] text-[#9CA3AF] truncate">
                        {term.english_text}
                      </span>
                    </div>
                    <MasteryIcon status={term.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Start Lesson Button */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={onStartLesson}
            className="w-full py-3 rounded-[12px] bg-[#E8501E] hover:bg-[#D4461A] active:bg-[#C03F17] text-white font-inter font-bold text-[15px] transition-colors shadow-md"
          >
            Start Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

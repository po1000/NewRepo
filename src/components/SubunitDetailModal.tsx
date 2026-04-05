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

interface GrammarHint {
  hint_id: number;
  hint_text: string;
  hint_type: string;
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
  // 'new' — not seen yet
  return <EyeOff className="w-[18px] h-[18px] text-[#D1D5DB]" />;
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

      // Combine terms with progress
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
        const { data: hints } = await supabase
          .from('term_grammar_hints')
          .select('grammar_hints ( hint_id, hint_text, hint_type )')
          .in('term_id', termIds);

        if (hints?.length) {
          const seen = new Set<number>();
          const uniqueHints: GrammarHint[] = [];
          hints.forEach((h: any) => {
            const hint = h.grammar_hints;
            if (hint && !seen.has(hint.hint_id)) {
              seen.add(hint.hint_id);
              uniqueHints.push(hint);
            }
          });
          setGrammarHints(uniqueHints);
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
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#372213] text-[12px] font-semibold text-[#372213] hover:bg-[#372213]/5 transition-colors whitespace-nowrap"
              >
                <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
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
                <ul className="flex flex-col gap-2">
                  {grammarHints.map((hint) => (
                    <li key={hint.hint_id} className="font-inter text-[13px] text-[#4B5563] leading-[18px]">
                      {hint.hint_text}
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

        {/* Start Lesson Button — fixed at bottom */}
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

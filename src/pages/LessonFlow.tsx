import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  Flag,
  Volume2,
  Star,
  Turtle,
  ThumbsUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  loadTermProgress,
  saveTermProgress,
  markSeen,
  processAnswer,
  buildSessionQueue,
  requeueTerm,
  applyDecay,
  TermProgress,
  TermStatus,
} from '../lib/srs';

interface Term {
  term_id: number;
  spanish_text: string;
  english_text: string;
  part_of_speech: string;
  image_url: string | null;
  example_sentence_es: string | null;
  example_sentence_en: string | null;
}

interface GrammarHint {
  hint_id: number;
  hint_title: string;
  hint_text: string;
  hint_type: string;
}

interface PronunciationHint {
  id: number;
  hint_text: string;
}

interface LessonFlowProps {
  onClose: () => void;
}

function speakSpanish(text: string, slow: boolean) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = slow ? 0.5 : 0.9;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es'));
  if (esVoice) utterance.voice = esVoice;
  window.speechSynthesis.speak(utterance);
}

export function LessonFlow({ onClose }: LessonFlowProps) {
  const location = useLocation();
  const { user } = useAuth();
  const state = (location.state as { subunitId?: number; subunitCode?: string; title?: string }) || {};

  const [termsMap, setTermsMap] = useState<Map<number, Term>>(new Map());
  const [queue, setQueue] = useState<number[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [progressMap, setProgressMap] = useState<Map<number, TermProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [grammarHints, setGrammarHints] = useState<GrammarHint[]>([]);
  const [pronunciationHints, setPronunciationHints] = useState<PronunciationHint[]>([]);
  const [slowAudio, setSlowAudio] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [totalTermCount, setTotalTermCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const hasInitialized = useRef(false);

  // Load terms + progress, build queue
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function init() {
      if (!state.subunitId || !user) {
        setLoading(false);
        return;
      }

      // Fetch terms for subunit
      const { data: subunitTerms } = await supabase
        .from('subunit_terms')
        .select('term_id, sort_order, terms ( term_id, spanish_text, english_text, part_of_speech, image_url, example_sentence_es, example_sentence_en )')
        .eq('subunit_id', state.subunitId)
        .order('sort_order');

      if (!subunitTerms?.length) {
        setLoading(false);
        return;
      }

      const tMap = new Map<number, Term>();
      const termIds: number[] = [];

      subunitTerms.forEach((st: any) => {
        const t = st.terms;
        tMap.set(t.term_id, {
          term_id: t.term_id,
          spanish_text: t.spanish_text,
          english_text: t.english_text,
          part_of_speech: t.part_of_speech,
          image_url: t.image_url,
          example_sentence_es: t.example_sentence_es,
          example_sentence_en: t.example_sentence_en,
        });
        termIds.push(t.term_id);
      });

      setTermsMap(tMap);
      setTotalTermCount(termIds.length);

      // Load existing progress
      const pMap = await loadTermProgress(user.id, termIds);

      // Apply memory decay to all terms on session open
      for (const [tid, tp] of pMap) {
        if (tp.status === 'reinforced' || tp.status === 'learnt') {
          const { displayStatus, strength } = applyDecay(tp.status, tp.sm2);
          if (displayStatus !== tp.status) {
            // Persist the decayed status
            tp.status = displayStatus;
            tp.sm2.strength = strength;
            await saveTermProgress(user.id, tid, displayStatus, tp.sm2);
          }
        }
      }

      setProgressMap(pMap);

      // Build session queue
      const sessionQueue = buildSessionQueue(termIds, pMap);

      // Count already completed (learnt and not overdue)
      let done = 0;
      for (const tp of pMap.values()) {
        if (tp.status === 'learnt') done++;
      }
      setCompletedCount(done);

      setQueue(sessionQueue);
      setLoading(false);
    }

    init();

    // Preload voices
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, [state.subunitId, user]);

  // Current term
  const currentTermId = queueIndex < queue.length ? queue[queueIndex] : null;
  const currentTerm = currentTermId ? termsMap.get(currentTermId) || null : null;
  const currentProgress = currentTermId ? progressMap.get(currentTermId) : undefined;

  // Fetch grammar + pronunciation hints for current term
  useEffect(() => {
    if (!currentTermId) return;

    async function fetchHints() {
      // Grammar hints
      const { data: hintLinks } = await supabase
        .from('term_grammar_hints')
        .select('grammar_hints ( hint_id, hint_title, hint_text, hint_type )')
        .eq('term_id', currentTermId);

      if (hintLinks?.length) {
        setGrammarHints(
          hintLinks.map((h: any) => h.grammar_hints).filter(Boolean)
        );
      } else {
        setGrammarHints([]);
      }

      // Pronunciation hints
      const { data: pronHints } = await supabase
        .from('term_pronunciation_hints')
        .select('id, hint_text')
        .eq('term_id', currentTermId);

      setPronunciationHints(pronHints || []);
    }

    fetchHints();
    setHintsExpanded(false);
  }, [currentTermId]);

  // Progress bar
  const progressPercent = totalTermCount > 0
    ? Math.min(((completedCount + queueIndex) / totalTermCount) * 100, 100)
    : 0;

  // ── Handlers ──────────────────────────────────────────────

  const advanceQueue = useCallback(() => {
    if (queueIndex + 1 >= queue.length) {
      onClose();
    } else {
      setQueueIndex(queueIndex + 1);
      setHintsExpanded(false);
      setShowReport(false);
      setReportText('');
      setReportSent(false);
    }
  }, [queueIndex, queue, onClose]);

  // "Got it!" / "Next" — flashcard reveal → mark seen, quality not scored yet
  const handleNext = useCallback(async () => {
    if (!currentTerm || !user) {
      onClose();
      return;
    }

    // Mark as seen if first time
    if (!currentProgress || currentProgress.status === 'not_seen') {
      await markSeen(user.id, currentTerm.term_id);

      // Update local progress map
      setProgressMap(prev => {
        const next = new Map(prev);
        const existing = next.get(currentTerm.term_id);
        if (existing) {
          existing.status = 'seen';
        } else {
          next.set(currentTerm.term_id, {
            term_id: currentTerm.term_id,
            status: 'seen',
            sm2: {
              easiness_factor: 2.5,
              interval_days: 0,
              repetitions: 0,
              next_review_date: null,
              last_quality: null,
              strength: 1.0,
              correct_in_session: 0,
              question_types_correct: [],
            },
          });
        }
        return next;
      });
    }

    // For flashcard step: score q=4 (successful but no interactive test)
    const tp = progressMap.get(currentTerm.term_id);
    if (tp && user) {
      const result = processAnswer(tp.status === 'not_seen' ? 'seen' : tp.status, tp.sm2, 4, 'flashcard', false);
      tp.status = result.newStatus;
      tp.sm2 = result.sm2;

      await saveTermProgress(user.id, currentTerm.term_id, result.newStatus, result.sm2);

      if (result.requeue) {
        setQueue(prev => requeueTerm(prev, queueIndex, currentTerm.term_id));
      }

      setProgressMap(prev => {
        const next = new Map(prev);
        next.set(currentTerm.term_id, { ...tp });
        return next;
      });
    }

    advanceQueue();
  }, [currentTerm, currentProgress, user, progressMap, queueIndex, advanceQueue, onClose]);

  // Thumbs up → mark as known (q=5, jump to learnt)
  const handleKnown = useCallback(async () => {
    if (!currentTerm || !user) return;

    const tp = progressMap.get(currentTerm.term_id) || {
      term_id: currentTerm.term_id,
      status: 'not_seen' as TermStatus,
      sm2: { easiness_factor: 2.5, interval_days: 0, repetitions: 0, next_review_date: null, last_quality: null, strength: 1.0, correct_in_session: 0, question_types_correct: [] },
    };

    const result = processAnswer(tp.status, tp.sm2, 5, 'flashcard', true);

    await saveTermProgress(user.id, currentTerm.term_id, result.newStatus, result.sm2);

    setProgressMap(prev => {
      const next = new Map(prev);
      next.set(currentTerm.term_id, { term_id: currentTerm.term_id, status: result.newStatus, sm2: result.sm2 });
      return next;
    });

    setCompletedCount(prev => prev + 1);
    advanceQueue();
  }, [currentTerm, user, progressMap, advanceQueue]);

  const handlePlayAudio = useCallback(() => {
    if (currentTerm) speakSpanish(currentTerm.spanish_text, slowAudio);
  }, [currentTerm, slowAudio]);

  const handleReport = useCallback(async () => {
    if (!reportText.trim() || !user || !currentTerm) return;
    await supabase.from('issue_reports').insert({
      user_id: user.id,
      term_id: currentTerm.term_id,
      subunit_id: state.subunitId,
      issue_text: reportText.trim(),
    });
    setReportSent(true);
    setTimeout(() => {
      setShowReport(false);
      setReportText('');
      setReportSent(false);
    }, 1500);
  }, [reportText, user, currentTerm, state.subunitId]);

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        <p className="text-[#FFFDE6] text-lg">Loading lesson...</p>
      </div>
    );
  }

  if (!currentTerm) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        <div className="text-center">
          <p className="text-[#FFFDE6] text-xl font-bold mb-4">Lesson Complete!</p>
          <button onClick={onClose}
            className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[15px]">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isFirstSeen = !currentProgress || currentProgress.status === 'not_seen';

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-inter"
      style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>

      <div className="w-full max-w-[684px] min-h-[688px] relative flex flex-col p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-[#FFFDE6]" />
          </button>
          <div className="flex-1 mx-8 h-3 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-[#FFFDE6] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }} />
          </div>
          <button onClick={() => setShowReport(!showReport)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Flag className="w-6 h-6 text-[#FFFDE6]" />
          </button>
        </div>

        {/* Report Popup */}
        {showReport && (
          <div className="absolute top-20 right-8 w-[280px] bg-[#FFFDE6] rounded-xl p-4 shadow-xl z-50">
            <h3 className="font-bold text-[14px] text-[#372213] mb-2">Report an Issue</h3>
            {reportSent ? (
              <p className="text-[13px] text-[#3BBC00] font-medium">Thanks! Report sent.</p>
            ) : (
              <>
                <textarea value={reportText} onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-[#D5C4A5] text-[13px] text-[#372213] placeholder:text-[#C8B89B] focus:outline-none focus:border-[#FF4D01] resize-none" />
                <button onClick={handleReport} disabled={!reportText.trim()}
                  className="mt-2 w-full py-2 rounded-lg bg-[#FF4D01] text-white font-bold text-[13px] disabled:opacity-50">
                  Submit
                </button>
              </>
            )}
          </div>
        )}

        {/* Flashcard Content */}
        <div className="flex-1 flex flex-col items-center">
          <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
            <span className="font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
              Flashcard
            </span>
          </div>

          <div className="w-full max-w-[422px] bg-[#FFFDE6] rounded-2xl p-8 flex flex-col items-center relative shadow-lg mb-8">
            {currentTerm.image_url ? (
              <img src={currentTerm.image_url} alt={currentTerm.english_text}
                className="w-[235px] h-[157px] object-cover rounded-lg mb-12" />
            ) : (
              <div className="w-[235px] h-[157px] rounded-lg mb-12 bg-gradient-to-br from-[#FFE484] to-[#FFCA28] flex items-center justify-center">
                <span className="text-[40px]">📖</span>
              </div>
            )}

            <button onClick={handlePlayAudio}
              className="absolute top-[180px] w-16 h-16 bg-white border-4 border-[#FF4D01] rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
              <Volume2 className="w-8 h-8 text-[#FF4D01]" />
            </button>

            <h2 className="font-bold text-[24px] leading-[48px] text-black mb-1">
              {currentTerm.spanish_text}
            </h2>
            <span className="font-medium text-[20px] leading-[20px] text-[#FF4D01]">
              {currentTerm.english_text}
            </span>

            {/* Thumbs up */}
            <button onClick={handleKnown} title="I already know this word"
              className="absolute bottom-0 left-0 w-12 h-10 rounded-tr-2xl rounded-bl-2xl flex items-center justify-center transition-colors bg-[#FF4D01] hover:bg-[#3BBC00]">
              <ThumbsUp className="w-5 h-5 text-[#FFFDE6]" />
            </button>

            {/* Turtle */}
            <button onClick={() => setSlowAudio(!slowAudio)} title={slowAudio ? 'Normal speed' : 'Slow audio'}
              className={`absolute bottom-0 right-0 w-12 h-10 rounded-tl-2xl rounded-br-2xl flex items-center justify-center transition-colors ${
                slowAudio ? 'bg-[#3BBC00]' : 'bg-[#FF4D01]'
              }`}>
              <Turtle className="w-5 h-5 text-[#FFFDE6]" />
            </button>
          </div>

          {/* Example Sentence */}
          {(currentTerm.example_sentence_es || currentTerm.example_sentence_en) && (
            <div className="text-center mb-4">
              {currentTerm.example_sentence_es && (
                <p className="font-medium italic text-[16.3px] leading-[28px] text-[#FFFDE6] mb-1">
                  " {currentTerm.example_sentence_es} "
                </p>
              )}
              {currentTerm.example_sentence_en && (
                <p className="italic text-[14.6px] leading-[24px] text-[#FFFDE6]">
                  {currentTerm.example_sentence_en}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Inline Hints (grammar + pronunciation) — only on flashcards */}
        {(grammarHints.length > 0 || pronunciationHints.length > 0) && (
          <div className="w-full max-w-[422px] mx-auto mb-4">
            <button
              onClick={() => setHintsExpanded(!hintsExpanded)}
              className="flex items-center gap-2 text-[#FFFDE6] font-semibold text-[13px] hover:text-white transition-colors"
            >
              <Star className="w-4 h-4 fill-[#FFFDE6]" />
              {hintsExpanded ? 'Hide Hints' : 'Show Hints'}
              <span className="text-[11px] opacity-70">
                ({grammarHints.length + pronunciationHints.length})
              </span>
            </button>

            {hintsExpanded && (
              <div className="mt-2 bg-[#FFFDE6] rounded-xl p-4 shadow-lg">
                {grammarHints.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {grammarHints.map((hint) => (
                      <div key={hint.hint_id}>
                        <p className="font-bold text-[13px] text-[#F97316] mb-0.5">{hint.hint_title}</p>
                        <p className="text-[13px] leading-[18px] text-[#372213]">{hint.hint_text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {pronunciationHints.length > 0 && (
                  <div className={`flex flex-col gap-2 ${grammarHints.length > 0 ? 'mt-3 pt-3 border-t border-[#E5E0D5]' : ''}`}>
                    <p className="font-bold text-[13px] text-[#8B5CF6]">Pronunciation</p>
                    {pronunciationHints.map((hint) => (
                      <p key={hint.id} className="text-[13px] leading-[18px] text-[#372213]">
                        {hint.hint_text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end mt-4 w-full max-w-[448px] mx-auto">
          <button onClick={handleNext}
            className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg">
            {isFirstSeen ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

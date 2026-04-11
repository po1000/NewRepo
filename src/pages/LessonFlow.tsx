import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  Flag,
  Volume2,
  Star,
  Turtle,
  ThumbsUp,
  Check,
  XCircle,
  Zap,
  Trophy,
  Flame,
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
  multiChoiceQuality,
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

type LessonMode = 'flashcard' | 'multi_choice';

interface LessonFlowProps {
  onClose: () => void;
}

function speakSpanish(text: string, slow: boolean) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = slow ? 0.5 : 0.92;
  utterance.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const preferred = ['Google español', 'Paulina', 'Monica', 'Jorge', 'Lucia', 'Microsoft Helena', 'Microsoft Sabina'];
  let best = voices.find(v => preferred.some(p => v.name.includes(p)) && v.lang.startsWith('es'));
  if (!best) best = voices.find(v => v.lang === 'es-ES');
  if (!best) best = voices.find(v => v.lang.startsWith('es'));
  if (best) utterance.voice = best;
  window.speechSynthesis.speak(utterance);
}

// XP constants
const XP_CORRECT_ANSWER = 10;
const XP_FLASHCARD_SEEN = 2;

// Shuffle array helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Session state persistence key
function sessionKey(subunitId: number, userId: string) {
  return `lesson_session_${userId}_${subunitId}`;
}

interface SavedSession {
  queueIndex: number;
  queue: number[];
  newFlashcardCount: number;
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
  const [slowAudio, setSlowAudio] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [totalTermCount, setTotalTermCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Question mode state
  const [mode, setMode] = useState<LessonMode>('flashcard');
  const [newFlashcardCount, setNewFlashcardCount] = useState(0);
  const [mcOptions, setMcOptions] = useState<{ termId: number; text: string }[]>([]);
  const [mcCorrectId, setMcCorrectId] = useState<number | null>(null);
  const [mcSelectedId, setMcSelectedId] = useState<number | null>(null);
  const [mcAnswered, setMcAnswered] = useState(false);
  const [mcDirection, setMcDirection] = useState<'es_to_en' | 'en_to_es'>('es_to_en');

  // XP & lesson completion state
  const [sessionXp, setSessionXp] = useState(0);
  const [xpPopup, setXpPopup] = useState<{ amount: number; key: number } | null>(null);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [termsSeenThisSession, setTermsSeenThisSession] = useState(0);
  const [correctAnswersThisSession, setCorrectAnswersThisSession] = useState(0);
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [newStreak, setNewStreak] = useState(0);

  const hasInitialized = useRef(false);
  const lessonCompletionHandled = useRef(false);

  // Load terms + progress, build queue (resume if possible)
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

      // Apply memory decay
      for (const [tid, tp] of pMap) {
        if (tp.status === 'reinforced' || tp.status === 'learnt') {
          const { displayStatus, strength } = applyDecay(tp.status, tp.sm2);
          if (displayStatus !== tp.status) {
            tp.status = displayStatus;
            tp.sm2.strength = strength;
            await saveTermProgress(user.id, tid, displayStatus, tp.sm2);
          }
        }
      }

      setProgressMap(pMap);

      // Try to restore saved session
      const savedRaw = localStorage.getItem(sessionKey(state.subunitId, user.id));
      let restored = false;

      if (savedRaw) {
        try {
          const saved: SavedSession = JSON.parse(savedRaw);
          // Validate saved queue still has valid term IDs
          const validQueue = saved.queue.filter(id => tMap.has(id));
          if (validQueue.length > 0 && saved.queueIndex < validQueue.length) {
            setQueue(validQueue);
            setQueueIndex(saved.queueIndex);
            setNewFlashcardCount(saved.newFlashcardCount || 0);
            restored = true;
          }
        } catch {
          // Invalid saved data, start fresh
        }
      }

      if (!restored) {
        const sessionQueue = buildSessionQueue(termIds, pMap);
        setQueue(sessionQueue);
      }

      // Count already completed
      let done = 0;
      for (const tp of pMap.values()) {
        if (tp.status === 'learnt') done++;
      }
      setCompletedCount(done);

      setLoading(false);
    }

    init();

    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, [state.subunitId, user]);

  // Save session state whenever queue position changes
  useEffect(() => {
    if (!state.subunitId || !user || loading || queue.length === 0) return;
    const data: SavedSession = { queueIndex, queue, newFlashcardCount };
    localStorage.setItem(sessionKey(state.subunitId, user.id), JSON.stringify(data));
  }, [queueIndex, queue, newFlashcardCount, state.subunitId, user, loading]);

  // Current term
  const currentTermId = queueIndex < queue.length ? queue[queueIndex] : null;
  const currentTerm = currentTermId ? termsMap.get(currentTermId) || null : null;
  const currentProgress = currentTermId ? progressMap.get(currentTermId) : undefined;

  // Fetch grammar hints for current term
  useEffect(() => {
    if (!currentTermId) return;

    async function fetchHints() {
      const { data: hintLinks } = await supabase
        .from('term_grammar_hints')
        .select('grammar_hints ( hint_id, hint_title, hint_text, hint_type )')
        .eq('term_id', currentTermId);

      if (hintLinks?.length) {
        setGrammarHints(hintLinks.map((h: any) => h.grammar_hints).filter(Boolean));
      } else {
        setGrammarHints([]);
      }
    }

    fetchHints();
    setHintsExpanded(false);
  }, [currentTermId]);

  // Gather all seen/learning terms for MC distractors
  const seenTermIds = useMemo(() => {
    const ids: number[] = [];
    for (const [tid, tp] of progressMap) {
      if (tp.status !== 'not_seen') ids.push(tid);
    }
    return ids;
  }, [progressMap]);

  // Progress bar
  const progressPercent = totalTermCount > 0
    ? Math.min(((completedCount + queueIndex) / totalTermCount) * 100, 100)
    : 0;

  // ── Setup multiple choice question ──────────────────────────

  const setupMultiChoice = useCallback((targetTermId: number) => {
    const targetTerm = termsMap.get(targetTermId);
    if (!targetTerm) return;

    // Pick direction randomly
    const dir = Math.random() < 0.5 ? 'es_to_en' : 'en_to_es';
    setMcDirection(dir);

    // Get distractor pool (all terms in this subunit)
    const pool = Array.from(termsMap.keys()).filter(id => id !== targetTermId);
    const distractorIds = shuffle(pool).slice(0, 3);

    // Build options
    const options = [targetTermId, ...distractorIds].map(id => {
      const t = termsMap.get(id)!;
      return {
        termId: id,
        text: dir === 'es_to_en' ? t.english_text : t.spanish_text,
      };
    });

    setMcOptions(shuffle(options));
    setMcCorrectId(targetTermId);
    setMcSelectedId(null);
    setMcAnswered(false);
    setMode('multi_choice');
  }, [termsMap, seenTermIds]);

  // ── Handlers ──────────────────────────────────────────────

  const advanceQueue = useCallback(() => {
    if (queueIndex + 1 >= queue.length) {
      // Lesson is done — show end screen instead of closing immediately
      if (state.subunitId && user) {
        localStorage.removeItem(sessionKey(state.subunitId, user.id));
      }
      setLessonComplete(true);
      return;
    }

    const nextIndex = queueIndex + 1;
    setQueueIndex(nextIndex);
    setHintsExpanded(false);
    setShowReport(false);
    setReportText('');
    setReportSent(false);

    // After every 2 new flashcards seen, trigger a quiz on a random SEEN term
    if (newFlashcardCount >= 2 && seenTermIds.length >= 2) {
      // Pick a random seen term to quiz (not necessarily the next in queue)
      const quizCandidates = seenTermIds.filter(id => {
        const tp = progressMap.get(id);
        return tp && tp.status !== 'not_seen';
      });
      if (quizCandidates.length > 0) {
        const randomId = quizCandidates[Math.floor(Math.random() * quizCandidates.length)];
        setupMultiChoice(randomId);
        setNewFlashcardCount(0);
        return;
      }
    }

    setMode('flashcard');
  }, [queueIndex, queue, state.subunitId, user, progressMap, newFlashcardCount, seenTermIds, setupMultiChoice]);

  // "Got it!" / "Next" — flashcard handler
  // First encounter: only mark as seen (no processAnswer — don't advance status yet)
  // Already seen: score q=4 as flashcard review
  const handleNext = useCallback(async () => {
    if (!currentTerm || !user) {
      onClose();
      return;
    }

    const isNew = !currentProgress || currentProgress.status === 'not_seen';

    if (isNew) {
      // First time seeing this term — only mark as seen, do NOT score
      await markSeen(user.id, currentTerm.term_id);
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
              easiness_factor: 2.5, interval_days: 0, repetitions: 0,
              next_review_date: null, last_quality: null, strength: 1.0,
              correct_in_session: 0, question_types_correct: [],
            },
          });
        }
        return next;
      });
      setNewFlashcardCount(prev => prev + 1);
      setTermsSeenThisSession(prev => prev + 1);
      // Small XP for seeing a new term
      setSessionXp(prev => prev + XP_FLASHCARD_SEEN);
      setXpPopup({ amount: XP_FLASHCARD_SEEN, key: Date.now() });
    } else {
      // Already-seen term — score as flashcard review (q=4)
      const tp = progressMap.get(currentTerm.term_id);
      if (tp) {
        const result = processAnswer(tp.status, tp.sm2, 4, 'flashcard', false);
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
    }

    advanceQueue();
  }, [currentTerm, currentProgress, user, progressMap, queueIndex, advanceQueue, onClose]);

  // Thumbs up → mark as known
  const handleKnown = useCallback(async () => {
    if (!currentTerm || !user) return;

    const tp = progressMap.get(currentTerm.term_id) || {
      term_id: currentTerm.term_id,
      status: 'not_seen' as TermStatus,
      sm2: {
        easiness_factor: 2.5, interval_days: 0, repetitions: 0,
        next_review_date: null, last_quality: null, strength: 1.0,
        correct_in_session: 0, question_types_correct: [],
      },
    };

    const result = processAnswer(tp.status, tp.sm2, 5, 'flashcard', true);
    await saveTermProgress(user.id, currentTerm.term_id, result.newStatus, result.sm2);

    setProgressMap(prev => {
      const next = new Map(prev);
      next.set(currentTerm.term_id, { term_id: currentTerm.term_id, status: result.newStatus, sm2: result.sm2 });
      return next;
    });

    setCompletedCount(prev => prev + 1);
    // Award XP for marking as known
    setSessionXp(prev => prev + XP_CORRECT_ANSWER);
    setXpPopup({ amount: XP_CORRECT_ANSWER, key: Date.now() });
    setCorrectAnswersThisSession(prev => prev + 1);
    advanceQueue();
  }, [currentTerm, user, progressMap, advanceQueue]);

  // Multiple choice answer — quiz the term that mcCorrectId points to
  const handleMcSelect = useCallback(async (selectedTermId: number) => {
    if (mcAnswered || !mcCorrectId || !user) return;

    setMcSelectedId(selectedTermId);
    setMcAnswered(true);

    const correct = selectedTermId === mcCorrectId;
    const q = multiChoiceQuality(correct, false);

    // Process answer for the QUIZZED term (mcCorrectId), not necessarily currentTerm
    const quizzedTermId = mcCorrectId;
    const tp = progressMap.get(quizzedTermId);
    if (tp) {
      const result = processAnswer(tp.status, tp.sm2, q, 'multi_choice', false);
      tp.status = result.newStatus;
      tp.sm2 = result.sm2;

      await saveTermProgress(user.id, quizzedTermId, result.newStatus, result.sm2);

      if (result.requeue) {
        setQueue(prev => requeueTerm(prev, queueIndex, quizzedTermId));
      }

      setProgressMap(prev => {
        const next = new Map(prev);
        next.set(quizzedTermId, { ...tp });
        return next;
      });
    }

    // Award XP on correct answer
    if (correct) {
      setSessionXp(prev => prev + XP_CORRECT_ANSWER);
      setXpPopup({ amount: XP_CORRECT_ANSWER, key: Date.now() });
      setCorrectAnswersThisSession(prev => prev + 1);
    }
  }, [mcAnswered, mcCorrectId, user, progressMap, queueIndex]);

  const handleMcContinue = useCallback(() => {
    advanceQueue();
  }, [advanceQueue]);

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

  // Handle lesson completion: update XP, streak, lessons_completed in DB
  useEffect(() => {
    if (!lessonComplete || lessonCompletionHandled.current || !user) return;
    lessonCompletionHandled.current = true;

    async function completeLesson() {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('total_xp, lessons_completed, current_streak, longest_streak, updated_at')
        .eq('user_id', user!.id)
        .single();

      const currentXp = stats?.total_xp || 0;
      const currentLessons = stats?.lessons_completed || 0;
      const currentStreak = stats?.current_streak || 0;
      const longestStreak = stats?.longest_streak || 0;

      const lastUpdate = stats?.updated_at ? new Date(stats.updated_at) : null;
      const today = new Date();
      const isNewDay = !lastUpdate ||
        lastUpdate.toDateString() !== today.toDateString();

      let updatedStreak = currentStreak;
      if (isNewDay) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = lastUpdate &&
          lastUpdate.toDateString() === yesterday.toDateString();
        updatedStreak = isConsecutive ? currentStreak + 1 : 1;
        setStreakUpdated(true);
      }
      setNewStreak(updatedStreak);

      const newLongest = Math.max(longestStreak, updatedStreak);

      await supabase
        .from('user_stats')
        .upsert({
          user_id: user!.id,
          total_xp: currentXp + sessionXp,
          lessons_completed: currentLessons + 1,
          current_streak: updatedStreak,
          longest_streak: newLongest,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (sessionXp > 0) {
        await supabase.from('xp_events').insert({
          user_id: user!.id,
          xp_amount: sessionXp,
          source_type: 'lesson',
          source_id: state.subunitId || null,
        });
      }
    }

    completeLesson();
  }, [lessonComplete, user, sessionXp, state.subunitId]);

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        <p className="text-[#FFFDE6] text-lg">Loading lesson...</p>
      </div>
    );
  }

  // End of lesson screen
  if (lessonComplete || !currentTerm) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        <div className="w-full max-w-[420px] mx-4">
          {/* Trophy */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#FFFDE6] rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="w-12 h-12 text-[#FF4D01]" />
            </div>
          </div>

          <h1 className="text-[#FFFDE6] text-[28px] font-bold text-center mb-2">
            Lesson Complete!
          </h1>
          <p className="text-[#FFFDE6]/80 text-[15px] text-center mb-8">
            {state.title || 'Great work!'}
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* XP Earned */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
              <Zap className="w-7 h-7 text-[#FFE101] mb-1" />
              <span className="text-[#FFFDE6] text-[24px] font-bold">{sessionXp}</span>
              <span className="text-[#FFFDE6]/70 text-[12px]">XP Earned</span>
            </div>
            {/* Terms Seen */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
              <Star className="w-7 h-7 text-[#FFE101] mb-1" />
              <span className="text-[#FFFDE6] text-[24px] font-bold">{termsSeenThisSession}</span>
              <span className="text-[#FFFDE6]/70 text-[12px]">New Terms</span>
            </div>
            {/* Correct Answers */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
              <Check className="w-7 h-7 text-[#22C55E] mb-1" />
              <span className="text-[#FFFDE6] text-[24px] font-bold">{correctAnswersThisSession}</span>
              <span className="text-[#FFFDE6]/70 text-[12px]">Correct Answers</span>
            </div>
            {/* Streak */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
              <Flame className="w-7 h-7 text-[#FF4D01] mb-1" />
              <span className="text-[#FFFDE6] text-[24px] font-bold">{newStreak}</span>
              <span className="text-[#FFFDE6]/70 text-[12px]">
                {streakUpdated ? 'Day Streak!' : 'Day Streak'}
              </span>
            </div>
          </div>

          <button onClick={onClose}
            className="w-full py-4 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[16px] hover:bg-white transition-colors shadow-lg">
            Continue
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
          <button onClick={() => {
            onClose();
          }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
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

        {/* XP Popup Animation */}
        {xpPopup && (
          <div
            key={xpPopup.key}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce"
            onAnimationEnd={() => setTimeout(() => setXpPopup(null), 800)}
          >
            <div className="flex items-center gap-1 bg-[#FFFDE6] rounded-full px-4 py-2 shadow-lg"
              style={{ animation: 'xpFadeUp 1.2s ease-out forwards' }}>
              <Zap className="w-5 h-5 text-[#FF4D01]" />
              <span className="font-bold text-[16px] text-[#FF4D01]">+{xpPopup.amount} XP</span>
            </div>
          </div>
        )}

        <style>{`
          @keyframes xpFadeUp {
            0% { opacity: 1; transform: translateY(0); }
            70% { opacity: 1; transform: translateY(-30px); }
            100% { opacity: 0; transform: translateY(-50px); }
          }
        `}</style>

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

        {/* ─── FLASHCARD MODE ─── */}
        {mode === 'flashcard' && (
          <>
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

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-8 w-full max-w-[448px] mx-auto">
              {/* Grammar Hint */}
              <div className="flex-1 mr-4">
                {grammarHints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setHintsExpanded(!hintsExpanded)}
                      className="flex items-center gap-2 text-[#FFFDE6] font-semibold text-[13px] hover:text-white transition-colors"
                    >
                      <Star className="w-4 h-4 fill-[#FFFDE6]" />
                      {hintsExpanded ? 'Hide Hint' : 'Grammar Hint'}
                    </button>

                    {hintsExpanded && (
                      <div className="mt-2 bg-[#FFFDE6] rounded-xl p-4 shadow-lg max-w-[320px] max-h-[200px] overflow-y-auto">
                        <div className="flex flex-col gap-3">
                          {grammarHints.map((hint) => (
                            <div key={hint.hint_id}>
                              <p className="font-bold text-[13px] text-[#F97316] mb-0.5">{hint.hint_title}</p>
                              <p className="text-[13px] leading-[18px] text-[#372213] whitespace-pre-line">{hint.hint_text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={handleNext}
                className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg shrink-0">
                {isFirstSeen ? 'Got it!' : 'Next'}
              </button>
            </div>
          </>
        )}

        {/* ─── MULTIPLE CHOICE MODE ─── */}
        {mode === 'multi_choice' && mcCorrectId && (() => {
          const quizzedTerm = termsMap.get(mcCorrectId);
          if (!quizzedTerm) return null;
          return (
          <div className="flex-1 flex flex-col items-center">
            <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
              <span className="font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                Quiz
              </span>
            </div>

            {/* Question prompt */}
            <div className="w-full max-w-[422px] bg-[#FFFDE6] rounded-2xl p-6 flex flex-col items-center shadow-lg mb-6">
              <p className="text-[14px] text-[#6B7280] mb-2">
                {mcDirection === 'es_to_en' ? 'What does this mean?' : 'How do you say this in Spanish?'}
              </p>
              <h2 className="font-bold text-[24px] leading-[36px] text-[#372213] text-center">
                {mcDirection === 'es_to_en' ? quizzedTerm.spanish_text : quizzedTerm.english_text}
              </h2>
              {mcDirection === 'es_to_en' && (
                <button onClick={() => speakSpanish(quizzedTerm.spanish_text, slowAudio)}
                  className="mt-3 p-2 hover:bg-black/5 rounded-full transition-colors">
                  <Volume2 className="w-6 h-6 text-[#FF4D01]" />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="w-full max-w-[422px] flex flex-col gap-3 mb-8">
              {mcOptions.map((opt) => {
                let optClass = 'bg-white/90 border-2 border-white/50 hover:border-[#FF4D01] text-[#372213]';
                if (mcAnswered) {
                  if (opt.termId === mcCorrectId) {
                    optClass = 'bg-[#DCFCE7] border-2 border-[#22C55E] text-[#166534]';
                  } else if (opt.termId === mcSelectedId && opt.termId !== mcCorrectId) {
                    optClass = 'bg-[#FEE2E2] border-2 border-[#EF4444] text-[#991B1B]';
                  } else {
                    optClass = 'bg-white/50 border-2 border-white/30 text-[#9CA3AF]';
                  }
                }

                return (
                  <button
                    key={opt.termId}
                    onClick={() => handleMcSelect(opt.termId)}
                    disabled={mcAnswered}
                    className={`w-full py-4 px-6 rounded-xl font-inter font-semibold text-[16px] transition-all ${optClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.text}</span>
                      {mcAnswered && opt.termId === mcCorrectId && (
                        <Check className="w-5 h-5 text-[#22C55E]" />
                      )}
                      {mcAnswered && opt.termId === mcSelectedId && opt.termId !== mcCorrectId && (
                        <XCircle className="w-5 h-5 text-[#EF4444]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback + Continue */}
            {mcAnswered && (
              <div className="flex flex-col items-center gap-4">
                <p className={`font-bold text-[18px] ${mcSelectedId === mcCorrectId ? 'text-[#22C55E]' : 'text-[#FCA5A5]'}`}>
                  {mcSelectedId === mcCorrectId ? 'Correct!' : 'Not quite!'}
                </p>
                <button onClick={handleMcContinue}
                  className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg">
                  Continue
                </button>
              </div>
            )}
          </div>
          );
        })()}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
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
  Mic,
  Home,
  ArrowRight,
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
  listenWriteQuality,
  listenSpeakQuality,
  TermProgress,
  TermStatus,
} from '../lib/srs';
import { useLanguage } from '../context/LanguageContext';

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

type LessonMode = 'flashcard' | 'multi_choice' | 'listen_write' | 'listen_speak';

// English = royal blue, Spanish = blood orange
const ENGLISH_COLOR = '#1D4ED8';
const SPANISH_COLOR = '#DC2626';

function speakSpanish(text: string, slow: boolean) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = slow ? 0.3 : 0.92;
  utterance.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const preferred = ['Google español', 'Paulina', 'Monica', 'Jorge', 'Lucia', 'Microsoft Helena', 'Microsoft Sabina'];
  let best = voices.find(v => preferred.some(p => v.name.includes(p)) && v.lang.startsWith('es'));
  if (!best) best = voices.find(v => v.lang === 'es-ES');
  if (!best) best = voices.find(v => v.lang.startsWith('es'));
  if (best) utterance.voice = best;
  window.speechSynthesis.speak(utterance);
}

function speakEnglish(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  let best = voices.find(v => v.lang === 'en-US');
  if (!best) best = voices.find(v => v.lang.startsWith('en'));
  if (best) utterance.voice = best;
  window.speechSynthesis.speak(utterance);
}

// XP constants
const XP_MULTI_CHOICE = 5;
const XP_FREE_TYPE = 10;

// Max NEW terms to introduce before cycling quizzes
const MAX_NEW_TERMS_PER_SESSION = 3;

// Sound effects for correct/incorrect answers (Web Audio API — no external files)
function playCorrectSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    // Two-tone ascending chime
    osc.frequency.setValueAtTime(523, ctx.currentTime);       // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12); // E5
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

function playIncorrectSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    // Descending buzz
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

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

export function LessonFlow() {
  usePageTitle('Lesson');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const state = (location.state as { subunitId?: number; subunitCode?: string; title?: string; goalText?: string }) || {};

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

  // Question mode state
  const [mode, setMode] = useState<LessonMode>('flashcard');
  const [newFlashcardCount, setNewFlashcardCount] = useState(0);
  const [mcOptions, setMcOptions] = useState<{ termId: number; text: string }[]>([]);
  const [mcCorrectId, setMcCorrectId] = useState<number | null>(null);
  const [mcSelectedId, setMcSelectedId] = useState<number | null>(null);
  const [mcAnswered, setMcAnswered] = useState(false);
  const [mcDirection, setMcDirection] = useState<'es_to_en' | 'en_to_es'>('es_to_en');

  // Listen & Write state
  const [lwAnswer, setLwAnswer] = useState('');
  const [lwSubmitted, setLwSubmitted] = useState(false);
  const [lwCorrect, setLwCorrect] = useState(false);
  const [lwTargetId, setLwTargetId] = useState<number | null>(null);

  // Listen & Speak state
  const [lsRecording, setLsRecording] = useState(false);
  const [lsTranscript, setLsTranscript] = useState('');
  const [lsSubmitted, setLsSubmitted] = useState(false);
  const [lsCorrect, setLsCorrect] = useState(false);
  const [lsTargetId, setLsTargetId] = useState<number | null>(null);
  const lsRecogRef = useRef<any>(null);

  // Listen & Write direction
  const [lwDirection, setLwDirection] = useState<'hear_es_type_en' | 'hear_en_type_es'>('hear_es_type_en');

  // Waveform visualization refs
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  // Quiz counter for session cap
  const totalQuizzesRef = useRef(0);

  // XP & lesson completion state
  const [sessionXp, setSessionXp] = useState(0);
  const [xpPopup, setXpPopup] = useState<{ amount: number; key: number } | null>(null);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [termsSeenThisSession, setTermsSeenThisSession] = useState(0);
  const [correctAnswersThisSession, setCorrectAnswersThisSession] = useState(0);
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [newStreak, setNewStreak] = useState(0);
  // Track status changes for "graduated words" display on lesson complete
  const initialStatusRef = useRef<Map<number, string>>(new Map());
  const [graduatedWords, setGraduatedWords] = useState<{ term: Term; from: string; to: string }[]>([]);
  const [showCompletionDelay, setShowCompletionDelay] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([]);

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

      // Capture initial statuses for graduated-words tracking
      for (const [tid, tp] of pMap) {
        initialStatusRef.current.set(tid, tp.status);
      }
      // Also capture not_seen for terms that have no progress yet
      for (const tid of termIds) {
        if (!initialStatusRef.current.has(tid)) {
          initialStatusRef.current.set(tid, 'not_seen');
        }
      }

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
        let unseenCount = 0;
        const limitedQueue = sessionQueue.filter(tid => {
          const tp = pMap.get(tid);
          if (!tp || tp.status === 'not_seen' || tp.status === 'seen') {
            unseenCount++;
            return unseenCount <= MAX_NEW_TERMS_PER_SESSION;
          }
          return true;
        });
        setQueue(limitedQueue);
      }

      // Save last lesson info for "Continue Lesson" card on dashboard
      const vocabPreview = Array.from(tMap.values()).slice(0, 4).map(t => t.spanish_text).join(', ');
      localStorage.setItem(`last_lesson_${user.id}`, JSON.stringify({
        subunitId: state.subunitId,
        subunitCode: state.subunitCode || '',
        title: state.title || '',
        goalText: state.goalText || '',
        vocabPreview,
        timestamp: Date.now(),
      }));

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

  // Progress bar — based on queue position so it reaches 100% when lesson ends
  const progressPercent = queue.length > 0
    ? Math.min((queueIndex / queue.length) * 100, 100)
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

  // ── Setup Listen & Write (bidirectional) ──────────────────
  const setupListenWrite = useCallback((targetTermId: number) => {
    setLwTargetId(targetTermId);
    setLwAnswer('');
    setLwSubmitted(false);
    setLwCorrect(false);
    const dir = Math.random() < 0.5 ? 'hear_es_type_en' : 'hear_en_type_es';
    setLwDirection(dir);
    setMode('listen_write');
    const term = termsMap.get(targetTermId);
    if (term) {
      setTimeout(() => {
        if (dir === 'hear_es_type_en') {
          speakSpanish(term.spanish_text, false);
        } else {
          speakEnglish(term.english_text);
        }
      }, 300);
    }
  }, [termsMap]);

  // ── Setup Translate & Speak (English text → speak Spanish) ──
  const setupListenSpeak = useCallback((targetTermId: number) => {
    setLsTargetId(targetTermId);
    setLsTranscript('');
    setLsSubmitted(false);
    setLsCorrect(false);
    setLsRecording(false);
    setMode('listen_speak');
  }, []);

  // ── Handlers ──────────────────────────────────────────────

  // Helper: pick a random quiz type for a term
  const setupRandomQuiz = useCallback((termId: number) => {
    const roll = Math.random();
    if (roll < 0.5) setupMultiChoice(termId);
    else if (roll < 0.75) setupListenWrite(termId);
    else setupListenSpeak(termId);
  }, [setupMultiChoice, setupListenWrite, setupListenSpeak]);

  // Helper: finish the lesson
  const finishLesson = useCallback(() => {
    if (state.subunitId && user) {
      localStorage.removeItem(sessionKey(state.subunitId, user.id));
    }
    const STATUS_ORDER = ['not_seen', 'seen', 'learning', 'reinforced', 'learnt'];
    const graduated: { term: Term; from: string; to: string }[] = [];
    for (const [tid, tp] of progressMap) {
      const initial = initialStatusRef.current.get(tid) || 'not_seen';
      const current = tp.status;
      if (STATUS_ORDER.indexOf(current) > STATUS_ORDER.indexOf(initial)) {
        const term = termsMap.get(tid);
        if (term) graduated.push({ term, from: initial, to: current });
      }
    }
    setGraduatedWords(graduated);
    setShowCompletionDelay(true);
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: ['#FF4D01', '#FFD905', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'][Math.floor(Math.random() * 6)],
      size: 6 + Math.random() * 8,
    }));
    setTimeout(() => {
      setConfettiPieces(pieces);
      setLessonComplete(true);
      setShowCompletionDelay(false);
    }, 1500);
  }, [state.subunitId, user, progressMap, termsMap]);

  const advanceQueue = useCallback(() => {
    // 1) After every new flashcard, inject a quiz WITHOUT advancing queueIndex
    if (newFlashcardCount >= 1 && seenTermIds.length >= 1) {
      const quizCandidates = seenTermIds.filter(id => {
        const tp = progressMap.get(id);
        return tp && tp.status !== 'not_seen';
      });
      if (quizCandidates.length > 0) {
        totalQuizzesRef.current++;
        const randomId = quizCandidates[Math.floor(Math.random() * quizCandidates.length)];
        setupRandomQuiz(randomId);
        setNewFlashcardCount(0);
        return;
      }
    }

    // 2) After max new terms, force quizzes WITHOUT advancing
    if (termsSeenThisSession >= MAX_NEW_TERMS_PER_SESSION && seenTermIds.length >= 1) {
      const allReinforced = seenTermIds.every(id => {
        const tp = progressMap.get(id);
        return tp && (tp.status === 'learning' || tp.status === 'reinforced' || tp.status === 'learnt');
      });

      if (allReinforced || totalQuizzesRef.current >= 12) {
        finishLesson();
        return;
      }

      const weakFirst = seenTermIds.filter(id => {
        const tp = progressMap.get(id);
        return tp && tp.status === 'seen';
      });
      const candidates = weakFirst.length > 0 ? weakFirst : seenTermIds;
      totalQuizzesRef.current++;
      const randomId = candidates[Math.floor(Math.random() * candidates.length)];
      setupRandomQuiz(randomId);
      return;
    }

    // 3) End-of-queue check
    if (queueIndex + 1 >= queue.length) {
      finishLesson();
      return;
    }

    // 4) Normal advance to next flashcard
    const nextIndex = queueIndex + 1;
    setQueueIndex(nextIndex);
    setHintsExpanded(false);
    setShowReport(false);
    setReportText('');
    setReportSent(false);
    setMode('flashcard');
  }, [queueIndex, queue, progressMap, newFlashcardCount, seenTermIds, setupRandomQuiz, termsSeenThisSession, finishLesson]);

  // "Got it!" / "Next" — flashcard handler
  // First encounter: only mark as seen (no processAnswer — don't advance status yet)
  // Already seen: score q=4 as flashcard review
  const handleNext = useCallback(async () => {
    if (!currentTerm || !user) {
      navigate('/dashboard');
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
  }, [currentTerm, currentProgress, user, progressMap, queueIndex, advanceQueue]);

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

    if (correct) {
      playCorrectSound();
      setSessionXp(prev => prev + XP_MULTI_CHOICE);
      setXpPopup({ amount: XP_MULTI_CHOICE, key: Date.now() });
      setCorrectAnswersThisSession(prev => prev + 1);
    } else {
      playIncorrectSound();
    }
  }, [mcAnswered, mcCorrectId, user, progressMap, queueIndex]);

  const handleMcContinue = useCallback(() => {
    advanceQueue();
  }, [advanceQueue]);

  // ── Listen & Write handler (bidirectional) ──────────────
  const handleLwSubmit = useCallback(async () => {
    if (lwSubmitted || !lwTargetId || !user) return;
    const term = termsMap.get(lwTargetId);
    if (!term) return;

    setLwSubmitted(true);
    const expected = lwDirection === 'hear_es_type_en' ? term.english_text : term.spanish_text;
    const q = listenWriteQuality(lwAnswer, expected, false);
    const correct = q >= 4;
    setLwCorrect(correct);

    const tp = progressMap.get(lwTargetId);
    if (tp) {
      const result = processAnswer(tp.status, tp.sm2, q, 'listen_write', false);
      tp.status = result.newStatus;
      tp.sm2 = result.sm2;
      await saveTermProgress(user.id, lwTargetId, result.newStatus, result.sm2);
      if (result.requeue) setQueue(prev => requeueTerm(prev, queueIndex, lwTargetId));
      setProgressMap(prev => { const n = new Map(prev); n.set(lwTargetId, { ...tp }); return n; });
    }

    if (correct) {
      playCorrectSound();
      setSessionXp(prev => prev + XP_FREE_TYPE);
      setXpPopup({ amount: XP_FREE_TYPE, key: Date.now() });
      setCorrectAnswersThisSession(prev => prev + 1);
    } else {
      playIncorrectSound();
    }
  }, [lwSubmitted, lwTargetId, lwAnswer, user, progressMap, queueIndex, termsMap, lwDirection]);

  // ── Translate & Speak handler ─────────────────────────
  const cleanupAudio = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const startLsRecording = useCallback(async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Use Chrome.'); return; }

    // Start media stream for waveform visualization
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch {}

    const recog = new SR();
    recog.lang = 'es-ES';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    let gotResult = false;
    recog.onresult = (e: any) => {
      gotResult = true;
      setLsTranscript(e.results[0][0].transcript);
      setLsRecording(false);
      cleanupAudio();
    };
    recog.onerror = () => { setLsRecording(false); cleanupAudio(); };
    recog.onend = () => { if (!gotResult) { setLsRecording(false); cleanupAudio(); } };
    lsRecogRef.current = recog;
    recog.start();
    setLsRecording(true);
  }, [cleanupAudio]);

  const handleLsSubmit = useCallback(async () => {
    if (lsSubmitted || !lsTargetId || !user || !lsTranscript) return;
    const term = termsMap.get(lsTargetId);
    if (!term) return;

    setLsSubmitted(true);
    const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-záéíóúñü\s]/g, '');
    const expected = norm(term.spanish_text);
    const got = norm(lsTranscript);

    // Levenshtein distance for better similarity scoring
    function levenshtein(a: string, b: string): number {
      const m = a.length, n = b.length;
      const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
          dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] !== b[j-1] ? 1 : 0));
      return dp[m][n];
    }

    const maxLen = Math.max(expected.length, got.length) || 1;
    const dist = levenshtein(expected, got);
    const similarity = Math.round((1 - dist / maxLen) * 100);
    const q = listenSpeakQuality(similarity, false);
    const correct = q >= 4;
    setLsCorrect(correct);

    const tp = progressMap.get(lsTargetId);
    if (tp) {
      const result = processAnswer(tp.status, tp.sm2, q, 'listen_speak', false);
      tp.status = result.newStatus;
      tp.sm2 = result.sm2;
      await saveTermProgress(user.id, lsTargetId, result.newStatus, result.sm2);
      if (result.requeue) setQueue(prev => requeueTerm(prev, queueIndex, lsTargetId));
      setProgressMap(prev => { const n = new Map(prev); n.set(lsTargetId, { ...tp }); return n; });
    }

    if (correct) {
      playCorrectSound();
      setSessionXp(prev => prev + XP_FREE_TYPE);
      setXpPopup({ amount: XP_FREE_TYPE, key: Date.now() });
      setCorrectAnswersThisSession(prev => prev + 1);
    } else {
      playIncorrectSound();
    }
  }, [lsSubmitted, lsTargetId, lsTranscript, user, progressMap, queueIndex, termsMap]);

  // Waveform animation: directly manipulate DOM bars at 60fps
  useEffect(() => {
    if (!lsRecording || !analyserRef.current || !waveformRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const container = waveformRef.current;
    let running = true;

    function draw() {
      if (!running || !container) return;
      analyser.getByteFrequencyData(dataArray);
      const bars = container.children;
      const step = Math.floor(dataArray.length / bars.length) || 1;
      for (let i = 0; i < bars.length; i++) {
        const value = dataArray[i * step] || 0;
        const height = Math.max(4, (value / 255) * 40);
        (bars[i] as HTMLElement).style.height = `${height}px`;
      }
      animFrameRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [lsRecording]);

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
        .maybeSingle();

      const currentXp = stats?.total_xp || 0;
      const currentLessons = stats?.lessons_completed || 0;
      const currentStreak = stats?.current_streak || 0;
      const longestStreak = stats?.longest_streak || 0;

      const lastUpdate = stats?.updated_at ? new Date(stats.updated_at) : null;
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA');
      const lastStr = lastUpdate ? lastUpdate.toLocaleDateString('en-CA') : null;
      const isNewDay = !lastStr || lastStr !== todayStr;

      let updatedStreak = currentStreak;
      if (isNewDay) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');
        const isConsecutive = lastStr === yesterdayStr;
        updatedStreak = isConsecutive ? currentStreak + 1 : 1;
        setStreakUpdated(true);
      }
      setNewStreak(updatedStreak);

      const newLongest = Math.max(longestStreak, updatedStreak);
      const newTotalXp = currentXp + sessionXp;
      const newLessonsCompleted = currentLessons + 1;

      // Save stats: try UPDATE first; if no row exists, INSERT
      const statsPayload = {
        total_xp: newTotalXp,
        lessons_completed: newLessonsCompleted,
        current_streak: updatedStreak,
        longest_streak: newLongest,
        updated_at: new Date().toISOString(),
      };

      if (stats) {
        const { error: updErr } = await supabase
          .from('user_stats')
          .update(statsPayload)
          .eq('user_id', user!.id);
        if (updErr) console.error('XP stats update error:', updErr);
      } else {
        const { error: insErr } = await supabase
          .from('user_stats')
          .insert({ user_id: user!.id, ...statsPayload });
        if (insErr) console.error('XP stats insert error:', insErr);
      }

      if (sessionXp > 0) {
        const { error: xpErr } = await supabase.from('xp_events').insert({
          user_id: user!.id,
          xp_amount: sessionXp,
          source_type: 'lesson',
          source_id: state.subunitId || null,
        });
        if (xpErr) console.error('XP event save error:', xpErr);
      }

      // Check and award badges
      const { count: correctAnswerCount } = await supabase
        .from('user_term_progress')
        .select('term_id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .in('status', ['learning', 'reinforced', 'learnt']);

      const progressLookup: Record<string, number> = {
        lessons_completed: newLessonsCompleted,
        streak_days: updatedStreak,
        correct_answers: correctAnswerCount || 0,
      };

      const { data: allBadges } = await supabase
        .from('badges')
        .select('badge_id, criteria_type, criteria_value');
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user!.id);

      const earnedSet = new Set((earnedBadges || []).map((b: any) => b.badge_id));

      for (const badge of (allBadges || [])) {
        if (!earnedSet.has(badge.badge_id)) {
          const progress = progressLookup[badge.criteria_type] || 0;
          if (progress >= badge.criteria_value) {
            const { error: badgeErr } = await supabase.from('user_badges').insert({
              user_id: user!.id,
              badge_id: badge.badge_id,
            });
            if (badgeErr) console.error('Badge award error:', badgeErr);
          }
        }
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

  // Delay screen — progress bar at 100% with a short pause
  if (showCompletionDelay) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        <div className="w-full max-w-[684px] p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="flex-1 max-w-[400px] h-3 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-[#FFFDE6] rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>
          </div>
          <p className="text-[#FFFDE6] text-[22px] font-bold text-center animate-pulse">Great work!</p>
        </div>
      </div>
    );
  }

  // End of lesson screen
  if (lessonComplete || !currentTerm) {
    const STATUS_LABELS: Record<string, string> = {
      not_seen: 'Not Seen',
      seen: 'Seen',
      learning: 'Learning',
      reinforced: 'Reinforced',
      learnt: 'Learnt',
    };

    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter overflow-y-auto py-8 relative"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        {/* Confetti */}
        {confettiPieces.length > 0 && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {confettiPieces.map((p) => (
              <div
                key={p.id}
                className="absolute top-0 rounded-sm"
                style={{
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size * 1.5}px`,
                  backgroundColor: p.color,
                  animation: `confettiFall ${2.5 + p.delay}s ease-in forwards`,
                  animationDelay: `${p.delay * 0.3}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
            <style>{`
              @keyframes confettiFall {
                0% { top: -10%; opacity: 1; transform: rotate(0deg) translateX(0); }
                25% { transform: rotate(90deg) translateX(20px); }
                50% { transform: rotate(180deg) translateX(-20px); opacity: 1; }
                75% { transform: rotate(270deg) translateX(10px); }
                100% { top: 110%; opacity: 0; transform: rotate(360deg) translateX(-10px); }
              }
            `}</style>
          </div>
        )}

        <div className="w-full max-w-[420px] mx-4">
          {/* Trophy */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#FFFDE6] rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="w-12 h-12 text-[#FF4D01]" />
            </div>
          </div>

          <h1 className="text-[#FFFDE6] text-[28px] font-bold text-center mb-2">
            {t('lesson.complete')}
          </h1>
          <p className="text-[#FFFDE6]/80 text-[15px] text-center mb-8">
            {state.title || 'Great work!'}
          </p>

          {/* Stats cards — white for contrast */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 flex flex-col items-center shadow-md border border-[#E5E7EB]">
              <Zap className="w-7 h-7 text-[#16A34A] fill-[#16A34A] mb-1" />
              <span className="text-[#372213] text-[24px] font-bold">{sessionXp}</span>
              <span className="text-[#372213] text-[12px]">{t('lesson.xpEarned')}</span>
            </div>
            <div className="bg-white rounded-xl p-4 flex flex-col items-center shadow-md border border-[#E5E7EB]">
              <Star className="w-7 h-7 text-[#F59E0B] fill-[#F59E0B] mb-1" />
              <span className="text-[#372213] text-[24px] font-bold">{termsSeenThisSession}</span>
              <span className="text-[#372213] text-[12px]">{t('lesson.newTerms')}</span>
            </div>
            <div className="bg-white rounded-xl p-4 flex flex-col items-center shadow-md border border-[#E5E7EB]">
              <Check className="w-7 h-7 text-[#22C55E] mb-1" />
              <span className="text-[#372213] text-[24px] font-bold">{correctAnswersThisSession}</span>
              <span className="text-[#372213] text-[12px]">{t('lesson.correctAnswers')}</span>
            </div>
            <div className="bg-white rounded-xl p-4 flex flex-col items-center shadow-md border border-[#E5E7EB]">
              <Flame className="w-7 h-7 text-[#FF4D01] fill-[#FF4D01] mb-1" />
              <span className="text-[#372213] text-[24px] font-bold">{newStreak}</span>
              <span className="text-[#372213] text-[12px]">
                {streakUpdated ? `${t('lesson.dayStreak')}!` : t('lesson.dayStreak')}
              </span>
            </div>
          </div>

          {/* Graduated Words — only words that changed status */}
          {graduatedWords.length > 0 && (
            <div className="bg-white rounded-xl p-4 mb-6 shadow-md border border-[#E5E7EB]">
              <h3 className="text-[#372213] font-bold text-[15px] mb-3">{t('lesson.wordsProgressed')}</h3>
              <div className="flex flex-col gap-2">
                {graduatedWords.map(({ term, from, to }) => (
                  <div key={term.term_id} className="flex items-center justify-between bg-[#FFF8E1] rounded-lg px-3 py-2.5">
                    <div className="flex flex-col min-w-0 mr-2">
                      <span className="font-semibold text-[13px] truncate" lang="es" style={{ color: SPANISH_COLOR }}>{term.spanish_text}</span>
                      <span className="text-[11px] truncate" lang="en" style={{ color: ENGLISH_COLOR }}>{term.english_text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[#372213] text-[11px]">{STATUS_LABELS[from]}</span>
                      <ArrowRight className="w-3 h-3 text-[#372213]" />
                      <span className="text-[#16A34A] text-[11px] font-bold">{STATUS_LABELS[to]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 bg-white rounded-xl shadow-md border border-[#E5E7EB] text-[#372213] font-bold text-[15px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              {t('lesson.home')}
            </button>
            <button onClick={() => {
              // Reset state for next lesson batch
              setLessonComplete(false);
              lessonCompletionHandled.current = false;
              setSessionXp(0);
              setTermsSeenThisSession(0);
              setCorrectAnswersThisSession(0);
              setNewFlashcardCount(0);
              setGraduatedWords([]);
              setMode('flashcard');
              setQueueIndex(0);

              // Rebuild queue from current progress (limited to 3 new terms)
              const termIds = Array.from(termsMap.keys());
              const newQueue = buildSessionQueue(termIds, progressMap);
              let nextUnseenCount = 0;
              const limitedNewQueue = newQueue.filter(tid => {
                const tp = progressMap.get(tid);
                if (!tp || tp.status === 'not_seen' || tp.status === 'seen') {
                  nextUnseenCount++;
                  return nextUnseenCount <= MAX_NEW_TERMS_PER_SESSION;
                }
                return true;
              });
              setQueue(limitedNewQueue);
              totalQuizzesRef.current = 0;

              // Re-capture initial statuses from current progress
              initialStatusRef.current = new Map();
              for (const [tid, tp] of progressMap) {
                initialStatusRef.current.set(tid, tp.status);
              }
              for (const tid of termIds) {
                if (!initialStatusRef.current.has(tid)) {
                  initialStatusRef.current.set(tid, 'not_seen');
                }
              }
            }}
              className="flex-1 py-4 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[15px] hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2">
              {t('lesson.nextLesson')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
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
            navigate('/dashboard');
          }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-[#FFFDE6]" />
          </button>
          <div className="flex-1 mx-4 h-3 bg-white/30 rounded-full overflow-hidden">
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
                  {t('lesson.flashcard')}
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

                <h2 className="font-bold text-[24px] leading-[48px] mb-1" lang="es" style={{ color: SPANISH_COLOR }}>
                  {currentTerm.spanish_text}
                </h2>
                <span className="font-medium text-[20px] leading-[20px]" lang="en" style={{ color: ENGLISH_COLOR }}>
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
                {t('lesson.quiz')}
              </span>
            </div>

            {/* Question prompt */}
            <div className="w-full max-w-[422px] bg-[#FFFDE6] rounded-2xl p-6 flex flex-col items-center shadow-lg mb-6">
              <p className="text-[14px] text-[#372213] mb-2">
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
                    optClass = 'bg-white/50 border-2 border-white/30 text-[#372213]';
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

            {/* Feedback + Continue — always show correct answer */}
            {mcAnswered && (
              <div className="flex flex-col items-center gap-3">
                {mcSelectedId === mcCorrectId ? (
                  <p className="font-bold text-[18px] text-white">Correct!</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-bold text-[18px] text-white">Not quite!</p>
                  </div>
                )}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-[14px] text-[#FFFDE6]">
                    Correct answer: <span className="font-bold" lang="es" style={{ color: 'white' }}>{quizzedTerm.spanish_text}</span>
                    <span className="mx-2 text-white/50">-</span>
                    <span lang="en" style={{ color: 'white' }}>{quizzedTerm.english_text}</span>
                  </p>
                </div>
                <button onClick={handleMcContinue}
                  className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg">
                  Continue
                </button>
              </div>
            )}
          </div>
          );
        })()}

        {/* ─── LISTEN & WRITE MODE (bidirectional) ─── */}
        {mode === 'listen_write' && lwTargetId && (() => {
          const lwTerm = termsMap.get(lwTargetId);
          if (!lwTerm) return null;
          const isHearEsTypeEn = lwDirection === 'hear_es_type_en';
          const promptText = isHearEsTypeEn
            ? 'Listen to the Spanish and type the English meaning'
            : 'Listen to the English and type the Spanish word';
          const placeholder = isHearEsTypeEn ? 'Type in English...' : 'Type in Spanish...';
          const correctAnswer = isHearEsTypeEn ? lwTerm.english_text : lwTerm.spanish_text;
          return (
          <div className="flex-1 flex flex-col items-center">
            <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
              <span className="font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                {t('lesson.listenWrite')}
              </span>
            </div>

            <div className="w-full max-w-[422px] bg-[#FFFDE6] rounded-2xl p-6 flex flex-col items-center shadow-lg mb-6">
              <p className="text-[14px] text-[#372213] mb-3">{promptText}</p>
              <button onClick={() => isHearEsTypeEn ? speakSpanish(lwTerm.spanish_text, slowAudio) : speakEnglish(lwTerm.english_text)}
                className="w-16 h-16 bg-[#FF4D01] rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform mb-4">
                <Volume2 className="w-8 h-8 text-white" />
              </button>
              <input
                type="text"
                value={lwAnswer}
                onChange={(e) => setLwAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !lwSubmitted && handleLwSubmit()}
                disabled={lwSubmitted}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-xl text-[16px] text-[#372213] text-center focus:outline-none focus:border-[#FF4D01] disabled:opacity-60"
                autoFocus
              />
            </div>

            {!lwSubmitted ? (
              <div className="flex flex-col items-center gap-3">
                <button onClick={handleLwSubmit} disabled={!lwAnswer.trim()}
                  className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg disabled:opacity-50">
                  Check
                </button>
                <button onClick={advanceQueue}
                  className="text-[#FFFDE6]/60 text-[13px] hover:text-[#FFFDE6] transition-colors">
                  Can't listen right now
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {lwCorrect ? (
                  <p className="font-bold text-[18px] text-white">Correct!</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-bold text-[18px] text-white">Not quite!</p>
                  </div>
                )}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-[14px] text-[#FFFDE6]">
                    Correct answer: <span className="font-bold" style={{ color: 'white' }}>{correctAnswer}</span>
                  </p>
                </div>
                <button onClick={advanceQueue}
                  className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg">
                  Continue
                </button>
              </div>
            )}
          </div>
          );
        })()}

        {/* ─── TRANSLATE & SPEAK MODE (English text → speak Spanish) ─── */}
        {mode === 'listen_speak' && lsTargetId && (() => {
          const lsTerm = termsMap.get(lsTargetId);
          if (!lsTerm) return null;
          return (
          <div className="flex-1 flex flex-col items-center">
            <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
              <span className="font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                TRANSLATE &amp; SPEAK
              </span>
            </div>

            <div className="w-full max-w-[422px] bg-[#FFFDE6] rounded-2xl p-6 flex flex-col items-center shadow-lg mb-6">
              <p className="text-[14px] text-[#372213] mb-3">Say this in Spanish:</p>

              {lsTerm.image_url && (
                <img src={lsTerm.image_url} alt={lsTerm.english_text}
                  className="w-[180px] h-[120px] object-cover rounded-lg mb-4" />
              )}

              <h2 className="font-bold text-[24px] leading-[36px] text-center" lang="en" style={{ color: ENGLISH_COLOR }}>
                {lsTerm.english_text}
              </h2>

              {lsTranscript && !lsSubmitted && (
                <div className="w-full bg-white border-2 border-[#FF4D01] rounded-xl px-4 py-3 mt-4">
                  <p className="text-[11px] font-semibold text-[#372213] mb-1">You said:</p>
                  <p className="text-[16px] text-[#372213] text-center">{lsTranscript}</p>
                </div>
              )}
            </div>

            {!lsSubmitted ? (
              <div className="flex flex-col items-center gap-3">
                {!lsTranscript ? (
                  lsRecording ? (
                    <div className="flex flex-col items-center gap-3">
                      {/* Waveform visualization */}
                      <div ref={waveformRef} className="flex items-center justify-center gap-[3px] h-[44px]">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div key={i} className="w-[4px] rounded-full bg-[#FFFDE6]" style={{ height: '4px' }} />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-6 py-3 bg-[#FF4D01] rounded-xl text-white">
                          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                          <span className="font-medium text-[14px]">Recording...</span>
                        </div>
                        <button onClick={() => { lsRecogRef.current?.stop(); setLsRecording(false); cleanupAudio(); }}
                          className="px-4 py-3 bg-[#FFFDE6] rounded-xl flex items-center gap-2">
                          <Check className="w-5 h-5 text-[#22C55E]" />
                          <span className="font-bold text-[14px] text-[#22C55E]">Done</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={startLsRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-[#FFFDE6] rounded-xl text-[#372213] hover:bg-white transition-colors shadow-lg">
                        <Mic className="w-5 h-5 text-[#FF4D01]" />
                        <span className="font-medium text-[14px]">Tap to speak</span>
                      </button>
                      <button onClick={advanceQueue}
                        className="text-[#FFFDE6]/60 text-[13px] hover:text-[#FFFDE6] transition-colors">
                        Can't speak right now
                      </button>
                    </>
                  )
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setLsTranscript('')}
                      className="px-4 py-3 bg-white/80 rounded-xl text-[#EF4444] border border-[#FCA5A5]">
                      Re-record
                    </button>
                    <button onClick={handleLsSubmit}
                      className="px-6 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold hover:bg-white transition-colors shadow-lg">
                      Submit
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {lsCorrect ? (
                  <p className="font-bold text-[18px] text-white">Great pronunciation!</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-bold text-[18px] text-white">Keep practicing!</p>
                  </div>
                )}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 w-full max-w-[380px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[12px] text-[#FFFDE6]/70 shrink-0 w-12">You:</span>
                      <span className="text-[15px] font-medium text-white">{lsTranscript}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[12px] text-[#FFFDE6]/70 shrink-0 w-12">Target:</span>
                      <span className="text-[15px] font-bold text-white">{lsTerm.spanish_text}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => speakSpanish(lsTerm.spanish_text, true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-[#FFFDE6] text-[13px] hover:bg-white/30 transition-colors">
                  <Volume2 className="w-4 h-4" />
                  Listen correct (slow)
                </button>
                <button onClick={advanceQueue}
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

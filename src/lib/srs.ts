/**
 * Spaced Repetition System (SM-2 variant)
 *
 * Statuses: not_seen → seen → learning → reinforced → learnt
 *
 * Quality scores (q):
 *   5 = perfect, 4 = minor error, 3 = weak/gender/typo, 1 = wrong, 0 = skipped
 */

import { supabase } from './supabase';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export type TermStatus = 'not_seen' | 'seen' | 'learning' | 'reinforced' | 'learnt';

export type QuestionType = 'flashcard' | 'multi_choice' | 'listen_write' | 'listen_speak';

export interface SM2Data {
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string | null; // ISO date string
  last_quality: number | null;
  strength: number;
  correct_in_session: number;
  question_types_correct: string[];
}

export interface TermProgress {
  term_id: number;
  status: TermStatus;
  sm2: SM2Data;
}

// ──────────────────────────────────────────────────────────────
// Quality scoring helpers
// ──────────────────────────────────────────────────────────────

export function multiChoiceQuality(correct: boolean, skipped: boolean): number {
  if (skipped) return 0;
  return correct ? 5 : 1;
}

export function listenWriteQuality(
  answer: string,
  expected: string,
  skipped: boolean
): number {
  if (skipped) return 0;
  const norm = (s: string) => s.trim().toLowerCase();
  if (norm(answer) === norm(expected)) return 5;

  // Check accent-only difference
  const stripAccents = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (stripAccents(answer) === stripAccents(expected)) return 4;

  // Gender/article/typo: within edit distance 2
  if (levenshtein(norm(answer), norm(expected)) <= 2) return 3;

  return 1;
}

export function listenSpeakQuality(pronunciationScore: number, skipped: boolean): number {
  if (skipped) return 0;
  if (pronunciationScore >= 80) return 5;
  if (pronunciationScore >= 60) return 3;
  return 1;
}

// ──────────────────────────────────────────────────────────────
// Core algorithm
// ──────────────────────────────────────────────────────────────

export interface UpdateResult {
  newStatus: TermStatus;
  sm2: SM2Data;
  requeue: boolean; // should this term be re-inserted 3-5 cards later?
}

export function processAnswer(
  currentStatus: TermStatus,
  sm2: SM2Data,
  quality: number,
  questionType: QuestionType,
  markedAsKnown: boolean
): UpdateResult {
  // Clone sm2 data
  const next: SM2Data = { ...sm2, question_types_correct: [...sm2.question_types_correct] };

  // Marked as known → jump to learnt
  if (markedAsKnown) {
    next.last_quality = 5;
    next.repetitions = 3;
    next.interval_days = 7;
    next.easiness_factor = Math.max(next.easiness_factor, 2.5);
    next.strength = 1.0;
    next.next_review_date = addDays(new Date(), 7);
    return { newStatus: 'learnt', sm2: next, requeue: false };
  }

  // Update easiness factor
  const q = quality;
  next.easiness_factor += 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  next.easiness_factor = Math.max(next.easiness_factor, 1.3);
  next.last_quality = q;

  let newStatus = currentStatus;
  let requeue = false;

  if (q <= 3) {
    // ── Weak / incorrect ──
    requeue = true;

    // If in spaced review, reset
    if (currentStatus === 'reinforced' || currentStatus === 'learnt') {
      next.repetitions = 0;
      next.interval_days = 1;
      next.next_review_date = addDays(new Date(), 1);
    }

    // Regress status
    if (currentStatus === 'learnt') newStatus = 'reinforced';
    else if (currentStatus === 'reinforced') newStatus = 'learning';
    // learning/seen stay as-is

    // Reset session counters for this term
    next.correct_in_session = 0;
    next.question_types_correct = [];
  } else {
    // ── Successful (q >= 4) ──
    next.repetitions += 1;
    next.correct_in_session += 1;

    // Track question type diversity
    if (!next.question_types_correct.includes(questionType)) {
      next.question_types_correct.push(questionType);
    }

    // Calculate next interval
    if (next.repetitions === 1) {
      next.interval_days = 1;
    } else if (next.repetitions === 2) {
      next.interval_days = 3;
    } else {
      next.interval_days = Math.round(next.interval_days * next.easiness_factor);
    }
    next.next_review_date = addDays(new Date(), next.interval_days);
    next.strength = 1.0;

    // Stage advancement
    if (currentStatus === 'seen' || currentStatus === 'not_seen') {
      newStatus = 'learning';
    } else if (currentStatus === 'learning') {
      // learning → reinforced: 2+ correct in session across 2+ question types
      if (next.correct_in_session >= 2 && next.question_types_correct.length >= 2) {
        newStatus = 'reinforced';
        next.correct_in_session = 0;
        next.question_types_correct = [];
      }
    } else if (currentStatus === 'reinforced') {
      // reinforced → learnt: repetitions >= 2 (2 successful spaced reviews)
      if (next.repetitions >= 2) {
        newStatus = 'learnt';
      }
    }
    // learnt stays learnt
  }

  return { newStatus, sm2: next, requeue };
}

// ──────────────────────────────────────────────────────────────
// Memory decay (checked on session open)
// ──────────────────────────────────────────────────────────────

export function applyDecay(
  status: TermStatus,
  sm2: SM2Data
): { displayStatus: TermStatus; strength: number } {
  if (status !== 'reinforced' && status !== 'learnt') {
    return { displayStatus: status, strength: sm2.strength };
  }

  if (!sm2.next_review_date || sm2.interval_days <= 0) {
    return { displayStatus: status, strength: sm2.strength };
  }

  const reviewDate = new Date(sm2.next_review_date);
  const today = new Date();
  const daysOverdue = Math.max(0, (today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysOverdue <= 0) {
    return { displayStatus: status, strength: 1.0 };
  }

  const strength = Math.pow(1 + daysOverdue / (9 * sm2.interval_days), -1);

  let displayStatus: TermStatus = status;
  if (strength >= 0.90) {
    displayStatus = status; // unchanged
  } else if (strength >= 0.70) {
    displayStatus = 'reinforced';
  } else if (strength >= 0.50) {
    displayStatus = 'learning';
  } else {
    displayStatus = 'seen';
  }

  return { displayStatus, strength };
}

// ──────────────────────────────────────────────────────────────
// Database operations
// ──────────────────────────────────────────────────────────────

const DEFAULT_SM2: SM2Data = {
  easiness_factor: 2.5,
  interval_days: 0,
  repetitions: 0,
  next_review_date: null,
  last_quality: null,
  strength: 1.0,
  correct_in_session: 0,
  question_types_correct: [],
};

/**
 * Load progress + SM2 data for a list of term IDs.
 */
export async function loadTermProgress(
  userId: string,
  termIds: number[]
): Promise<Map<number, TermProgress>> {
  const map = new Map<number, TermProgress>();

  if (!termIds.length) return map;

  const [{ data: progressRows }, { data: sm2Rows }] = await Promise.all([
    supabase
      .from('user_term_progress')
      .select('term_id, status')
      .eq('user_id', userId)
      .in('term_id', termIds),
    supabase
      .from('user_term_sm2')
      .select('term_id, easiness_factor, interval_days, repetitions, next_review_date, last_quality, strength, correct_in_session, question_types_correct')
      .eq('user_id', userId)
      .in('term_id', termIds),
  ]);

  const sm2Map = new Map<number, SM2Data>();
  sm2Rows?.forEach((row: any) => {
    sm2Map.set(row.term_id, {
      easiness_factor: row.easiness_factor,
      interval_days: row.interval_days,
      repetitions: row.repetitions,
      next_review_date: row.next_review_date,
      last_quality: row.last_quality,
      strength: row.strength ?? 1.0,
      correct_in_session: row.correct_in_session ?? 0,
      question_types_correct: row.question_types_correct ?? [],
    });
  });

  for (const tid of termIds) {
    const status = (progressRows?.find((r: any) => r.term_id === tid)?.status || 'not_seen') as TermStatus;
    const sm2 = sm2Map.get(tid) || { ...DEFAULT_SM2 };
    map.set(tid, { term_id: tid, status, sm2 });
  }

  return map;
}

/**
 * Persist updated progress + SM2 data for a single term.
 */
export async function saveTermProgress(
  userId: string,
  termId: number,
  status: TermStatus,
  sm2: SM2Data
): Promise<void> {
  const [progressResult, sm2Result] = await Promise.all([
    supabase.from('user_term_progress').upsert(
      {
        user_id: userId,
        term_id: termId,
        status,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,term_id' }
    ),
    supabase.from('user_term_sm2').upsert(
      {
        user_id: userId,
        term_id: termId,
        easiness_factor: sm2.easiness_factor,
        interval_days: sm2.interval_days,
        repetitions: sm2.repetitions,
        next_review_date: sm2.next_review_date,
        last_quality: sm2.last_quality,
        strength: sm2.strength,
        correct_in_session: sm2.correct_in_session,
        question_types_correct: sm2.question_types_correct,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,term_id' }
    ),
  ]);
  if (progressResult.error) console.error('Failed to save term progress:', progressResult.error);
  if (sm2Result.error) console.error('Failed to save SM2 data:', sm2Result.error);
}

/**
 * Mark term as "seen" (flashcard reveal).
 */
export async function markSeen(userId: string, termId: number): Promise<void> {
  // Only update if not already beyond 'seen'
  const { data } = await supabase
    .from('user_term_progress')
    .select('status')
    .eq('user_id', userId)
    .eq('term_id', termId)
    .single();

  if (!data || data.status === 'not_seen') {
    const { error } = await supabase.from('user_term_progress').upsert(
      {
        user_id: userId,
        term_id: termId,
        status: 'seen',
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,term_id' }
    );
    if (error) console.error('Failed to mark seen:', error);
  }
}

// ──────────────────────────────────────────────────────────────
// Session queue builder
// ──────────────────────────────────────────────────────────────

/**
 * Build the initial lesson queue for a subunit.
 * Prioritises: overdue terms, then weakened, then unseen, then remaining.
 */
export function buildSessionQueue(
  allTermIds: number[],
  progressMap: Map<number, TermProgress>
): number[] {
  const overdue: { id: number; strength: number }[] = [];
  const weakened: { id: number; strength: number }[] = [];
  const unseen: number[] = [];
  const rest: number[] = [];

  const today = new Date();

  for (const tid of allTermIds) {
    const tp = progressMap.get(tid);
    if (!tp || tp.status === 'not_seen') {
      unseen.push(tid);
      continue;
    }

    if (tp.status === 'seen') {
      // Seen but not yet learning — treat as unseen-ish priority
      unseen.push(tid);
      continue;
    }

    // Check decay for learning/reinforced/learnt
    const { displayStatus, strength } = applyDecay(tp.status, tp.sm2);

    if (tp.sm2.next_review_date && new Date(tp.sm2.next_review_date) <= today) {
      overdue.push({ id: tid, strength });
    } else if (displayStatus !== tp.status) {
      weakened.push({ id: tid, strength });
    } else if (tp.status !== 'learnt') {
      rest.push(tid);
    }
    // Fully learnt and not overdue → skip (they'll review when due)
  }

  // Sort overdue/weakened by strength ascending (weakest first)
  overdue.sort((a, b) => a.strength - b.strength);
  weakened.sort((a, b) => a.strength - b.strength);

  return [
    ...overdue.map(o => o.id),
    ...weakened.map(w => w.id),
    ...unseen,
    ...rest,
  ];
}

/**
 * Insert a term back into the queue, 3-5 positions later.
 */
export function requeueTerm(queue: number[], currentIndex: number, termId: number): number[] {
  const insertAt = Math.min(
    currentIndex + 3 + Math.floor(Math.random() * 3), // 3-5 later
    queue.length
  );
  const newQueue = [...queue];
  newQueue.splice(insertAt, 0, termId);
  return newQueue;
}

// ──────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

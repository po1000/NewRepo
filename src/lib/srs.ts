/*
  HOW THE SPACED REPETITION SYSTEM WORKS

  Each word goes through five stages:
    not_seen > seen > learning > reinforced > learnt

  A word is first shown as a flashcard (which moves it to "seen").
  It only gets quizzed after the learner has already been exposed to it.
  This avoids testing people on words they have never encountered.

  Pacing (to protect beginners from overload):
    - Maximum 3 new words per session.
    - After every new flashcard, the app inserts a quiz on an already-seen
      word. This interleaving reinforces recall and stops the user from
      seeing a big block of new vocabulary with no testing.
    - Once the cap is hit, only re-testing happens.

  Quality score (q) per answer:
    5 = perfect
    4 = accent missing or minor error
    3 = typo / gender mistake / close attempt
    1 = wrong
    0 = skipped

  Within a session (Layer 1):
    - If q >= 4, the word is remembered. It may advance a stage and gets
      scheduled for a future review.
    - If q <= 3, the word goes back into the queue 3-5 cards later so the
      user sees it again in the same session at the same stage.

  Stage promotion rules:
    - seen to learning: first successful test attempt.
    - learning to reinforced: 2 correct answers across 2 different
      question types (e.g. multi-choice + listen-write).
    - reinforced to learnt: 2+ successful spaced reviews on different days.

  Cross-session spacing (Layer 2, based on SM-2):
    Expanding intervals between reviews:
      1st success  > review in 1 day
      2nd success  > review in 3 days
      3rd+ success > review in (previous interval x EF)
      any failure  > reset to 1 day, stage may drop
    EF (easiness factor) starts at 2.5 and adjusts with each answer.

  Memory decay:
    Memory strength fades daily based on the forgetting curve.
      Strength >= 90%  > stays Learnt
      Strength 70-89%  > drops to Reinforced
      Strength 50-69%  > drops to Learning
      Strength < 50%   > drops to Seen
    Overdue terms are prioritised in the session queue.

  "I know this" shortcut:
    The thumbs-up button scores q=5 and jumps the word straight to learnt,
    so existing speakers are not forced through drills on words they already know.

  Why these choices? Competitor apps (Duolingo, Babbel, etc.) introduce
  vocabulary too quickly and give only pass/fail feedback. Our interleaved
  cap (3 new per session, quiz every 1 flashcard, re-queue on weak answers)
  deliberately slows the drip of new words while maximising retrieval practice.
*/

import { supabase } from './supabase';

export type TermStatus = 'not_seen' | 'seen' | 'learning' | 'reinforced' | 'learnt';

export type QuestionType = 'flashcard' | 'multi_choice' | 'listen_write' | 'listen_speak';

export interface SM2Data {
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string | null;
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

  const stripAccents = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  if (stripAccents(answer) === stripAccents(expected)) return 4;

  if (levenshtein(norm(answer), norm(expected)) <= 2) return 3;

  return 1;
}

export function listenSpeakQuality(pronunciationScore: number, skipped: boolean): number {
  if (skipped) return 0;
  if (pronunciationScore >= 80) return 5;
  if (pronunciationScore >= 60) return 3;
  return 1;
}

export interface UpdateResult {
  newStatus: TermStatus;
  sm2: SM2Data;
  requeue: boolean;
}

export function processAnswer(
  currentStatus: TermStatus,
  sm2: SM2Data,
  quality: number,
  questionType: QuestionType,
  markedAsKnown: boolean
): UpdateResult {
  const next: SM2Data = { ...sm2, question_types_correct: [...sm2.question_types_correct] };

  if (markedAsKnown) {
    next.last_quality = 5;
    next.repetitions = 3;
    next.interval_days = 7;
    next.easiness_factor = Math.max(next.easiness_factor, 2.5);
    next.strength = 1.0;
    next.next_review_date = addDays(new Date(), 7);
    return { newStatus: 'learnt', sm2: next, requeue: false };
  }

  const q = quality;
  next.easiness_factor += 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  next.easiness_factor = Math.max(next.easiness_factor, 1.3);
  next.last_quality = q;

  let newStatus = currentStatus;
  let requeue = false;

  if (q <= 3) {
    requeue = true;

    if (currentStatus === 'reinforced' || currentStatus === 'learnt') {
      next.repetitions = 0;
      next.interval_days = 1;
      next.next_review_date = addDays(new Date(), 1);
    }

    if (currentStatus === 'learnt') newStatus = 'reinforced';
    else if (currentStatus === 'reinforced') newStatus = 'learning';

    next.correct_in_session = 0;
    next.question_types_correct = [];
  } else {
    next.repetitions += 1;
    next.correct_in_session += 1;

    if (!next.question_types_correct.includes(questionType)) {
      next.question_types_correct.push(questionType);
    }

    if (next.repetitions === 1) {
      next.interval_days = 1;
    } else if (next.repetitions === 2) {
      next.interval_days = 3;
    } else {
      next.interval_days = Math.round(next.interval_days * next.easiness_factor);
    }
    next.next_review_date = addDays(new Date(), next.interval_days);
    next.strength = 1.0;

    if (currentStatus === 'seen' || currentStatus === 'not_seen') {
      newStatus = 'learning';
    } else if (currentStatus === 'learning') {
      if (next.correct_in_session >= 2 && next.question_types_correct.length >= 2) {
        newStatus = 'reinforced';
        next.correct_in_session = 0;
        next.question_types_correct = [];
      }
    } else if (currentStatus === 'reinforced') {
      if (next.repetitions >= 2) {
        newStatus = 'learnt';
      }
    }
  }

  return { newStatus, sm2: next, requeue };
}

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
    displayStatus = status;
  } else if (strength >= 0.70) {
    displayStatus = 'reinforced';
  } else if (strength >= 0.50) {
    displayStatus = 'learning';
  } else {
    displayStatus = 'seen';
  }

  return { displayStatus, strength };
}

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

export async function markSeen(userId: string, termId: number): Promise<void> {
  const { data } = await supabase
    .from('user_term_progress')
    .select('status')
    .eq('user_id', userId)
    .eq('term_id', termId)
    .maybeSingle();

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
      unseen.push(tid);
      continue;
    }

    const { displayStatus, strength } = applyDecay(tp.status, tp.sm2);

    if (tp.sm2.next_review_date && new Date(tp.sm2.next_review_date) <= today) {
      overdue.push({ id: tid, strength });
    } else if (displayStatus !== tp.status) {
      weakened.push({ id: tid, strength });
    } else if (tp.status !== 'learnt') {
      rest.push(tid);
    }
  }

  overdue.sort((a, b) => a.strength - b.strength);
  weakened.sort((a, b) => a.strength - b.strength);

  return [
    ...overdue.map(o => o.id),
    ...weakened.map(w => w.id),
    ...unseen,
    ...rest,
  ];
}

export function requeueTerm(queue: number[], currentIndex: number, termId: number): number[] {
  const insertAt = Math.min(
    currentIndex + 3 + Math.floor(Math.random() * 3),
    queue.length
  );
  const newQueue = [...queue];
  newQueue.splice(insertAt, 0, termId);
  return newQueue;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
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

import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Home, Check, Mic, Pencil, ArrowLeft, Eye, EyeOff, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scenarios } from './SpeakAndWrite';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';

interface ReviewMessage {
  role: string;
  text: string;
  translation?: string;
  inputMode: string;
}

interface AnalysisData {
  scenarioId?: string;
  scenarioTitle: string;
  messages: ReviewMessage[];
  elapsed: number;
  criteriaCount: number;
}

interface DifficultWord {
  said: string;
  expected: string;
  modes: Set<'speaking' | 'writing'>;
}

interface Grade {
  name: string;
  score: number;
  feedback: string;
}

interface RoleplayCompleteProps {
  onBack?: () => void;
}


const ACCENT_MAP: Record<string, string> = {
  'cafe': 'café', 'tambien': 'también', 'como': 'cómo',
  'donde': 'dónde', 'que': 'qué', 'cuanto': 'cuánto',
  'esta': 'está', 'mas': 'más', 'aqui': 'aquí',
  'asi': 'así', 'despues': 'después', 'ademas': 'además',
  'quizas': 'quizás', 'facil': 'fácil', 'dificil': 'difícil',
  'adios': 'adiós', 'rapido': 'rápido', 'pequeno': 'pequeño',
  'manana': 'mañana', 'espanol': 'español', 'estacion': 'estación',
};
const ACCENTED_FORMS = new Set(Object.values(ACCENT_MAP));

const COMMON_WORDS = new Set([
  'hola', 'adios', 'gracias', 'por', 'favor', 'si', 'no', 'bien', 'mal',
  'buenos', 'buenas', 'dias', 'tardes', 'noches', 'que', 'tal', 'como',
  'yo', 'tu', 'el', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'usted',
  'soy', 'eres', 'es', 'somos', 'sois', 'son', 'estoy', 'estas', 'esta',
  'estamos', 'estais', 'estan', 'tengo', 'tienes', 'tiene', 'tenemos',
  'quiero', 'quieres', 'quiere', 'queremos', 'puedo', 'puedes', 'puede',
  'hablo', 'hablas', 'habla', 'hablamos', 'hablan', 'hablado',
  'como', 'comes', 'come', 'comemos', 'comen', 'comido',
  'voy', 'vas', 'va', 'vamos', 'vais', 'van', 'fue', 'fui', 'fueron',
  'agua', 'cafe', 'leche', 'te', 'zumo', 'pan', 'tostada', 'churro',
  'cerveza', 'vino', 'sopa', 'ensalada', 'comida', 'desayuno',
  'mesa', 'cuenta', 'menu', 'plato', 'tenedor', 'cuchara', 'cuchillo',
  'camarero', 'restaurante', 'bar',
  'euro', 'euros', 'dolar', 'dolares', 'cuanto', 'cuesta', 'precio',
  'caro', 'barato', 'pagar', 'pago', 'tarjeta', 'efectivo',
  'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'donde', 'aqui', 'alli', 'cerca', 'lejos', 'derecha', 'izquierda', 'recto',
  'calle', 'plaza', 'museo', 'estacion', 'aeropuerto', 'hotel',
  'familia', 'padre', 'madre', 'hermano', 'hermana', 'hijo', 'hija',
  'abuelo', 'abuela', 'tio', 'tia', 'primo', 'prima',
  'grande', 'pequeno', 'alto', 'bajo', 'gordo', 'delgado', 'simpatico',
  'antipatico', 'inteligente', 'guapo', 'bonito', 'feo', 'nuevo', 'viejo',
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'pero', 'porque', 'aunque', 'sin', 'embargo', 'entonces', 'tambien',
  'muy', 'mucho', 'poco', 'algo', 'nada', 'siempre', 'nunca',
  'me', 'te', 'le', 'nos', 'os', 'les', 'mi', 'tu', 'su',
  'con', 'de', 'a', 'en', 'para', 'por', 'sobre', 'entre',
  ...Array.from(ACCENTED_FORMS),
]);

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

function findClosest(word: string, dict: Set<string>): string | null {
  if (dict.has(word)) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const candidate of dict) {
    if (Math.abs(candidate.length - word.length) > 2) continue;
    const d = levenshtein(word, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }
  if (best && bestDist <= 2 && bestDist > 0 && word.length >= 3) {
    return best;
  }
  return null;
}

function pctToScore(pct: number): number {
  if (pct >= 90) return 5;
  if (pct >= 75) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
}

function scoreLabel(score: number): string {
  if (score >= 4.5) return 'Exceeds Standard';
  if (score >= 3.5) return 'Meets Standard';
  if (score >= 2.5) return 'Approaches Standard';
  return 'Below Standard';
}

function scoreColor(score: number): string {
  if (score >= 4) return '#16A34A';
  if (score >= 3) return '#F59E0B';
  return '#EF4444';
}

function evaluateRoleplay(messages: ReviewMessage[], scenarioKeywords: string[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const writtenMsgs = userMessages.filter(m => m.inputMode === 'text');
  const spokenMsgs = userMessages.filter(m => m.inputMode === 'voice');

  const validWords = new Set([...COMMON_WORDS, ...scenarioKeywords.map(k => k.toLowerCase())]);

  const tokenize = (text: string) => text.toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^a-záéíóúñü]/g, ''))
    .filter(Boolean);

  const allWords = userMessages.flatMap(m => tokenize(m.text));
  const writtenWords = writtenMsgs.flatMap(m => tokenize(m.text));
  const spokenWords = spokenMsgs.flatMap(m => tokenize(m.text));

  const diffMap = new Map<string, DifficultWord>();
  for (const msg of userMessages) {
    const words = tokenize(msg.text);
    const mode = msg.inputMode === 'voice' ? 'speaking' : 'writing';
    for (const w of words) {
      if (w.length < 3) continue;
      const closest = findClosest(w, validWords);
      if (closest) {
        const key = w;
        const existing = diffMap.get(key);
        if (existing) {
          existing.modes.add(mode as 'speaking' | 'writing');
        } else {
          diffMap.set(key, { said: w, expected: closest, modes: new Set([mode as 'speaking' | 'writing']) });
        }
      }
    }
  }
  const difficultWords = Array.from(diffMap.values()).slice(0, 6);

  const speaking: Grade[] = [];

  if (spokenMsgs.length > 0) {
    const avgWordsPerMsg = spokenWords.length / spokenMsgs.length;
    const fluencyPct = Math.min(100, (avgWordsPerMsg / 8) * 100);
    speaking.push({
      name: 'Fluency & Spontaneity',
      score: pctToScore(fluencyPct),
      feedback: avgWordsPerMsg >= 8
        ? 'Your responses flow naturally with good length.'
        : avgWordsPerMsg >= 4
          ? 'Reasonable flow — try expanding your responses.'
          : 'Responses are short — practise speaking longer phrases.',
    });

    const uniqueSpoken = new Set(spokenWords).size;
    const ttrPct = spokenWords.length > 0 ? Math.min(100, (uniqueSpoken / spokenWords.length) * 130) : 0;
    speaking.push({
      name: 'Vocabulary & Range',
      score: pctToScore(ttrPct),
      feedback: ttrPct >= 75
        ? 'Excellent variety — you avoided repetition well.'
        : ttrPct >= 50
          ? 'Decent vocabulary range, with some repetition.'
          : 'Try using a wider variety of words next time.',
    });

    const TENSE_MARKERS = ['fue', 'fui', 'fueron', 'era', 'eran', 'estaba', 'estaban', 'iré', 'iras', 'voy', 'vamos', 'comí', 'comiste', 'hablé', 'hablado'];
    const CONJUNCTIONS = ['porque', 'pero', 'aunque', 'sin embargo', 'entonces', 'también', 'cuando', 'mientras'];
    const allSpokenText = spokenMsgs.map(m => m.text.toLowerCase()).join(' ');
    let grammarHits = 0;
    for (const m of TENSE_MARKERS) if (allSpokenText.includes(m)) grammarHits++;
    for (const c of CONJUNCTIONS) if (allSpokenText.includes(c)) grammarHits++;
    const grammarPct = Math.min(100, (grammarHits / 4) * 100 + 40);
    speaking.push({
      name: 'Grammar & Structure Accuracy',
      score: pctToScore(grammarPct),
      feedback: grammarHits >= 4
        ? 'Strong use of tenses and connectives.'
        : grammarHits >= 2
          ? 'Some grammatical variety — try using more tenses.'
          : 'Mostly present tense; mix in past or future where you can.',
    });

    const spokenDiff = difficultWords.filter(d => d.modes.has('speaking')).length;
    const pronPct = spokenWords.length > 0
      ? Math.max(0, Math.min(100, ((spokenWords.length - spokenDiff * 2) / spokenWords.length) * 100))
      : 0;
    speaking.push({
      name: 'Pronunciation & Intonation',
      score: pctToScore(pronPct),
      feedback: pronPct >= 85
        ? 'Clear, well-articulated speech.'
        : pronPct >= 65
          ? 'Mostly clear; a few words tripped up the recogniser.'
          : 'Some pronunciation issues — try slower, clearer enunciation.',
    });

    const keywordsHit = scenarioKeywords.filter(k => allSpokenText.includes(k.toLowerCase())).length;
    const relevancePct = scenarioKeywords.length > 0
      ? Math.min(100, (keywordsHit / scenarioKeywords.length) * 100 + 30)
      : 70;
    speaking.push({
      name: 'Relevance',
      score: pctToScore(relevancePct),
      feedback: relevancePct >= 80
        ? 'You stayed firmly on topic.'
        : relevancePct >= 60
          ? 'Mostly on topic with some tangents.'
          : 'Try to address the scenario prompts more directly.',
    });
  }

  const writing: Grade[] = [];

  if (writtenMsgs.length > 0) {
    const allWrittenText = writtenMsgs.map(m => m.text).join(' ');
    const allWrittenLower = allWrittenText.toLowerCase();

    let accentTotal = 0;
    let accentCorrect = 0;
    for (const w of writtenWords) {
      if (ACCENT_MAP[w]) {
        accentTotal++;
      } else if (ACCENTED_FORMS.has(w)) {
        accentTotal++;
        accentCorrect++;
      }
    }
    const accentPct = accentTotal > 0 ? (accentCorrect / accentTotal) * 100 : 70;
    writing.push({
      name: 'Accent Marks (Tildes)',
      score: pctToScore(accentPct),
      feedback: accentTotal === 0
        ? 'Few words requiring accents were used — keep practising.'
        : accentPct >= 80
          ? 'Excellent use of tildes (e.g., café, también).'
          : accentPct >= 50
            ? 'Some accents missing — remember hablo vs. habló.'
            : 'Most accents missing — review tilde rules for common words.',
    });

    const hasInvertedQ = /¿/.test(allWrittenText);
    const usedQ = /\?/.test(allWrittenText);
    const hasInvertedE = /¡/.test(allWrittenText);
    const usedE = /!/.test(allWrittenText);
    const hasN = /ñ/.test(allWrittenLower);
    const writtenDiff = difficultWords.filter(d => d.modes.has('writing')).length;
    const typoRate = writtenWords.length > 0 ? writtenDiff / writtenWords.length : 0;

    let mechScore = 60;
    if (usedQ && hasInvertedQ) mechScore += 12;
    else if (usedQ && !hasInvertedQ) mechScore -= 8;
    if (usedE && hasInvertedE) mechScore += 8;
    else if (usedE && !hasInvertedE) mechScore -= 5;
    if (hasN) mechScore += 8;
    mechScore -= Math.min(30, typoRate * 200);
    mechScore = Math.max(0, Math.min(100, mechScore));

    writing.push({
      name: 'Spelling & Mechanics',
      score: pctToScore(mechScore),
      feedback: mechScore >= 80
        ? 'Strong control of ñ, inverted punctuation, and spelling.'
        : mechScore >= 60
          ? `${usedQ && !hasInvertedQ ? 'Use ¿ at the start of questions. ' : ''}${typoRate > 0.05 ? 'Watch for typos.' : 'Mostly accurate.'}`
          : 'Several mechanics issues — review ¿/¡, ñ, and spelling.',
    });

    const CONNECTIVES = ['porque', 'pero', 'aunque', 'sin embargo', 'también', 'cuando', 'que', 'mientras'];
    const sentences = allWrittenText.split(/[.!?]+/).filter(s => s.trim().length > 2);
    const avgSentLen = sentences.length > 0 ? writtenWords.length / sentences.length : 0;
    let connectiveHits = 0;
    for (const c of CONNECTIVES) if (allWrittenLower.includes(c)) connectiveHits++;
    let structScore = 50;
    structScore += Math.min(30, connectiveHits * 8);
    structScore += avgSentLen >= 5 ? 15 : avgSentLen >= 3 ? 8 : 0;
    structScore = Math.max(0, Math.min(100, structScore));

    writing.push({
      name: 'Sentence Structure & Organization',
      score: pctToScore(structScore),
      feedback: structScore >= 80
        ? 'Well-organized with good use of connectives.'
        : structScore >= 60
          ? 'Reasonable structure — try connectives like aunque, sin embargo.'
          : 'Sentences are short and disconnected — link ideas with porque, pero, etc.',
    });
  }

  const allGrades = [...speaking, ...writing];
  const overallScore = allGrades.length > 0
    ? allGrades.reduce((sum, g) => sum + g.score, 0) / allGrades.length
    : 0;
  const overallPct = Math.round((overallScore / 5) * 100);

  return {
    speaking,
    writing,
    difficultWords,
    overallScore,
    overallPct,
    hasWriting: writtenMsgs.length > 0,
    hasSpeaking: spokenMsgs.length > 0,
  };
}


export function RoleplayComplete(_props: RoleplayCompleteProps) {
  usePageTitle('Roleplay Complete');
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scenarioId: paramScenarioId } = useParams();

  const data = (location.state as AnalysisData) || {
    scenarioId: paramScenarioId,
    scenarioTitle: 'Practice',
    messages: [],
    elapsed: 0,
    criteriaCount: 3,
  };

  const scenarioId = data.scenarioId || paramScenarioId;
  const scenario = scenarios.find(s => s.id === scenarioId);
  const charAvatar = scenario?.imageUrl;
  const scenarioKeywords = scenario?.criteria.flatMap(c => c.keywords) || [];

  const storedAvatar = user?.id ? localStorage.getItem(`avatar_url_${user.id}`) : null;
  const userAvatar = storedAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const evaluation = useMemo(
    () => evaluateRoleplay(data.messages, scenarioKeywords),
    [data.messages, scenarioKeywords]
  );

  const [mode, setMode] = useState<'summary' | 'review'>('summary');
  const [showTranslations, setShowTranslations] = useState(false);
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const [writingExpanded, setWritingExpanded] = useState(true);
  const [speakingExpanded, setSpeakingExpanded] = useState(true);
  const [confetti, setConfetti] = useState<{ id: number; left: number; size: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    const colors = ['#FF4D01', '#FFD905', '#3BBC00', '#1D4ED8', '#E879F9', '#FFFDE6'];
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.2,
    }));
    setConfetti(pieces);
    const timer = setTimeout(() => setConfetti([]), 4000);
    return () => clearTimeout(timer);
  }, []);

  const minutes = Math.floor(data.elapsed / 60);
  const seconds = data.elapsed % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')} mins`;

  function handleRetry() {
    if (user?.id && scenarioId) {
      localStorage.removeItem(`chat_${user.id}_${scenarioId}`);
    }
    navigate(`/speak-and-write/practice/${scenarioId}`);
  }

  function handleNextScenario() {
    const others = scenarios.filter(s => s.id !== scenarioId);
    if (others.length === 0) {
      navigate('/speak-and-write');
      return;
    }
    const next = others[Math.floor(Math.random() * others.length)];
    if (user?.id) {
      localStorage.removeItem(`chat_${user.id}_${next.id}`);
    }
    navigate(`/speak-and-write/practice/${next.id}`);
  }

  if (mode === 'review') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#FF1500] to-[#FFD905] font-inter flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 shrink-0">
          <button onClick={() => setMode('summary')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#FFFDE6]" />
          </button>
          <h1 className="font-bold text-[15px] leading-[24px] text-[#FFFDE6] text-center flex-1">
            Review: {data.scenarioTitle}
          </h1>
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              showTranslations
                ? 'bg-[#FFFDE6] text-[#FF4D01]'
                : 'bg-white/20 text-[#FFFDE6] hover:bg-white/30'
            }`}
          >
            {showTranslations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showTranslations ? 'Hide English' : 'Show English'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="max-w-[600px] mx-auto flex flex-col gap-3">
            {data.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-300">
                  {msg.role === 'user' ? (
                    userAvatar ? (
                      <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#FF4D01] flex items-center justify-center text-white text-[11px] font-bold">
                        {(user?.user_metadata?.username || 'U')[0].toUpperCase()}
                      </div>
                    )
                  ) : charAvatar ? (
                    <img src={charAvatar} alt="AI" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-400" />
                  )}
                </div>
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'} gap-1 max-w-[75%]`}>
                  {showTranslations && msg.translation && (
                    <span lang="en" className="text-[14px] leading-[18px] text-[#1D4ED8]/80 font-medium">
                      {msg.translation}
                    </span>
                  )}
                  <div className={`px-4 py-3 ${
                    msg.role === 'ai'
                      ? 'bg-[#FFDD57] rounded-t-2xl rounded-bl-2xl rounded-br-none'
                      : 'bg-[#FFFDE6] rounded-t-2xl rounded-br-2xl rounded-bl-none'
                  }`}>
                    <p lang="es" className={`text-[15.6px] leading-[24px] ${
                      msg.role === 'ai' ? 'font-medium text-[#1F2937]' : 'text-[#372213]'
                    }`}>
                      {msg.text}
                    </p>
                    {msg.role === 'user' && msg.inputMode === 'voice' && (
                      <span className="text-[9px] text-[#372213] mt-1 block">🎙 spoken</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-inter"
      style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>

      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {confetti.map(p => (
            <div key={p.id} className="absolute top-0 rounded-sm"
              style={{
                left: `${p.left}%`, width: `${p.size}px`, height: `${p.size * 1.5}px`,
                backgroundColor: p.color,
                animation: `confettiFall ${2.5 + p.delay}s ease-in forwards`,
                animationDelay: `${p.delay * 0.3}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }} />
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

      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => navigate('/speak-and-write')}
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
          <Home className="w-5 h-5 text-[#372213]" />
        </button>
      </div>

      <div className="max-w-[605px] mx-auto pt-12 pb-20 px-4 flex flex-col items-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-[82px] h-[82px] bg-[#3BBC00] rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-[24px] leading-[36px] text-[#FFFDE6]">
              {t('roleplay.complete')}
            </h1>
            <p className="font-medium text-[18px] leading-[36px] text-[#FFFDE6]">
              {data.scenarioTitle}
            </p>
          </div>
        </div>

        <div className="w-full max-w-[448px] flex gap-4 mb-6">
          <div className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-md border border-[#E5E7EB]">
            <span className="text-[11.9px] text-[#372213] mb-1">{t('roleplay.xpEarned')}</span>
            <span className="font-bold text-[17px] text-[#16A34A]">+30 XP</span>
          </div>
          <div className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-md border border-[#E5E7EB]">
            <span className="text-[11.9px] text-[#372213] mb-1">{t('roleplay.duration')}</span>
            <span className="font-bold text-[17px] text-[#372213]">{timeStr}</span>
          </div>
        </div>

        <div className="w-full max-w-[632px] rounded-t-xl py-3 px-6 text-center"
          style={{ backgroundColor: scoreColor(evaluation.overallScore) }}>
          <p className="font-bold text-[18px] text-white">
            Accuracy Score: {evaluation.overallPct}% &mdash; {scoreLabel(evaluation.overallScore)}
          </p>
        </div>

        <div className="w-full max-w-[632px] bg-white rounded-b-xl p-6 shadow-md border border-[#E5E7EB] mb-8">
          <h3 className="font-bold text-[18.6px] text-[#372213] mb-4">Summary</h3>

          {evaluation.hasWriting && (
            <div className="mb-5">
              <button
                onClick={() => setWritingExpanded(!writingExpanded)}
                className="flex items-center justify-between w-full py-2 px-3 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors mb-2"
              >
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#372213]" />
                  <span className="font-bold text-[15.6px] text-[#372213]">Writing</span>
                </div>
                {writingExpanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
              </button>
              {writingExpanded && (
                <div className="flex flex-col gap-2">
                  {evaluation.writing.map((g) => (
                    <CriterionRow
                      key={g.name}
                      grade={g}
                      isExpanded={expandedCriterion === `w-${g.name}`}
                      onToggle={() => setExpandedCriterion(expandedCriterion === `w-${g.name}` ? null : `w-${g.name}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {evaluation.hasSpeaking && (
            <div className="mb-5">
              <button
                onClick={() => setSpeakingExpanded(!speakingExpanded)}
                className="flex items-center justify-between w-full py-2 px-3 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors mb-2"
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#372213]" />
                  <span className="font-bold text-[15.6px] text-[#372213]">Speaking</span>
                </div>
                {speakingExpanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
              </button>
              {speakingExpanded && (
                <div className="flex flex-col gap-2">
                  {evaluation.speaking.map((g) => (
                    <CriterionRow
                      key={g.name}
                      grade={g}
                      isExpanded={expandedCriterion === `s-${g.name}`}
                      onToggle={() => setExpandedCriterion(expandedCriterion === `s-${g.name}` ? null : `s-${g.name}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {evaluation.difficultWords.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-[#E5E7EB]">
              <h4 className="font-bold text-[15.6px] text-[#372213]">Difficult Words</h4>
              <p className="text-[12px] text-[#6B7280] -mt-1">Words where you made the most mistakes (icons show modality)</p>
              <div className="flex flex-wrap gap-3">
                {evaluation.difficultWords.map((dw, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="px-4 py-1.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-full flex items-center gap-2">
                      <span lang="es" className="font-medium text-[14px] text-[#372213] line-through">{dw.said}</span>
                      <span className="text-[12px] text-[#6B7280]">&rarr;</span>
                      <span lang="es" className="font-bold text-[14px] text-[#16A34A]">{dw.expected}</span>
                    </div>
                    <div className="flex gap-1">
                      {dw.modes.has('speaking') && (
                        <div className="bg-[#F3F4F6] rounded-full p-1" title="Mistake when speaking">
                          <Mic className="w-3.5 h-3.5 text-[#372213]" />
                        </div>
                      )}
                      {dw.modes.has('writing') && (
                        <div className="bg-[#F3F4F6] rounded-full p-1" title="Mistake when writing">
                          <Pencil className="w-3.5 h-3.5 text-[#372213]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-[632px] flex flex-col sm:flex-row gap-3">
          <button onClick={() => setMode('review')}
            className="flex-1 py-3 bg-white border-2 border-[#FF6200] rounded-xl font-bold text-[16px] text-[#FF6200] hover:bg-[#FFF7ED] transition-colors">
            {t('roleplay.reviewConversation')}
          </button>
          <button onClick={handleRetry}
            className="flex-1 py-3 bg-[#FF6200] border-2 border-[#FF6200] rounded-xl font-bold text-[16px] text-white hover:bg-[#e55800] transition-colors">
            {t('roleplay.retryScenario')}
          </button>
          <button onClick={handleNextScenario}
            className="flex-1 py-3 bg-[#FF6200] border-2 border-[#FF6200] rounded-xl font-bold text-[16px] text-white hover:bg-[#e55800] transition-colors">
            {t('roleplay.nextScenario')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CriterionRow({ grade, isExpanded, onToggle }: { grade: Grade; isExpanded: boolean; onToggle: () => void }) {
  const color = scoreColor(grade.score);
  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#FAFAFA] transition-colors">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <span className="font-medium text-[13.5px] text-[#372213] truncate">{grade.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5"
                fill={i < grade.score ? color : 'transparent'}
                color={i < grade.score ? color : '#D1D5DB'}
              />
            ))}
          </div>
          <span className="font-bold text-[12px] w-[16px] text-center" style={{ color }}>{grade.score}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />}
        </div>
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 bg-[#FAFAFA] border-t border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color }}>{scoreLabel(grade.score)}</span>
          </div>
          <p className="text-[12.5px] leading-[18px] text-[#374151]">{grade.feedback}</p>
        </div>
      )}
    </div>
  );
}

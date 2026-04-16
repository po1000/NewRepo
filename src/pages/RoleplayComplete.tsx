import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Home, Check, Mic, Pencil, ArrowLeft, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scenarios } from './SpeakAndWrite';

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
  word: string;
  correct: string;
  type: 'speaking' | 'writing';
}

interface RoleplayCompleteProps {
  onBack?: () => void; // kept for potential external use
}

// Spanish words that should have accents — maps unaccented → correct form
const ACCENT_MAP: Record<string, string> = {
  'cafe': 'café', 'tambien': 'también', 'como': 'cómo',
  'donde': 'dónde', 'que': 'qué', 'cuanto': 'cuánto',
  'esta': 'está', 'mas': 'más', 'aqui': 'aquí',
  'asi': 'así', 'despues': 'después', 'ademas': 'además',
  'quizas': 'quizás', 'facil': 'fácil', 'dificil': 'difícil',
};
const ACCENTED_FORMS = new Set(Object.values(ACCENT_MAP));

function analyzeMessages(messages: ReviewMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const writtenMsgs = userMessages.filter(m => m.inputMode === 'text');
  const spokenMsgs = userMessages.filter(m => m.inputMode === 'voice');

  const allText = userMessages.map(m => m.text).join(' ');
  const words = allText.toLowerCase().split(/\s+/).filter(Boolean);

  // --- Accent scoring: correct uses / total uses ---
  let accentCorrect = 0;
  let accentTotal = 0;
  const difficultWords: DifficultWord[] = [];

  for (const word of words) {
    const clean = word.replace(/[^a-záéíóúñü]/g, '');
    if (!clean) continue;
    // Case 1: user wrote unaccented form of a word that should have an accent
    const correctForm = ACCENT_MAP[clean];
    if (correctForm) {
      accentTotal++;
      // They wrote the unaccented version → wrong
      if (!difficultWords.find(d => d.word === clean && d.type === 'writing')) {
        difficultWords.push({ word: clean, correct: correctForm, type: 'writing' });
      }
      continue;
    }
    // Case 2: user wrote the correctly accented form
    if (ACCENTED_FORMS.has(clean)) {
      accentTotal++;
      accentCorrect++;
    }
  }

  // --- Punctuation scoring: only count punctuation the user actually used ---
  // Correct Spanish requires ¿...? and ¡...! pairs
  const questionCount = (allText.match(/\?/g) || []).length;
  const invertedQCount = (allText.match(/¿/g) || []).length;
  const exclaimCount = (allText.match(/!/g) || []).length;
  const invertedECount = (allText.match(/¡/g) || []).length;
  // punctTotal = number of times a user USED end-punctuation (? or !)
  // punctCorrect = of those, how many also had the inverted opener
  const punctTotal = questionCount + exclaimCount;
  const punctCorrect = Math.min(invertedQCount, questionCount) + Math.min(invertedECount, exclaimCount);

  const punctScore = punctTotal > 0 ? Math.round((punctCorrect / punctTotal) * 100) : null;
  const accentScore = accentTotal > 0 ? Math.round((accentCorrect / accentTotal) * 100) : null;

  // Grammar / spelling heuristic scores
  const grammarScore = writtenMsgs.length > 0 ? Math.min(95, 70 + writtenMsgs.length * 5) : null;
  const spellingScore = writtenMsgs.length > 0 ? Math.min(90, 60 + words.length) : null;

  // Speaking scores — only if user actually spoke
  const pronunciationScore = spokenMsgs.length > 0 ? Math.min(85, 65 + spokenMsgs.length * 8) : null;
  const accentSpeakScore = spokenMsgs.length > 0 ? Math.min(90, 70 + spokenMsgs.length * 7) : null;
  const grammarSpeakScore = spokenMsgs.length > 0 ? Math.min(88, 65 + spokenMsgs.length * 6) : null;

  // Add spoken long words as "difficult"
  if (spokenMsgs.length > 0) {
    const spokenWords = spokenMsgs.map(m => m.text.toLowerCase().split(/\s+/)).flat();
    const longWords = spokenWords.filter(w => w.length > 6);
    for (const w of longWords.slice(0, 2)) {
      const cleaned = w.replace(/[^a-záéíóúñü]/g, '');
      if (cleaned && !difficultWords.find(d => d.word === cleaned)) {
        difficultWords.push({ word: cleaned, correct: cleaned, type: 'speaking' });
      }
    }
  }

  return {
    writing: { spelling: spellingScore, punctuation: punctScore, accent: accentScore, grammar: grammarScore },
    speaking: { pronunciation: pronunciationScore, accent: accentSpeakScore, grammar: grammarSpeakScore },
    difficultWords: difficultWords.slice(0, 5),
    hasWriting: writtenMsgs.length > 0,
    hasSpeaking: spokenMsgs.length > 0,
  };
}

export function RoleplayComplete(_props: RoleplayCompleteProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scenarioSlug } = useParams();

  const data = (location.state as AnalysisData) || {
    scenarioId: scenarioSlug,
    scenarioTitle: 'Practice',
    messages: [],
    elapsed: 0,
    criteriaCount: 3,
  };

  const scenarioId = data.scenarioId || scenarioSlug;
  const scenario = scenarios.find(s => s.id === scenarioId);
  const charAvatar = scenario?.imageUrl;

  const storedAvatar = user?.id ? localStorage.getItem(`avatar_url_${user.id}`) : null;
  const userAvatar = storedAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const analysis = useMemo(() => analyzeMessages(data.messages), [data.messages]);

  const [mode, setMode] = useState<'summary' | 'review'>('summary');
  const [showTranslations, setShowTranslations] = useState(false);

  const minutes = Math.floor(data.elapsed / 60);
  const seconds = data.elapsed % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')} mins`;

  function handleRetry() {
    // Clear the saved conversation so they start fresh
    if (user?.id && scenarioId) {
      localStorage.removeItem(`chat_${user.id}_${scenarioId}`);
    }
    navigate(`/speak-and-write/${scenarioId}`);
  }

  function handleNextScenario() {
    // Pick a random different scenario
    const others = scenarios.filter(s => s.id !== scenarioId);
    if (others.length === 0) {
      navigate('/speak-and-write');
      return;
    }
    const next = others[Math.floor(Math.random() * others.length)];
    if (user?.id) {
      localStorage.removeItem(`chat_${user.id}_${next.id}`);
    }
    navigate(`/speak-and-write/${next.id}`);
  }

  // ============ REVIEW CONVERSATION MODE ============
  if (mode === 'review') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#FF1500] to-[#FFD905] font-inter flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 shrink-0">
          <button onClick={() => setMode('summary')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#FFFDE6]" />
          </button>
          <h1 className="font-bold text-[15px] leading-[24px] text-[#FFFDE6] text-center flex-1">
            Review: {data.scenarioTitle}
          </h1>
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            title={showTranslations ? 'Hide English translations' : 'Show English translations'}
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

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="max-w-[600px] mx-auto flex flex-col gap-3">
            {data.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                {/* Avatar */}
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

                {/* Message bubble */}
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
                      <span className="text-[9px] text-[#9CA3AF] mt-1 block">🎙 spoken</span>
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

  // ============ SUMMARY MODE ============
  const [writingExpanded, setWritingExpanded] = useState(true);
  const [speakingExpanded, setSpeakingExpanded] = useState(true);

  return (
    <div className="min-h-screen w-full font-inter"
      style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>

      {/* Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => navigate('/speak-and-write')}
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
          <Home className="w-5 h-5 text-[#372213]" />
        </button>
      </div>

      <div className="max-w-[605px] mx-auto pt-12 pb-20 px-4 flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-[82px] h-[82px] bg-[#3BBC00] rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-[24px] leading-[36px] text-[#FFFDE6]">
              Roleplay Complete!
            </h1>
            <p className="font-medium text-[18px] leading-[36px] text-[#FFFDE6]">
              {data.scenarioTitle}
            </p>
          </div>
        </div>

        {/* Stats Cards — white with shadow */}
        <div className="w-full max-w-[448px] flex gap-4 mb-6">
          <div className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-md border border-[#E5E7EB]">
            <span className="text-[11.9px] text-[#6B7280] mb-1">XP Earned</span>
            <span className="font-bold text-[17px] text-[#16A34A]">+30 XP</span>
          </div>
          <div className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-md border border-[#E5E7EB]">
            <span className="text-[11.9px] text-[#6B7280] mb-1">Duration</span>
            <span className="font-bold text-[17px] text-[#372213]">{timeStr}</span>
          </div>
        </div>

        {/* Summary Card — white with border */}
        <div className="w-full max-w-[632px] bg-white rounded-xl p-6 shadow-md border border-[#E5E7EB] mb-8">
          <h3 className="font-bold text-[18.6px] text-[#372213] mb-6">Summary</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Writing Column — expandable */}
            {analysis.hasWriting && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setWritingExpanded(!writingExpanded)}
                  className="flex items-center justify-between w-full py-2 px-3 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-[#372213]" />
                    <span className="font-bold text-[15.6px] text-[#372213]">Writing</span>
                  </div>
                  {writingExpanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>
                {writingExpanded && (
                  <div className="flex flex-col gap-3 pl-2 pt-1">
                    <ScoreRow label="Spelling" score={analysis.writing.spelling} />
                    <ScoreRow label="Punctuation" score={analysis.writing.punctuation} />
                    <ScoreRow label="Accent Characters" score={analysis.writing.accent} />
                    <ScoreRow label="Grammar & Structure" score={analysis.writing.grammar} />
                  </div>
                )}
              </div>
            )}

            {/* Speaking Column — expandable */}
            {analysis.hasSpeaking && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSpeakingExpanded(!speakingExpanded)}
                  className="flex items-center justify-between w-full py-2 px-3 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#372213]" />
                    <span className="font-bold text-[15.6px] text-[#372213]">Speaking</span>
                  </div>
                  {speakingExpanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>
                {speakingExpanded && (
                  <div className="flex flex-col gap-3 pl-2 pt-1">
                    <ScoreRow label="Pronunciation" score={analysis.speaking.pronunciation} />
                    <ScoreRow label="Accent" score={analysis.speaking.accent} />
                    <ScoreRow label="Grammar & Structure" score={analysis.speaking.grammar} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Difficult Words */}
          {analysis.difficultWords.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-[#E5E7EB]">
              <h4 className="font-bold text-[15.6px] text-[#372213]">Difficult Words</h4>
              <div className="flex flex-wrap gap-3">
                {analysis.difficultWords.map((dw, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="px-4 py-1.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-full flex items-center gap-2">
                      {dw.word !== dw.correct ? (
                        <>
                          <span lang="es" className="font-medium text-[15px] text-[#EF4444] line-through">{dw.word}</span>
                          <span className="font-medium text-[13px] text-[#6B7280]">&rarr;</span>
                          <span lang="es" className="font-bold text-[15px] text-[#DC2626]">{dw.correct}</span>
                        </>
                      ) : (
                        <span lang="es" className="font-medium text-[15px] text-[#DC2626]">{dw.word}</span>
                      )}
                    </div>
                    <div className="flex gap-1 bg-[#F3F4F6] rounded-full px-2 py-0.5">
                      {dw.type === 'speaking' ? (
                        <Mic className="w-3.5 h-3.5 text-[#6B7280]" />
                      ) : (
                        <Pencil className="w-3.5 h-3.5 text-[#6B7280]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions — 3 buttons, Next Scenario matches Retry color */}
        <div className="w-full max-w-[632px] flex flex-col sm:flex-row gap-3">
          <button onClick={() => setMode('review')}
            className="flex-1 py-3 bg-white border-2 border-[#FF6200] rounded-xl font-bold text-[16px] text-[#FF6200] hover:bg-[#FFF7ED] transition-colors">
            Review Conversation
          </button>
          <button onClick={handleRetry}
            className="flex-1 py-3 bg-[#FF6200] border-2 border-[#FF6200] rounded-xl font-bold text-[16px] text-white hover:bg-[#e55800] transition-colors">
            Retry Scenario
          </button>
          <button onClick={handleNextScenario}
            className="flex-1 py-3 bg-[#FF6200] border-2 border-[#FF6200] rounded-xl font-bold text-[16px] text-white hover:bg-[#e55800] transition-colors">
            Next Scenario
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number | null }) {
  if (score === null) {
    return (
      <div className="flex items-center justify-between">
        <span className="font-medium text-[14px] text-[#372213]">{label}</span>
        <span className="font-bold text-[14px] text-[#9CA3AF]">N/A</span>
      </div>
    );
  }
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-[14px] text-[#372213]">{label}</span>
      <span className="font-bold text-[14px]" style={{ color }}>{score}%</span>
    </div>
  );
}

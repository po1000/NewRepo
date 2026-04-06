import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Check, Mic, Pencil } from 'lucide-react';

interface AnalysisData {
  scenarioTitle: string;
  messages: { role: string; text: string; inputMode: string }[];
  elapsed: number;
  criteriaCount: number;
}

interface DifficultWord {
  word: string;
  type: 'speaking' | 'writing';
}

interface RoleplayCompleteProps {
  onBack?: () => void;
}

// Basic analysis of user messages
function analyzeMessages(messages: { role: string; text: string; inputMode: string }[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  const writtenMsgs = userMessages.filter(m => m.inputMode === 'text');
  const spokenMsgs = userMessages.filter(m => m.inputMode === 'voice');

  const allText = userMessages.map(m => m.text).join(' ');
  const words = allText.toLowerCase().split(/\s+/).filter(Boolean);

  // Accent check: common words that should have accents
  const shouldHaveAccent: Record<string, string> = {
    'cafe': 'cafe', 'tambien': 'tambien', 'como': 'como',
    'donde': 'donde', 'que': 'que', 'cuanto': 'cuanto',
    'esta': 'esta', 'mas': 'mas', 'aqui': 'aqui',
  };

  let accentErrors = 0;
  let totalAccentChecked = 0;
  const difficultWords: DifficultWord[] = [];

  for (const word of words) {
    const clean = word.replace(/[^a-záéíóúñü]/g, '');
    if (shouldHaveAccent[clean]) {
      totalAccentChecked++;
      if (!clean.match(/[áéíóúñ]/)) {
        accentErrors++;
        if (!difficultWords.find(d => d.word === clean)) {
          difficultWords.push({ word: clean, type: 'writing' });
        }
      }
    }
  }

  // Punctuation check (¿ and ¡ usage)
  const questionCount = (allText.match(/\?/g) || []).length;
  const invertedQCount = (allText.match(/¿/g) || []).length;
  const exclaimCount = (allText.match(/!/g) || []).length;
  const invertedECount = (allText.match(/¡/g) || []).length;
  const punctScore = questionCount > 0
    ? Math.round((invertedQCount / Math.max(questionCount, 1)) * 100)
    : (exclaimCount > 0 ? Math.round((invertedECount / Math.max(exclaimCount, 1)) * 100) : 85);

  // Accent score
  const accentScore = totalAccentChecked > 0
    ? Math.round(((totalAccentChecked - accentErrors) / totalAccentChecked) * 100)
    : 90;

  // Grammar score (generous default)
  const grammarScore = Math.min(95, 70 + userMessages.length * 5);

  // Spelling score
  const spellingScore = Math.min(90, 60 + words.length);

  // Speaking scores (if any spoken messages)
  const pronunciationScore = spokenMsgs.length > 0 ? Math.min(85, 65 + spokenMsgs.length * 8) : 0;
  const accentSpeakScore = spokenMsgs.length > 0 ? Math.min(90, 70 + spokenMsgs.length * 7) : 0;
  const grammarSpeakScore = spokenMsgs.length > 0 ? Math.min(88, 65 + spokenMsgs.length * 6) : 0;

  // Add some difficult spoken words
  if (spokenMsgs.length > 0) {
    const spokenWords = spokenMsgs.map(m => m.text.toLowerCase().split(/\s+/)).flat();
    const longWords = spokenWords.filter(w => w.length > 5);
    for (const w of longWords.slice(0, 2)) {
      if (!difficultWords.find(d => d.word === w)) {
        difficultWords.push({ word: w.replace(/[^a-záéíóúñü]/g, ''), type: 'speaking' });
      }
    }
  }

  const hasWriting = writtenMsgs.length > 0;
  const hasSpeaking = spokenMsgs.length > 0;

  const overallScore = Math.round(
    (spellingScore + punctScore + accentScore + grammarScore +
     (hasSpeaking ? (pronunciationScore + accentSpeakScore + grammarSpeakScore) / 3 : 0)) /
    (hasWriting && hasSpeaking ? 5 : 4)
  );

  return {
    writing: { spelling: spellingScore, punctuation: punctScore, accent: accentScore, grammar: grammarScore },
    speaking: hasSpeaking
      ? { pronunciation: pronunciationScore, accent: accentSpeakScore, grammar: grammarSpeakScore }
      : null,
    overallScore,
    difficultWords: difficultWords.slice(0, 5),
    hasWriting,
    hasSpeaking,
  };
}

export function RoleplayComplete({ onBack }: RoleplayCompleteProps) {
  const location = useLocation();
  const data = (location.state as AnalysisData) || {
    scenarioTitle: 'Practice',
    messages: [],
    elapsed: 0,
    criteriaCount: 3,
  };

  const analysis = useMemo(() => analyzeMessages(data.messages), [data.messages]);

  const minutes = Math.floor(data.elapsed / 60);
  const seconds = data.elapsed % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')} mins`;

  return (
    <div className="min-h-screen w-full font-inter"
      style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>

      {/* Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={onBack}
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

        {/* Stats Cards */}
        <div className="w-full max-w-[448px] flex gap-4 mb-6">
          <div className="flex-1 bg-[#FFFDE6] rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[11.9px] text-[#6B7280] mb-1">XP Earned</span>
            <span className="font-bold text-[17px] text-[#16A34A]">+30 XP</span>
          </div>
          <div className="flex-1 bg-[#FFFDE6] rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[11.9px] text-[#6B7280] mb-1">Duration</span>
            <span className="font-bold text-[17px] text-[#372213]">{timeStr}</span>
          </div>
        </div>

        {/* Accuracy Score */}
        <div className="mb-6">
          <h2 className="font-bold text-[20px] text-white">
            Accuracy Score: {analysis.overallScore}%
          </h2>
        </div>

        {/* Summary Card */}
        <div className="w-full max-w-[632px] bg-[#FFFDE6] rounded-xl p-6 shadow-sm mb-8">
          <h3 className="font-bold text-[18.6px] text-[#372213] mb-6">Summary</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            {/* Writing Column */}
            {analysis.hasWriting && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Pencil className="w-4.5 h-4.5 text-[#372213]" />
                  <span className="font-bold text-[15.6px] text-[#372213]">Writing</span>
                </div>
                <ScoreRow label="Spelling" score={analysis.writing.spelling} />
                <ScoreRow label="Punctuation" score={analysis.writing.punctuation} />
                <ScoreRow label="Accent Characters" score={analysis.writing.accent} />
                <ScoreRow label="Grammar & Structure" score={analysis.writing.grammar} />
              </div>
            )}

            {/* Speaking Column */}
            {analysis.hasSpeaking && analysis.speaking && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-4.5 h-4.5 text-[#372213]" />
                  <span className="font-bold text-[15.6px] text-[#372213]">Speaking</span>
                </div>
                <ScoreRow label="Pronunciation" score={analysis.speaking.pronunciation} />
                <ScoreRow label="Accent" score={analysis.speaking.accent} />
                <ScoreRow label="Grammar & Structure" score={analysis.speaking.grammar} />
              </div>
            )}
          </div>

          {/* Difficult Words */}
          {analysis.difficultWords.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-[15.6px] text-[#372213]">Difficult Words</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.difficultWords.map((dw, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="px-4 py-1 bg-[#FFE0A7] rounded-full">
                      <span className="font-medium text-[15px] text-[#372213]">{dw.word}</span>
                    </div>
                    <div className="flex gap-1 bg-[#FFE0A7] rounded-full px-2 py-0.5">
                      {dw.type === 'speaking' ? (
                        <Mic className="w-3.5 h-3.5 text-[#372213]" />
                      ) : (
                        <Pencil className="w-3.5 h-3.5 text-[#372213]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="w-full max-w-[450px] flex flex-col gap-2">
          <div className="flex gap-4">
            <button onClick={onBack}
              className="flex-1 py-3 bg-[#FF6200] border-2 border-[#FFFDE6] rounded-xl font-bold text-[18px] text-[#FFFDE6] hover:bg-[#e55800] transition-colors">
              Retry Scenario
            </button>
            <button onClick={onBack}
              className="flex-1 py-3 bg-[#FFFDE6] border-2 border-[#FFFDE6] rounded-xl font-bold text-[18px] text-[#FF4D01] hover:bg-white transition-colors">
              Next Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-[14px] text-[#372213]">{label}</span>
      <span className="font-bold text-[14px]" style={{ color }}>{score}%</span>
    </div>
  );
}

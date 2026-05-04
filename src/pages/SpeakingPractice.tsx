import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Star, Mic, Volume2, Check, Send, Square, Eye, EyeOff, Trash2, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { scenarios, PracticeScenario } from './SpeakAndWrite';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import { findSpellingError } from '../lib/spelling';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  translation?: string;
  inputMode: 'text' | 'voice';
}

const CHARACTER_INFO: Record<string, { avatar: string; gender: 'male' | 'female'; name: string; role: string }> = {
  'ordering-cafe': {
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    gender: 'male',
    name: 'Carlos',
    role: 'a friendly waiter at a cosy cafe in Madrid',
  },
  'presentation-time': {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    gender: 'female',
    name: 'Maria',
    role: 'a friendly person at a language exchange event',
  },
  'asking-directions': {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    gender: 'female',
    name: 'Lucia',
    role: 'a helpful local in central Madrid',
  },
  'shopping-market': {
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    gender: 'male',
    name: 'Miguel',
    role: 'a cheerful fruit and vegetable vendor at an outdoor market in Barcelona',
  },
};

const MALE_VOICE_NAMES = ['Jorge', 'Diego', 'Juan', 'Andres', 'Miguel', 'Pablo', 'Raul', 'Enrique'];
const FEMALE_VOICE_NAMES = ['Paulina', 'Monica', 'Lucia', 'Marisol', 'Helena', 'Sabina', 'Conchita', 'Maria', 'Elena'];

function speakSpanish(text: string, gender: 'male' | 'female' = 'female') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = gender === 'female' ? 0.9 : 0.88;
  utterance.pitch = gender === 'female' ? 1.15 : 0.55;
  const voices = window.speechSynthesis.getVoices();
  const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
  const systemVoices = spanishVoices.filter(v => !v.name.includes('Google'));

  let best: SpeechSynthesisVoice | undefined;
  if (gender === 'male') {
    best = systemVoices.find(v => MALE_VOICE_NAMES.some(n => v.name.includes(n)));
    if (!best) best = systemVoices.find(v => !FEMALE_VOICE_NAMES.some(n => v.name.includes(n)));
    if (!best) best = systemVoices[0] || spanishVoices[0];
  } else {
    best = systemVoices.find(v => FEMALE_VOICE_NAMES.some(n => v.name.includes(n)));
    if (!best) best = systemVoices[0] || spanishVoices[0];
  }
  if (best) utterance.voice = best;
  window.speechSynthesis.speak(utterance);
}

async function getAiResponse(
  scenario: PracticeScenario,
  charName: string,
  charRole: string,
  chatMessages: ChatMessage[],
): Promise<{ es: string; en: string }> {
  const systemPrompt = `You are ${charName}, ${charRole}. You are having a real conversation with someone who is practising their Spanish.

Scenario: ${scenario.context}

Rules:
- Respond naturally in Spanish, exactly like a real native speaker would in this situation
- Keep each response to 1-3 sentences (natural conversation length)
- Use simple vocabulary suitable for a beginner-level Spanish learner
- Stay in character at all times and keep the conversation moving forward
- Be warm, patient, and encouraging
- If the user writes in English, gently encourage them to try in Spanish but still respond helpfully
- Never break character or mention that you are an AI

CRITICAL: You must respond with ONLY a valid JSON object, no other text.
Format: {"es": "your Spanish response here", "en": "English translation of your response here"}`;

  const history = chatMessages.map(m => ({
    role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
    content: m.text,
  }));

  const { data, error } = await supabase.functions.invoke('roleplay-chat', {
    body: { messages: history, systemPrompt },
  });

  if (error) throw error;

  const content = typeof data === 'string' ? data : data?.content;
  if (!content) throw new Error('Empty AI response');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.es) return { es: parsed.es, en: parsed.en || '' };
  }

  return { es: content.trim(), en: '' };
}

function SpellCheckedText({ text }: { text: string }) {
  const tokens = text.split(/(\s+)/);
  return (
    <>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        const result = findSpellingError(token);
        if (!result) return <span key={i}>{token}</span>;
        return (
          <span
            key={i}
            className="spelling-error relative group cursor-help"
            style={{ textDecoration: 'underline wavy red', textDecorationThickness: '1.5px', textUnderlineOffset: '3px' }}
          >
            {token}
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#1F2937] text-white text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Did you mean &apos;{result.suggestion}&apos; ({result.translation})?
            </span>
          </span>
        );
      })}
    </>
  );
}

export function SpeakingPractice() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scenario = scenarios.find(s => s.id === scenarioId) || scenarios[0];
  usePageTitle(scenario.title);
  const { t } = useLanguage();
  const storageKey = `chat_${user?.id}_${scenario.id}`;
  const charInfo = CHARACTER_INFO[scenario.id] || CHARACTER_INFO['ordering-cafe'];
  const storedAvatar = user?.id ? localStorage.getItem(`avatar_url_${user.id}`) : null;
  const userAvatar = storedAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      id: 'ai-0',
      role: 'ai',
      text: scenario.aiFirstMessage,
      translation: scenario.aiFirstMessageEn,
      inputMode: 'text',
    }];
  });

  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [criteriaComplete, setCriteriaComplete] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [showHelp, setShowHelp] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const spokenMsgIds = useRef<Set<string>>(new Set());
  const gotResultRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'ai' && !spokenMsgIds.current.has(lastMsg.id)) {
      spokenMsgIds.current.add(lastMsg.id);
      setTimeout(() => speakSpanish(lastMsg.text, charInfo.gender), 200);
    }
  }, [messages, charInfo.gender]);

  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    const allUserText = messages.filter(m => m.role === 'user').map(m => m.text.toLowerCase()).join(' ');
    const completed = new Set<string>();
    for (const c of scenario.criteria) {
      if (c.keywords.some(kw => allUserText.includes(kw.toLowerCase()))) {
        completed.add(c.id);
      }
    }
    setCriteriaComplete(completed);
  }, [messages]);

  function handleFinishRoleplay() {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    navigate(`/speak-and-write/${scenario.id}/complete`, {
      state: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        messages: messages.map(m => ({
          role: m.role,
          text: m.text,
          translation: m.translation,
          inputMode: m.inputMode,
        })),
        elapsed,
        criteriaCount: scenario.criteria.length,
      },
    });
  }

  const sendMessage = useCallback(async (text: string, mode: 'text' | 'voice') => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      inputMode: mode,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setTextInput('');
    setIsTyping(true);

    try {
      const response = await getAiResponse(scenario, charInfo.name, charInfo.role, updatedMessages);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: response.es,
        translation: response.en,
        inputMode: 'text',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: 'Lo siento, hubo un error. Intente de nuevo.',
        translation: 'Sorry, there was an error. Please try again.',
        inputMode: 'text',
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, scenario, charInfo]);

  function cleanupAudio() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    audioCtxRef.current = null;
    analyserRef.current = null;
    mediaStreamRef.current = null;
  }

  function drawWaveform() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 40;
    const gap = 3;
    const barWidth = (canvas.width - (barCount - 1) * gap) / barCount;
    const step = Math.floor(bufLen / barCount);

    for (let i = 0; i < barCount; i++) {
      const val = data[i * step] / 255;
      const barH = Math.max(3, val * canvas.height * 0.85);
      const x = i * (barWidth + gap);
      const y = (canvas.height - barH) / 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 2);
      ctx.fill();
    }

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }

  async function startRecording() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }
    setVoiceTranscript(null);
    gotResultRef.current = false;
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;
      drawWaveform();
    } catch {}

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      gotResultRef.current = true;
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      setIsRecording(false);
      cleanupAudio();
    };
    recognition.onerror = () => {
      gotResultRef.current = false;
      setIsRecording(false);
      cleanupAudio();
    };
    recognition.onend = () => {
      if (!gotResultRef.current) {
        setIsRecording(false);
        cleanupAudio();
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
  }

  function discardRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setVoiceTranscript(null);
    cleanupAudio();
  }

  function sendVoiceTranscript() {
    if (voiceTranscript) {
      sendMessage(voiceTranscript, 'voice');
      setVoiceTranscript(null);
    }
  }

  function reRecord() {
    setVoiceTranscript(null);
    startRecording();
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FF1500] to-[#FFD905] font-inter flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button onClick={() => navigate('/speak-and-write')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#FFFDE6]" />
        </button>
        <h1 className="font-bold text-[14px] leading-[24px] text-[#FFFDE6] text-center flex-1">
          {scenario.title}
        </h1>
        <button
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Report issue"
        >
          <Flag className="w-5 h-5 text-[#FFFDE6]" />
        </button>
      </div>

      <div className="max-w-[600px] mx-auto px-4 mb-3 shrink-0">
        <div className="border border-[#FFFDE6] rounded-xl p-3">
          <p className="text-[13.5px] leading-[20px] text-[#FFFDE6]">
            <span className="font-bold">Context:</span> {scenario.context}{' '}
            <span className="font-bold">Include the criteria below to pass.</span>
          </p>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 mb-3 shrink-0">
        <div className="flex flex-wrap gap-2">
          {scenario.criteria.map(c => (
            <div key={c.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
              criteriaComplete.has(c.id) ? 'bg-white border-[#3BBC00]' : 'bg-white/90 border-[#E5E7EB]'
            }`}>
              {criteriaComplete.has(c.id) ? (
                <Check className="w-3.5 h-3.5 text-[#3BBC00]" strokeWidth={3} />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D1D5DB]" />
              )}
              <span className={`text-[13px] font-medium ${criteriaComplete.has(c.id) ? 'text-[#3BBC00]' : 'text-[#374151]'}`}>
                {c.text}
              </span>
            </div>
          ))}

          <button onClick={() => setShowHelp(!showHelp)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6200] border border-[#FFFDE6] rounded-full hover:bg-[#e55800] transition-colors">
            <Star className="w-3 h-3 text-[#FFFDE6]" />
            <span className="font-bold text-[13px] text-[#FFFDE6]">{t('speakWrite.help')}</span>
          </button>
        </div>

        {showHelp && (
          <div className="mt-2 bg-[#FFFDE6] rounded-xl p-3 text-[12px] text-[#372213] leading-[18px]">
            <p className="font-bold mb-1">Hint:</p>
            <p>Try using phrases like: {scenario.criteria.map(c => `"${c.keywords[0]}"`).join(', ')}. Speak naturally in Spanish!</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-[600px] mx-auto flex flex-col gap-3 pb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-300">
                {msg.role === 'user' ? (
                  userAvatar ? (
                    <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#FF4D01] flex items-center justify-center text-white text-[11px] font-bold">
                      {(user?.user_metadata?.username || 'U')[0].toUpperCase()}
                    </div>
                  )
                ) : (
                  <img src={charInfo.avatar} alt={charInfo.name} className="w-full h-full object-cover" />
                )}
              </div>

              <div className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'} gap-1 max-w-[75%]`}>
                {showTranslations && msg.translation && (
                  <span lang="en" className="text-[14.6px] leading-[20px] text-[#1D4ED8]/80 font-medium">
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
                    {msg.role === 'user' ? <SpellCheckedText text={msg.text} /> : msg.text}
                  </p>
                  {msg.role === 'user' && msg.inputMode === 'voice' && (
                    <span className="text-[9px] text-[#372213] mt-1 block">🎙 spoken</span>
                  )}
                </div>
                {msg.role === 'ai' && (
                  <button
                    onClick={() => speakSpanish(msg.text, charInfo.gender)}
                    className="flex items-center gap-1 text-[10px] text-white/70 hover:text-white transition-colors mt-0.5"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-row-reverse items-end gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <img src={charInfo.avatar} alt={charInfo.name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#FFDD57] rounded-t-2xl rounded-bl-2xl rounded-br-none px-4 py-3">
                <div className="flex gap-1.5 items-center h-[22px]">
                  <div className="w-2 h-2 bg-[#1F2937]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#1F2937]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#1F2937]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {criteriaComplete.size === scenario.criteria.length && messages.filter(m => m.role === 'user').length >= 2 && (
        <div className="shrink-0 px-4 pb-2">
          <div className="max-w-[600px] mx-auto bg-[#FFFDE6] border-2 border-[#3BBC00] rounded-xl p-3 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#3BBC00]">All objectives met!</span>
              <span className="text-[11px] text-[#372213]">Keep chatting or finish to see your evaluation.</span>
            </div>
            <button onClick={handleFinishRoleplay}
              className="px-4 py-2 bg-[#3BBC00] text-white rounded-lg font-bold text-[13px] hover:bg-[#2EA000] transition-colors shrink-0">
              Finish Roleplay
            </button>
          </div>
        </div>
      )}

      <div className="shrink-0 px-4 pb-4">
        <div className="max-w-[600px] mx-auto flex items-center gap-2 mb-2">
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            title={showTranslations ? 'Hide English translations' : 'Show English translations'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold transition-colors ${
              showTranslations
                ? 'bg-[#FFFDE6] text-[#FF4D01]'
                : 'bg-white/20 text-[#FFFDE6] hover:bg-white/30'
            }`}
          >
            {showTranslations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTranslations ? t('speakWrite.hideEnglish') : t('speakWrite.showEnglish')}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(storageKey);
              setCriteriaComplete(new Set());
              setMessages([{
                id: 'ai-0',
                role: 'ai',
                text: scenario.aiFirstMessage,
                translation: scenario.aiFirstMessageEn,
                inputMode: 'text',
              }]);
              setTextInput('');
              setVoiceTranscript(null);
            }}
            title="Clear chat"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold bg-white/20 text-[#FFFDE6] hover:bg-white/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t('speakWrite.clearChat')}
          </button>
        </div>
        <div className="max-w-[600px] mx-auto flex gap-2">
          <div className="relative w-20 h-11 bg-[#F3F4F6] rounded-lg flex items-center p-1 shrink-0">
            <div className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-all duration-200"
              style={{ left: inputMode === 'voice' ? '4px' : 'calc(50%)' }} />
            <button onClick={() => setInputMode('voice')}
              className="relative z-10 flex-1 h-full flex items-center justify-center">
              <Mic className={`w-5 h-5 transition-colors ${inputMode === 'voice' ? 'text-[#FF6200]' : 'text-[#9CA3AF]'}`} />
            </button>
            <button onClick={() => setInputMode('text')}
              className="relative z-10 flex-1 h-full flex items-center justify-center">
              <span className={`text-lg font-bold transition-colors ${inputMode === 'text' ? 'text-[#FF6200]' : 'text-[#9CA3AF]'}`}>T</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {inputMode === 'text' ? (
              <div className="flex gap-2">
                <input type="text" value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(textInput, 'text')}
                  placeholder="Escribe en español..."
                  className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[16px] text-[#372213] focus:outline-none focus:border-[#FF6200]"
                />
                <button onClick={() => sendMessage(textInput, 'text')}
                  disabled={!textInput.trim()}
                  className="w-11 h-11 bg-[#372213] rounded-xl flex items-center justify-center hover:bg-[#2a1a0f] transition-colors shrink-0 disabled:opacity-40">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : voiceTranscript ? (
              <div className="flex flex-col gap-2">
                <div className="bg-[#FFFDE6] rounded-xl px-4 py-3 border-2 border-[#FF6200]">
                  <p className="text-[13px] font-semibold text-[#372213] mb-1">Your transcript:</p>
                  <p lang="es" className="text-[16px] text-[#372213] leading-[24px]">{voiceTranscript}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={discardRecording}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-white/80 text-[#EF4444] border border-[#FCA5A5] hover:bg-[#FEE2E2] transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium text-[13px]">Discard</span>
                  </button>
                  <button onClick={reRecord}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-white/80 text-[#372213] border border-[#D1D5DB] hover:bg-gray-100 transition-colors">
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-medium text-[13px]">Re-record</span>
                  </button>
                  <button onClick={sendVoiceTranscript}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-[#372213] text-white hover:bg-[#2a1a0f] transition-colors">
                    <Send className="w-4 h-4" />
                    <span className="font-medium text-[13px]">Send</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {isRecording ? (
                  <>
                    <button onClick={discardRecording}
                      className="w-11 h-11 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white transition-colors shrink-0 border border-[#FCA5A5]">
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </button>
                    <div className="flex-1 h-11 rounded-xl overflow-hidden bg-[#FF4D01]">
                      <canvas ref={canvasRef} className="w-full h-full" />
                    </div>
                    <button onClick={stopRecording}
                      className="px-5 py-3 bg-[#FFFDE6] rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors shrink-0">
                      <Check className="w-5 h-5 text-[#22C55E]" />
                      <span className="font-bold text-[14px] text-[#22C55E]">Done</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startRecording}
                    className="flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 bg-[#FFFDE6] text-[#372213] hover:bg-white transition-colors">
                    <Mic className="w-5 h-5 text-[#FF4D01]" />
                    <span className="font-medium text-[16px]">{t('speakWrite.tapToSpeak')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

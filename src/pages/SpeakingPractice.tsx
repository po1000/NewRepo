import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Star, Mic, Volume2, Check, Send, Square, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scenarios, PracticeScenario } from './SpeakAndWrite';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  translation?: string;
  inputMode: 'text' | 'voice';
}

// Character avatar mapping per scenario
const CHARACTER_AVATARS: Record<string, string> = {
  'ordering-cafe': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=80&h=80&fit=crop&crop=face',
  'presentation-time': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  'asking-directions': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'shopping-market': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
};

function speakSpanish(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es'));
  if (esVoice) utterance.voice = esVoice;
  window.speechSynthesis.speak(utterance);
}

// Simple AI response generator
function generateAiResponse(scenario: PracticeScenario, userMessages: ChatMessage[]): { es: string; en: string } {
  const msgCount = userMessages.filter(m => m.role === 'user').length;
  const lastUserMsg = userMessages[userMessages.length - 1]?.text.toLowerCase() || '';

  if (scenario.id === 'ordering-cafe') {
    if (msgCount <= 1) return { es: '¡Muy bien! ¿Algo mas? Tenemos churros frescos y tostadas.', en: 'Very good! Anything else? We have fresh churros and toast.' };
    if (msgCount === 2) return { es: 'Perfecto. ¿Quiere algo de beber tambien?', en: 'Perfect. Would you like something to drink too?' };
    if (lastUserMsg.includes('gracias') || lastUserMsg.includes('nada mas')) return { es: '¡Marchando! Gracias a usted. ¡Que aproveche!', en: 'Coming right up! Thank you. Enjoy your meal!' };
    return { es: '¿Algo mas que le pueda servir?', en: 'Anything else I can get you?' };
  }
  if (scenario.id === 'presentation-time') {
    if (msgCount <= 1) return { es: '¡Encantada! ¿De donde eres?', en: 'Nice to meet you! Where are you from?' };
    if (msgCount === 2) return { es: '¡Que interesante! ¿Y que te gusta hacer en tu tiempo libre?', en: 'How interesting! And what do you like to do in your free time?' };
    return { es: '¡Genial! A mi tambien me gusta mucho. ¡Ha sido un placer conocerte!', en: 'Great! I really like that too. It\'s been a pleasure meeting you!' };
  }
  if (scenario.id === 'asking-directions') {
    if (msgCount <= 1) return { es: 'Claro, la estacion de metro esta cerca. Siga recto por esta calle y luego gire a la derecha.', en: 'Of course, the metro station is nearby. Go straight down this street then turn right.' };
    if (msgCount === 2) return { es: 'Si, esta a unos cinco minutos caminando. Vera la señal azul del metro.', en: 'Yes, it\'s about five minutes walking. You\'ll see the blue metro sign.' };
    return { es: '¡De nada! ¡Buen viaje!', en: 'You\'re welcome! Have a good trip!' };
  }
  if (msgCount <= 1) return { es: 'Las naranjas estan a dos euros el kilo. Las manzanas a uno cincuenta. ¿Que le pongo?', en: 'Oranges are two euros per kilo. Apples are one fifty. What shall I get you?' };
  if (msgCount === 2) return { es: 'Aqui tiene. ¿Necesita algo mas?', en: 'Here you go. Do you need anything else?' };
  if (lastUserMsg.includes('tarjeta') || lastUserMsg.includes('pagar')) return { es: 'Si, aceptamos tarjeta y efectivo. Son tres euros cincuenta en total.', en: 'Yes, we accept card and cash. It\'s three euros fifty in total.' };
  return { es: '¡Gracias por su compra! ¡Hasta luego!', en: 'Thanks for your purchase! See you later!' };
}

interface SpeakingPracticeProps {
  onBack?: () => void;
  onRoleplayComplete?: () => void;
}

export function SpeakingPractice({ onBack }: SpeakingPracticeProps) {
  const { scenarioSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scenario = scenarios.find(s => s.id === scenarioSlug) || scenarios[0];
  const storageKey = `chat_${user?.id}_${scenario.id}`;
  const characterAvatar = CHARACTER_AVATARS[scenario.id] || CHARACTER_AVATARS['ordering-cafe'];
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Load saved messages from localStorage
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
  const [criteriaComplete, setCriteriaComplete] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [showHelp, setShowHelp] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const spokenMsgIds = useRef<Set<string>>(new Set());

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // TTS: speak new AI messages when they first appear
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'ai' && !spokenMsgIds.current.has(lastMsg.id)) {
      spokenMsgIds.current.add(lastMsg.id);
      // Small delay so the message renders first
      setTimeout(() => speakSpanish(lastMsg.text), 200);
    }
  }, [messages]);

  // Preload voices
  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }, []);

  // Check criteria
  useEffect(() => {
    const allUserText = messages.filter(m => m.role === 'user').map(m => m.text.toLowerCase()).join(' ');
    const completed = new Set<string>();
    for (const c of scenario.criteria) {
      if (c.keywords.some(kw => allUserText.includes(kw.toLowerCase()))) {
        completed.add(c.id);
      }
    }
    setCriteriaComplete(completed);

    if (completed.size === scenario.criteria.length && messages.filter(m => m.role === 'user').length >= 2) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'user') {
        setTimeout(() => {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          navigate(`/speak-and-write/${scenario.id}/complete`, {
            state: {
              scenarioTitle: scenario.title,
              messages: messages.map(m => ({ role: m.role, text: m.text, inputMode: m.inputMode })),
              elapsed,
              criteriaCount: scenario.criteria.length,
            },
          });
        }, 2500);
      }
    }
  }, [messages]);

  const sendMessage = useCallback((text: string, mode: 'text' | 'voice') => {
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

    // Show typing indicator then respond
    setIsTyping(true);
    setTimeout(() => {
      const response = generateAiResponse(scenario, updatedMessages);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: response.es,
        translation: response.en,
        inputMode: 'text',
      }]);
    }, 2000);
  }, [messages, scenario]);

  function startRecording() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript, 'voice');
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FF1500] to-[#FFD905] font-inter flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#FFFDE6]" />
        </button>
        <h1 className="font-bold text-[14px] leading-[24px] text-[#FFFDE6] text-center flex-1">
          {scenario.title}
        </h1>
        <button
          onClick={() => setShowTranslations(!showTranslations)}
          title={showTranslations ? 'Hide translations' : 'Show translations'}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {showTranslations ? (
            <EyeOff className="w-5 h-5 text-[#FFFDE6]" />
          ) : (
            <Eye className="w-5 h-5 text-[#FFFDE6]" />
          )}
        </button>
      </div>

      {/* Context Box */}
      <div className="max-w-[600px] mx-auto px-4 mb-3 shrink-0">
        <div className="border border-[#FFFDE6] rounded-xl p-3">
          <p className="text-[11.5px] leading-[18px] text-[#FFFDE6]">
            <span className="font-bold">Context:</span> {scenario.context}{' '}
            <span className="font-bold">Include the criteria below to pass.</span>
          </p>
        </div>
      </div>

      {/* Criteria chips */}
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
              <span className={`text-[11px] font-medium ${criteriaComplete.has(c.id) ? 'text-[#3BBC00]' : 'text-[#374151]'}`}>
                {c.text}
              </span>
            </div>
          ))}

          <button onClick={() => setShowHelp(!showHelp)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6200] border border-[#FFFDE6] rounded-full hover:bg-[#e55800] transition-colors">
            <Star className="w-3 h-3 text-[#FFFDE6]" />
            <span className="font-bold text-[11px] text-[#FFFDE6]">Help</span>
          </button>
        </div>

        {showHelp && (
          <div className="mt-2 bg-[#FFFDE6] rounded-xl p-3 text-[12px] text-[#372213] leading-[18px]">
            <p className="font-bold mb-1">Hint:</p>
            <p>Try using phrases like: {scenario.criteria.map(c => `"${c.keywords[0]}"`).join(', ')}. Speak naturally in Spanish!</p>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-[600px] mx-auto flex flex-col gap-3 pb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
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
                ) : (
                  <img src={characterAvatar} alt="Character" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Message bubble */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'} gap-1 max-w-[75%]`}>
                {/* Translation above (toggle) */}
                {showTranslations && msg.translation && (
                  <span className="text-[10px] leading-[14px] text-white/80">
                    {msg.translation}
                  </span>
                )}
                <div className={`px-4 py-3 ${
                  msg.role === 'ai'
                    ? 'bg-[#FFDD57] rounded-t-2xl rounded-bl-2xl rounded-br-none'
                    : 'bg-[#FFFDE6] rounded-t-2xl rounded-br-2xl rounded-bl-none'
                }`}>
                  <p className={`text-[13.6px] leading-[22px] ${
                    msg.role === 'ai' ? 'font-medium text-[#1F2937]' : 'text-[#372213]'
                  }`}>
                    {msg.text}
                  </p>
                  {msg.role === 'user' && msg.inputMode === 'voice' && (
                    <span className="text-[9px] text-[#9CA3AF] mt-1 block">🎙 spoken</span>
                  )}
                </div>
                {/* Replay audio button for AI messages */}
                {msg.role === 'ai' && (
                  <button
                    onClick={() => speakSpanish(msg.text)}
                    className="flex items-center gap-1 text-[10px] text-white/70 hover:text-white transition-colors mt-0.5"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex flex-row-reverse items-end gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <img src={characterAvatar} alt="Character" className="w-full h-full object-cover" />
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

      {/* Input Area */}
      <div className="shrink-0 px-4 pb-4">
        <div className="max-w-[600px] mx-auto flex gap-2">
          {/* Mode toggle */}
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

          <div className="flex-1 flex gap-2">
            {inputMode === 'text' ? (
              <input type="text" value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(textInput, 'text')}
                placeholder="Escribe en espanol..."
                className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[14px] text-[#372213] focus:outline-none focus:border-[#FF6200]"
              />
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  isRecording ? 'bg-[#FF4D01] text-white' : 'bg-[#FFFDE6] text-[#372213]'
                }`}>
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span className="font-medium text-[14px]">Listening... tap to stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-[#FF4D01]" />
                    <span className="font-medium text-[14px]">Tap to speak</span>
                  </>
                )}
              </button>
            )}

            {inputMode === 'text' && (
              <button onClick={() => sendMessage(textInput, 'text')}
                disabled={!textInput.trim()}
                className="w-11 h-11 bg-[#372213] rounded-xl flex items-center justify-center hover:bg-[#2a1a0f] transition-colors shrink-0 disabled:opacity-40">
                <Send className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

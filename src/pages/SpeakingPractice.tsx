import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Star, Mic, Volume2, Check, Send, Square, Eye, EyeOff, Trash2, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scenarios, PracticeScenario } from './SpeakAndWrite';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  translation?: string;
  inputMode: 'text' | 'voice';
}

// Character info: avatar (human face) + gender for voice matching
const CHARACTER_INFO: Record<string, { avatar: string; gender: 'male' | 'female'; name: string }> = {
  'ordering-cafe': {
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    gender: 'male',
    name: 'Carlos',
  },
  'presentation-time': {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    gender: 'female',
    name: 'Maria',
  },
  'asking-directions': {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    gender: 'male',
    name: 'Pedro',
  },
  'shopping-market': {
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    gender: 'female',
    name: 'Elena',
  },
};

function speakSpanish(text: string, gender: 'male' | 'female' = 'female') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.92;
  utterance.pitch = gender === 'female' ? 1.1 : 0.95;
  const voices = window.speechSynthesis.getVoices();

  // Gender-specific voice preference
  const femalePreferred = ['Paulina', 'Monica', 'Lucia', 'Microsoft Helena', 'Microsoft Sabina', 'Google español'];
  const malePreferred = ['Jorge', 'Diego', 'Juan', 'Microsoft Pablo', 'Google español'];
  const preferred = gender === 'female' ? femalePreferred : malePreferred;

  let best = voices.find(v =>
    preferred.some(p => v.name.includes(p)) && v.lang.startsWith('es')
  );
  if (!best) best = voices.find(v => v.lang === 'es-ES');
  if (!best) best = voices.find(v => v.lang.startsWith('es'));
  if (best) utterance.voice = best;
  window.speechSynthesis.speak(utterance);
}

// Contextual AI response generator — reacts to what the user actually said
function generateAiResponse(scenario: PracticeScenario, userMessages: ChatMessage[]): { es: string; en: string } {
  const msgCount = userMessages.filter(m => m.role === 'user').length;
  const lastUserMsg = userMessages[userMessages.length - 1]?.text.toLowerCase() || '';

  if (scenario.id === 'ordering-cafe') {
    // React to greetings
    if (lastUserMsg.match(/hola|buenos|buenas/))
      return { es: '¡Hola! Bienvenido a nuestro cafe. ¿Que le apetece hoy? Tenemos churros frescos, tostadas y zumo natural.', en: 'Hello! Welcome to our cafe. What would you like today? We have fresh churros, toast and fresh juice.' };
    // React to ordering with "me pone"
    if (lastUserMsg.includes('me pone'))
      return { es: '¡Marchando! Excelente eleccion. ¿Quiere algo mas? Tenemos un cafe con leche muy rico.', en: 'Coming right up! Excellent choice. Would you like anything else? We have a very good cafe con leche.' };
    // React to specific food/drink mentions
    if (lastUserMsg.match(/cafe|café|churro|tostada|zumo|agua|leche|té|te /))
      return { es: '¡Muy buena eleccion! ¿Algo mas que le pueda ofrecer?', en: 'Very good choice! Anything else I can offer you?' };
    // React to thanks / ending
    if (lastUserMsg.match(/gracias|nada mas|nada más|eso es todo/))
      return { es: '¡Perfecto! Son cuatro euros cincuenta. ¡Que aproveche!', en: 'Perfect! That\'s four euros fifty. Enjoy your meal!' };
    // React to price question
    if (lastUserMsg.match(/cuanto|cuánto|cuesta|precio/))
      return { es: 'El cafe con leche cuesta dos euros, los churros uno cincuenta y las tostadas uno setenta y cinco.', en: 'The cafe con leche costs two euros, churros one fifty and toast one seventy-five.' };
    // Fallback by message count
    if (msgCount <= 1) return { es: '¡Muy bien! ¿Algo mas? Tenemos churros frescos y tostadas.', en: 'Very good! Anything else? We have fresh churros and toast.' };
    if (msgCount === 2) return { es: 'Perfecto. ¿Quiere algo de beber tambien?', en: 'Perfect. Would you like something to drink too?' };
    return { es: '¿Algo mas que le pueda servir?', en: 'Anything else I can get you?' };
  }

  if (scenario.id === 'presentation-time') {
    if (lastUserMsg.match(/me llamo|soy |mi nombre/))
      return { es: '¡Encantada de conocerte! ¿De donde eres? Yo soy de Sevilla.', en: 'Nice to meet you! Where are you from? I\'m from Seville.' };
    if (lastUserMsg.match(/soy de|vengo de/))
      return { es: '¡Que interesante! Me encantaria visitar. ¿Y que te gusta hacer en tu tiempo libre?', en: 'How interesting! I\'d love to visit. And what do you like to do in your free time?' };
    if (lastUserMsg.match(/me gusta|me encanta|me interesa/))
      return { es: '¡A mi tambien me gusta mucho eso! Es un placer hablar contigo. ¿Vienes mucho a estos eventos?', en: 'I really like that too! It\'s a pleasure talking to you. Do you come to these events often?' };
    if (msgCount <= 1) return { es: '¡Encantada! Cuentame un poco sobre ti. ¿De donde eres?', en: 'Nice to meet you! Tell me a bit about yourself. Where are you from?' };
    if (msgCount === 2) return { es: '¡Que bien! ¿Y que te gusta hacer?', en: 'How nice! And what do you like to do?' };
    return { es: '¡Ha sido un placer conocerte! Espero verte de nuevo pronto.', en: 'It\'s been a pleasure meeting you! I hope to see you again soon.' };
  }

  if (scenario.id === 'asking-directions') {
    if (lastUserMsg.match(/donde|dónde/))
      return { es: 'Claro, la estacion de metro esta muy cerca. Siga recto por esta calle unos doscientos metros y luego gire a la derecha. La vera enseguida.', en: 'Of course, the metro station is very close. Go straight down this street about two hundred meters then turn right. You\'ll see it right away.' };
    if (lastUserMsg.match(/gracias|muchas gracias/))
      return { es: '¡De nada! Si se pierde, pregunte a cualquiera. La gente aqui es muy amable. ¡Buen viaje!', en: 'You\'re welcome! If you get lost, ask anyone. People here are very friendly. Have a good trip!' };
    if (lastUserMsg.match(/entiendo|comprendo|vale|de acuerdo/))
      return { es: '¡Perfecto! Esta a unos cinco minutos caminando. Vera la señal azul del metro. ¡Suerte!', en: 'Perfect! It\'s about five minutes walking. You\'ll see the blue metro sign. Good luck!' };
    if (lastUserMsg.match(/lejos|cerca|minuto|tiempo/))
      return { es: 'No esta lejos, solo cinco minutos a pie. El camino es muy facil.', en: 'It\'s not far, only five minutes on foot. The way is very easy.' };
    if (msgCount <= 1) return { es: 'Claro, ¿a donde quiere ir? ¿Al metro, al centro, o a otro lugar?', en: 'Of course, where do you want to go? To the metro, the center, or somewhere else?' };
    return { es: '¡Espero que encuentre su camino! ¡Hasta luego!', en: 'I hope you find your way! See you later!' };
  }

  // shopping-market
  if (lastUserMsg.match(/cuanto|cuánto|cuesta|vale|precio/))
    return { es: 'Las naranjas estan a dos euros el kilo. Las manzanas a uno cincuenta. Y los platanos a uno ochenta. ¿Que le pongo?', en: 'Oranges are two euros per kilo. Apples are one fifty. And bananas are one eighty. What shall I get you?' };
  if (lastUserMsg.match(/quiero|me da|pongo|llevo|kilo/))
    return { es: '¡Aqui tiene! Son unas naranjas muy dulces, las mejores de Valencia. ¿Necesita algo mas?', en: 'Here you go! These are very sweet oranges, the best from Valencia. Do you need anything else?' };
  if (lastUserMsg.match(/pagar|tarjeta|efectivo|cambio/))
    return { es: 'Si, aceptamos tarjeta y efectivo. Son tres euros cincuenta en total. ¿Le doy una bolsa?', en: 'Yes, we accept card and cash. It\'s three euros fifty in total. Shall I give you a bag?' };
  if (lastUserMsg.match(/gracias|nada|eso es todo/))
    return { es: '¡Gracias por su compra! Vuelva cuando quiera. ¡Hasta luego!', en: 'Thanks for your purchase! Come back anytime. See you later!' };
  if (msgCount <= 1) return { es: 'Las naranjas estan a dos euros el kilo. Las manzanas a uno cincuenta. ¿Que le pongo?', en: 'Oranges are two euros per kilo. Apples are one fifty. What shall I get you?' };
  if (msgCount === 2) return { es: 'Aqui tiene. ¿Necesita algo mas?', en: 'Here you go. Do you need anything else?' };
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
  const charInfo = CHARACTER_INFO[scenario.id] || CHARACTER_INFO['ordering-cafe'];
  const storedAvatar = user?.id ? localStorage.getItem(`avatar_url_${user.id}`) : null;
  const userAvatar = storedAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

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
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null); // transcript preview
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

  // TTS: speak new AI messages when they first appear (gender-matched voice)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'ai' && !spokenMsgIds.current.has(lastMsg.id)) {
      spokenMsgIds.current.add(lastMsg.id);
      setTimeout(() => speakSpanish(lastMsg.text, charInfo.gender), 200);
    }
  }, [messages, charInfo.gender]);

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
    setVoiceTranscript(null);
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Show transcript for review instead of sending immediately
      setVoiceTranscript(transcript);
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

  function discardRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setVoiceTranscript(null);
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
                  <img src={charInfo.avatar} alt={charInfo.name} className="w-full h-full object-cover" />
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

          {/* Typing indicator */}
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

      {/* Input Area */}
      <div className="shrink-0 px-4 pb-4">
        <div className="max-w-[600px] mx-auto flex items-center gap-2 mb-2">
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

          <div className="flex-1 flex flex-col gap-2">
            {inputMode === 'text' ? (
              <div className="flex gap-2">
                <input type="text" value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(textInput, 'text')}
                  placeholder="Escribe en espanol..."
                  className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[14px] text-[#372213] focus:outline-none focus:border-[#FF6200]"
                />
                <button onClick={() => sendMessage(textInput, 'text')}
                  disabled={!textInput.trim()}
                  className="w-11 h-11 bg-[#372213] rounded-xl flex items-center justify-center hover:bg-[#2a1a0f] transition-colors shrink-0 disabled:opacity-40">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : voiceTranscript ? (
              /* Transcript preview — user can send, discard, or re-record */
              <div className="flex flex-col gap-2">
                <div className="bg-[#FFFDE6] rounded-xl px-4 py-3 border-2 border-[#FF6200]">
                  <p className="text-[11px] font-semibold text-[#6B7280] mb-1">Your transcript:</p>
                  <p className="text-[14px] text-[#372213] leading-[22px]">{voiceTranscript}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={discardRecording}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-white/80 text-[#EF4444] border border-[#FCA5A5] hover:bg-[#FEE2E2] transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium text-[13px]">Discard</span>
                  </button>
                  <button onClick={reRecord}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-white/80 text-[#6B7280] border border-[#D1D5DB] hover:bg-gray-100 transition-colors">
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
              /* Recording / tap to speak */
              <div className="flex gap-2">
                {isRecording ? (
                  <>
                    <button onClick={discardRecording}
                      className="w-11 h-11 bg-white/80 rounded-xl flex items-center justify-center hover:bg-white transition-colors shrink-0 border border-[#FCA5A5]">
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </button>
                    <div className="flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 bg-[#FF4D01] text-white">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      <span className="font-medium text-[14px]">Listening...</span>
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
                    <span className="font-medium text-[14px]">Tap to speak</span>
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

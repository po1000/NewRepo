import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Star, Mic, Play, Check, Send, Square } from 'lucide-react';
import { scenarios, PracticeScenario } from './SpeakAndWrite';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  translation?: string;
  inputMode: 'text' | 'voice';
}

// Simple AI response generator (pattern-based, swap for real API later)
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
  // shopping-market
  if (msgCount <= 1) return { es: 'Las naranjas estan a dos euros el kilo. Las manzanas a uno cincuenta. ¿Que le pongo?', en: 'Oranges are two euros per kilo. Apples are one fifty. What shall I get you?' };
  if (msgCount === 2) return { es: 'Aqui tiene. ¿Necesita algo mas?', en: 'Here you go. Do you need anything else?' };
  if (lastUserMsg.includes('tarjeta') || lastUserMsg.includes('pagar')) return { es: 'Si, aceptamos tarjeta y efectivo. Son tres euros cincuenta en total.', en: 'Yes, we accept card and cash. It\'s three euros fifty in total.' };
  return { es: '¡Gracias por su compra! ¡Hasta luego!', en: 'Thanks for your purchase! See you later!' };
}

// Basic Spanish text analysis
function analyzeText(text: string) {
  const issues: { word: string; type: 'spelling' | 'accent' | 'grammar' }[] = [];

  // Check missing accents on common words
  const accentMap: Record<string, string> = {
    'cafe': 'cafe', 'tambien': 'tambien', 'esta': 'esta', 'como': 'como',
    'donde': 'donde', 'que': 'que', 'cuanto': 'cuanto',
  };
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[^a-záéíóúñü]/g, '');
    if (accentMap[clean] && !clean.match(/[áéíóúñ]/)) {
      issues.push({ word: clean, type: 'accent' });
    }
  }

  return issues;
}

interface SpeakingPracticeProps {
  onBack?: () => void;
  onRoleplayComplete?: () => void;
}

export function SpeakingPractice({ onBack, onRoleplayComplete }: SpeakingPracticeProps) {
  const { scenarioSlug } = useParams();
  const navigate = useNavigate();

  const scenario = scenarios.find(s => s.id === scenarioSlug) || scenarios[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'ai-0',
      role: 'ai',
      text: scenario.aiFirstMessage,
      translation: scenario.aiFirstMessageEn,
      inputMode: 'text',
    },
  ]);

  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [criteriaComplete, setCriteriaComplete] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [showHelp, setShowHelp] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check criteria after each user message
  useEffect(() => {
    const allUserText = messages.filter(m => m.role === 'user').map(m => m.text.toLowerCase()).join(' ');
    const completed = new Set<string>();

    for (const c of scenario.criteria) {
      if (c.keywords.some(kw => allUserText.includes(kw.toLowerCase()))) {
        completed.add(c.id);
      }
    }

    setCriteriaComplete(completed);

    // Auto-complete when all criteria met after some messages
    if (completed.size === scenario.criteria.length && messages.filter(m => m.role === 'user').length >= 2) {
      // Give a final AI response then navigate
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'user') {
        setTimeout(() => {
          const allUserMessages = messages.filter(m => m.role === 'user');
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const analysisData = {
            scenarioTitle: scenario.title,
            messages: messages.map(m => ({ role: m.role, text: m.text, inputMode: m.inputMode })),
            elapsed,
            criteriaCount: scenario.criteria.length,
          };

          navigate(`/speak-and-write/${scenario.id}/complete`, { state: analysisData });
        }, 1500);
      }
    }
  }, [messages]);

  function sendMessage(text: string, mode: 'text' | 'voice') {
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

    // Generate AI response after short delay
    setTimeout(() => {
      const response = generateAiResponse(scenario, updatedMessages);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: response.es,
        translation: response.en,
        inputMode: 'text',
      }]);
    }, 800);
  }

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

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

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
        <button onClick={() => {}} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
              criteriaComplete.has(c.id)
                ? 'bg-white border-[#3BBC00]'
                : 'bg-white/90 border-[#E5E7EB]'
            }`}>
              {criteriaComplete.has(c.id) ? (
                <Check className="w-3.5 h-3.5 text-[#3BBC00]" strokeWidth={3} />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D1D5DB]" />
              )}
              <span className={`text-[11px] font-medium ${
                criteriaComplete.has(c.id) ? 'text-[#3BBC00]' : 'text-[#374151]'
              }`}>
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
            <div key={msg.id} className={`flex flex-col ${msg.role === 'ai' ? 'items-end' : 'items-start'} gap-1`}>
              {/* Translation above */}
              {msg.translation && (
                <span className="text-[10px] leading-[14px] text-white/80 max-w-[80%]">
                  {msg.translation}
                </span>
              )}
              <div className={`max-w-[80%] px-4 py-3 ${
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
            </div>
          ))}
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

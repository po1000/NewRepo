import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { STORAGE_URL } from '../lib/storage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';

export interface ScenarioCriteria {
  id: string;
  text: string;
  keywords: string[]; // words/phrases user must include to satisfy
}

export interface PracticeScenario {
  id: string;
  level: string;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
  context: string;
  criteria: ScenarioCriteria[];
  aiFirstMessage: string;
  aiFirstMessageEn: string;
}

export const scenarios: PracticeScenario[] = [
  {
    id: 'ordering-cafe',
    level: 'Beginner',
    title: 'Ordering at a Cafe',
    description: 'Order food and drinks from a Madrid cafe.',
    imageUrl: `${STORAGE_URL}/roleplay/image%2024-2.png`,
    color: '#FFA600',
    context: 'You are at a cosy cafe in Madrid. The waiter greets you warmly. Order a drink and something to eat using polite Spanish. Try to use the phrases from Unit 3: Day at the Cafe.',
    criteria: [
      { id: 'greet', text: 'Greet the waiter', keywords: ['hola', 'buenos', 'buenas'] },
      { id: 'use-me-pone', text: 'Use "me pone" to order', keywords: ['me pone'] },
      { id: 'complete-order', text: 'Complete your order', keywords: ['cafe', 'café', 'churro', 'tostada', 'zumo', 'agua', 'leche', 'te', 'té'] },
    ],
    aiFirstMessage: '¡Hola! Bienvenido. ¿Que le puedo servir?',
    aiFirstMessageEn: 'Hello! Welcome. What can I get for you?',
  },
  {
    id: 'presentation-time',
    level: 'Beginner',
    title: 'Presentation Time',
    description: 'Introduce yourself then informally present your interests.',
    imageUrl: `${STORAGE_URL}/roleplay/image%2024-3.png`,
    color: '#39AFE6',
    context: 'You are meeting new classmates at a language exchange. Introduce yourself, say where you are from, and share what you like to do. Use vocabulary from Unit 1: Hola & Putting Names to Faces.',
    criteria: [
      { id: 'name', text: 'Say your name', keywords: ['me llamo', 'soy', 'mi nombre'] },
      { id: 'origin', text: 'Say where you are from', keywords: ['soy de', 'vengo de'] },
      { id: 'interests', text: 'Share an interest or hobby', keywords: ['me gusta', 'me encanta', 'me interesa'] },
    ],
    aiFirstMessage: '¡Hola! Soy Maria. ¿Como te llamas? Cuentame un poco sobre ti.',
    aiFirstMessageEn: 'Hi! I\'m Maria. What\'s your name? Tell me a bit about yourself.',
  },
  {
    id: 'asking-directions',
    level: 'Beginner',
    title: 'Asking for Directions',
    description: 'Navigate Madrid by asking locals for help.',
    imageUrl: `${STORAGE_URL}/roleplay/image%2024.png`,
    color: '#0135D4',
    context: 'You are lost in the centre of Madrid and need to find the nearest metro station. Ask a local for directions politely. Use phrases from Unit 4: Map Mode.',
    criteria: [
      { id: 'ask-where', text: 'Ask where something is', keywords: ['donde', 'dónde'] },
      { id: 'thank', text: 'Thank them', keywords: ['gracias', 'muchas gracias'] },
      { id: 'understand', text: 'Confirm you understand', keywords: ['entiendo', 'comprendo', 'vale', 'de acuerdo'] },
    ],
    aiFirstMessage: '¡Buenas tardes! Parece que esta perdido. ¿Le puedo ayudar?',
    aiFirstMessageEn: 'Good afternoon! You seem lost. Can I help you?',
  },
  {
    id: 'shopping-market',
    level: 'Beginner',
    title: 'Shopping at a Market',
    description: 'Buy fresh produce and practice bargaining in Spanish.',
    imageUrl: `${STORAGE_URL}/roleplay/image%2024-1.png`,
    color: '#27A700',
    context: 'You are at a vibrant outdoor market in Barcelona. Ask about prices, buy some fruit, and practise basic transaction phrases. Use vocab from Unit 4: Tap and Go.',
    criteria: [
      { id: 'ask-price', text: 'Ask the price', keywords: ['cuanto', 'cuánto', 'precio', 'cuesta', 'vale'] },
      { id: 'buy-item', text: 'Buy an item', keywords: ['quiero', 'me da', 'pongo', 'llevo'] },
      { id: 'pay', text: 'Ask about payment', keywords: ['pagar', 'tarjeta', 'efectivo', 'cambio'] },
    ],
    aiFirstMessage: '¡Buenos dias! Tenemos frutas frescas hoy. ¿Que le interesa?',
    aiFirstMessageEn: 'Good morning! We have fresh fruit today. What are you interested in?',
  },
];

interface SpeakAndWriteProps {
  onNavigateBack?: () => void;
  onScenarioClick?: (scenarioTitle: string) => void;
  onCultureClick?: () => void;
  onGrammarClick?: () => void;
  onCommunityClick?: () => void;
}

export function SpeakAndWrite({
  onScenarioClick,
}: SpeakAndWriteProps) {
  usePageTitle('Speak & Write');
  const { t, showInstructions } = useLanguage();
  return (
    <PageLayout>

      <div className="max-w-[684px] mx-auto px-8 pt-4 pb-20">
        <div className="flex flex-col gap-2 mb-6 text-center">
          <h1 className="font-bold text-[25.5px] leading-[36px] text-[#372213]">
            Practice Speaking and Writing
          </h1>
          <p className="text-[13.6px] leading-[24px] text-[#6B7280]">
            Practise real-world conversations with interactive scenarios.
          </p>
        </div>
        {showInstructions && (
          <div className="bg-white/80 rounded-[12px] px-4 py-3 shadow-sm border border-[#F97316]/20 mb-6">
            <p className="font-inter text-[13px] leading-[20px] text-[#6B7280]">
              {t('instructions.speakWrite')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id}
              className="bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onScenarioClick?.(scenario.id)}>

              <div className="w-full h-[138px] relative" style={{ backgroundColor: scenario.color }}>
                <img src={scenario.imageUrl} alt={scenario.title}
                  className="w-full h-full object-cover rounded-t-lg p-1.5" />
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="inline-flex">
                  <span className="bg-[#FFF9B5] text-[#FF4D01] font-bold text-[10.2px] leading-[16px] px-2 py-1 rounded-full">
                    {scenario.level}
                  </span>
                </div>
                <h3 className="font-bold text-[15.3px] leading-[28px] text-[#372213]">{scenario.title}</h3>
                <p className="text-[11.9px] leading-[20px] text-[#4B5563]">{scenario.description}</p>

                {/* Criteria preview */}
                <div className="flex flex-col gap-1">
                  {scenario.criteria.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D1D5DB]" />
                      <span className="text-[10.5px] text-[#6B7280]">{c.text}</span>
                    </div>
                  ))}
                </div>

                <button className="flex flex-row items-center gap-2 mt-2 group">
                  <span className="font-medium text-[11.9px] leading-[20px] text-[#FF4D01] group-hover:underline">
                    Start Practice
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FF4D01]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

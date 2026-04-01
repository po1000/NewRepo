import React, { useState } from 'react';
import { ArrowLeft, Flag, Star, ArrowRight, Mic, Play } from 'lucide-react';
interface SpeakingPracticeProps {
  onBack?: () => void;
  onRoleplayComplete?: () => void;
}
export function SpeakingPractice({
  onBack,
  onRoleplayComplete
}: SpeakingPracticeProps) {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FF1500] to-[#FFD905] font-inter">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          
          <ArrowLeft className="w-6 h-6 text-[#FFFDE6]" />
        </button>
        <h1 className="font-inter font-bold text-[13.6px] leading-[24px] text-[#FFFDE6] text-center flex-1">
          Ordering at a Café
        </h1>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Flag className="w-6 h-6 text-[#FFFDE6]" />
          </button>
          <button
            onClick={onRoleplayComplete}
            className="w-8 h-8 bg-[#FFFDE6] rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            
            <ArrowRight className="w-4 h-4 text-[#FF4D01]" />
          </button>
        </div>
      </div>

      {/* Lesson Link Badge */}
      <div className="flex justify-center mb-4">
        <div className="px-3 py-1 rounded-2xl bg-[#E90042]">
          <span className="font-inter font-medium italic text-[13.6px] leading-[24px] text-[#FFFDE6]">
            See A1 &gt; Unit 3 &gt; Day at the Café
          </span>
        </div>
      </div>

      {/* Context Box */}
      <div className="max-w-[600px] mx-auto px-4 mb-6">
        <div className="border border-[#FFFDE6] rounded-xl p-4">
          <p className="font-inter text-[11.9px] leading-[20px] text-[#FFFDE6]">
            <span className="font-bold">Context:</span> In a Madrid café, speak
            with the waiter and order what you like!{' '}
            <span className="font-bold">
              Include the specified criteria below, to pass
            </span>{' '}
            this exercise.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-[605px] mx-auto px-4">
        <div className="p-4 mb-4">
          {/* Timestamp */}
          <div className="text-center mb-4">
            <span className="font-inter text-[11.2px] leading-[16px] text-white">
              Mon 23 Mar 11:52am
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex flex-col gap-2">
            {/* Waiter Message 1 */}
            <div className="flex flex-col items-end gap-1">
              <span className="font-inter text-[10.2px] leading-[16px] text-white">
                Hello! Welcome. What can I get for you?
              </span>
              <div className="bg-[#FFDD57] border border-[#FFDD57] rounded-t-2xl rounded-bl-2xl rounded-br-none px-4 py-3 max-w-[80%]">
                <p className="font-inter font-medium text-[13.6px] leading-[24px] text-[#1F2937]">
                  ¡Hola! Bienvenido. ¿Qué le puedo servir?
                </p>
              </div>
            </div>

            {/* User Message */}
            <div className="flex flex-col items-start gap-1">
              <span className="font-inter text-[10.2px] leading-[16px] text-white">
                Hello, I want a coffee with milk, please.
              </span>
              <div className="bg-[#FFFDE6] rounded-t-2xl rounded-br-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
                <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
                  Hola, quiero un café con leche, por favor.
                </p>
              </div>
            </div>

            {/* Waiter Message 2 */}
            <div className="flex flex-col items-end gap-1">
              <span className="font-inter text-[10.2px] leading-[16px] text-white">
                Anything else? We have fresh churros today.
              </span>
              <div className="bg-[#FFDD57] border border-[#FFDD57] rounded-t-2xl rounded-bl-2xl rounded-br-none px-4 py-3 max-w-[80%]">
                <p className="font-inter font-medium text-[13.6px] leading-[24px] text-[#1F2937]">
                  ¿Algo más? Tenemos churros frescos hoy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-full hover:bg-gray-50 transition-colors">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <span className="font-inter text-[11.9px] leading-[20px] text-[#374151]">
              Use "me pone"
            </span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-full hover:bg-gray-50 transition-colors">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <span className="font-inter text-[11.9px] leading-[20px] text-[#374151]">
              Complete order
            </span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-full hover:bg-gray-50 transition-colors">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <span className="font-inter text-[11.9px] leading-[20px] text-[#374151]">
              Ask a question
            </span>
          </button>
          <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#FF6200] border border-[#FFFDE6] rounded-lg hover:bg-[#e55800] transition-colors">
            <Star className="w-3.5 h-3.5 text-[#FFFDE6]" />
            <span className="font-inter font-bold text-[14px] leading-[20px] text-[#FFFDE6]">
              Help
            </span>
          </button>
        </div>

        {/* Input Area */}
        <div className="flex gap-2 pb-6">
          <div className="relative w-20 h-11 bg-[#F3F4F6] rounded-lg flex items-center p-1 shrink-0">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-all duration-200 ease-in-out"
              style={{
                left: inputMode === 'voice' ? '4px' : 'calc(50%)'
              }} />
            
            <button
              onClick={() => setInputMode('voice')}
              className="relative z-10 flex-1 h-full flex items-center justify-center transition-colors">
              
              <Mic
                className={`w-5 h-5 transition-colors ${inputMode === 'voice' ? 'text-[#FF6200]' : 'text-[#9CA3AF]'}`} />
              
            </button>
            <button
              onClick={() => setInputMode('text')}
              className="relative z-10 flex-1 h-full flex items-center justify-center transition-colors">
              
              <span
                className={`text-lg font-bold transition-colors ${inputMode === 'text' ? 'text-[#FF6200]' : 'text-[#9CA3AF]'}`}>
                
                T
              </span>
            </button>
          </div>
          <div className="flex-1 flex gap-2">
            {inputMode === 'text' ?
            <input
              type="text"
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl font-inter text-[16px] leading-[24px] text-[#372213] focus:outline-none focus:border-[#FF6200]" /> :


            <div className="flex-1 px-4 py-2 bg-[#FFFDE6] border border-[#E5E7EB] rounded-xl flex items-center gap-3">
                <button className="w-8 h-8 bg-[#FF4D01] rounded-full flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-[#FFFDE6] ml-0.5" />
                </button>
                <div className="flex-1 flex items-center gap-1 h-6">
                  {/* Decorative Waveform */}
                  {[...Array(15)].map((_, i) =>
                <div
                  key={i}
                  className="w-1.5 bg-[#FF4D01] rounded-full"
                  style={{
                    height: `${Math.max(20, Math.random() * 100)}%`,
                    opacity: i < 8 ? 1 : 0.3
                  }} />

                )}
                </div>
                <span className="font-inter font-medium text-[12px] text-[#372213] shrink-0">
                  0:04
                </span>
              </div>
            }
            <button className="w-11 h-11 bg-[#372213] rounded-xl flex items-center justify-center hover:bg-[#2a1a0f] transition-colors shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>);

}
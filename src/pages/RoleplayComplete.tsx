import React from 'react';
import { Home, Check } from 'lucide-react';
interface RoleplayCompleteProps {
  onBack?: () => void;
}
export function RoleplayComplete({ onBack }: RoleplayCompleteProps) {
  return (
    <div
      className="min-h-screen w-full font-inter"
      style={{
        background:
        'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)'
      }}>
      
      {/* Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onBack}
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
          
          <Home className="w-5 h-5 text-[#372213]" />
        </button>
      </div>

      <div className="max-w-[605px] mx-auto pt-12 pb-20 px-4 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-[82px] h-[82px] bg-[#3BBC00] rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div className="text-center">
            <h1 className="font-inter font-bold text-[24px] leading-[36px] text-[#FFFDE6]">
              Roleplay Complete!
            </h1>
            <p className="font-inter font-medium text-[18px] leading-[36px] text-[#FFFDE6]">
              Ordering at a café
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="w-full max-w-[448px] flex gap-4 mb-4">
          <div className="flex-1 bg-[#FFFDE6] rounded-xl p-4 flex flex-col items-center justify-center border border-[#FFFDE6] shadow-sm">
            <span className="font-inter text-[11.9px] leading-[20px] text-[#6B7280] mb-1">
              XP Earned
            </span>
            <span className="font-inter font-bold text-[17px] leading-[28px] text-[#16A34A]">
              +30 XP
            </span>
          </div>
          <div className="flex-1 bg-[#FFFDE6] rounded-xl p-4 flex flex-col items-center justify-center border border-[#FFFDE6] shadow-sm">
            <span className="font-inter text-[11.9px] leading-[20px] text-[#6B7280] mb-1">
              Roleplay Duration
            </span>
            <span className="font-inter font-bold text-[17px] leading-[28px] text-[#372213]">
              6:45 mins
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="w-full max-w-[448px] flex gap-4 mb-6">
          {/* Badge 1 */}
          <div className="flex-1 bg-[#FFFDE6] rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-[#FEF9C3] rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-inter font-bold text-[13.6px] leading-[24px] text-[#372213]">
                  Scholar Badge
                </span>
                <span className="font-inter text-[11.9px] leading-[20px] text-[#6B7280]">
                  3/5
                </span>
              </div>
              <div className="w-full h-2 bg-[#EBEBEB] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '60%',
                    background:
                    'linear-gradient(180deg, #FFCC00 0%, #F6FF00 100%)'
                  }} />
                
              </div>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex-1 bg-[#FFFDE6] rounded-xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
            <img
              src="/512-167.png"
              alt="Confetti"
              className="absolute -top-4 -left-4 w-[110px] h-[110px] object-cover opacity-50 pointer-events-none" />
            
            <img
              src="/512-174.png"
              alt="Badge"
              className="w-11 h-11 rounded-full shrink-0 relative z-10" />
            
            <div className="flex-1 flex flex-col items-start gap-1 relative z-10">
              <span className="font-inter font-bold text-[13.6px] leading-[24px] text-[#372213]">
                Scholar Badge
              </span>
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-[#3BBC00] rounded-full">
                  <span className="font-inter font-medium text-[10px] leading-[24px] text-[#FFFDE6]">
                    Complete!
                  </span>
                </div>
                <Check className="w-3.5 h-3.5 text-[#3BBC00]" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy Score */}
        <div className="mb-4">
          <h2 className="font-inter font-bold text-[20px] leading-[24px] text-white">
            Accuracy Score: 89%
          </h2>
        </div>

        {/* Summary Card */}
        <div className="w-full max-w-[632px] bg-[#FFFDE6] rounded-xl p-6 border border-[#FFFDE6] shadow-sm mb-8">
          <h3 className="font-inter font-bold text-[18.6px] leading-[24px] text-[#372213] mb-6">
            Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            {/* Writing Column */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/535-289.svg"
                  alt="Writing"
                  className="w-4.5 h-4.5" />
                
                <span className="font-inter font-bold text-[15.6px] leading-[24px] text-[#372213]">
                  Writing
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                  Spelling 48%
                </span>
                <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                  Punctuation 90%
                </span>
                <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                  Accent Characters 90%
                </span>
                <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                  Grammar & Sentence Structure 90%
                </span>
              </div>
            </div>

            {/* Speaking Column */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/535-285.svg"
                  alt="Speaking"
                  className="w-4.5 h-4.5" />
                
                <span className="font-inter font-bold text-[15.6px] leading-[24px] text-[#372213]">
                  Speaking
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                  Pronunciation 48%
                </span>
                <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                  Accent 90%
                </span>
                <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                  Grammar & Sentence Structure 90%
                </span>
              </div>
            </div>
          </div>

          {/* Difficult Words */}
          <div className="flex flex-col gap-4">
            <h4 className="font-inter font-bold text-[15.6px] leading-[24px] text-[#372213]">
              Difficult Words
            </h4>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="px-4 py-1 bg-[#FFE0A7] rounded-full">
                  <span className="font-inter font-medium text-[15.6px] leading-[24px] text-[#372213]">
                    comimos
                  </span>
                </div>
                <div className="flex gap-1 bg-[#FFE0A7] rounded-full px-2 py-1">
                  <img
                    src="/535-248.svg"
                    alt="Audio"
                    className="w-4.5 h-4.5" />
                  
                  <img
                    src="/535-250.svg"
                    alt="Edit"
                    className="w-4.5 h-4.5" />
                  
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="px-4 py-1 bg-[#FFE0A7] rounded-full">
                  <span className="font-inter font-semibold text-[15.6px] leading-[24px] text-[#372213]">
                    pero
                  </span>
                </div>
                <div className="flex gap-1 bg-[#FFE0A7] rounded-full px-2 py-1">
                  <img
                    src="/535-262.svg"
                    alt="Audio"
                    className="w-4.5 h-4.5" />
                  
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="px-4 py-1 bg-[#FFE0A7] rounded-full">
                  <span className="font-inter font-semibold text-[15.6px] leading-[24px] text-[#FF0000]">
                    pone
                  </span>
                </div>
                <div className="flex gap-1 bg-[#FFE0A7] rounded-full px-2 py-1">
                  <img
                    src="/535-273.svg"
                    alt="Edit"
                    className="w-4.5 h-4.5" />
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full max-w-[450px] flex flex-col gap-2">
          <button className="w-full py-3 bg-[#FF6200] border-2 border-[#FFFDE6] rounded-xl flex items-center justify-center gap-2 hover:bg-[#e55800] transition-colors">
            <svg
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              
              <path
                d="M10 18C15.5228 18 20 13.9706 20 9C20 4.02944 15.5228 0 10 0C4.47715 0 0 4.02944 0 9C0 11.8346 1.5173 14.3639 3.86872 15.9892C3.65596 16.8402 3.12056 17.5898 3.03632 17.7078C2.92482 17.8639 2.97825 18.0772 3.14926 18.1614C3.2177 18.1951 3.29339 18.2035 3.36643 18.1867C4.78164 17.8639 5.92723 17.1479 6.64322 16.5919C7.70458 16.8587 8.8305 17 10 17V18Z"
                fill="white" />
              
            </svg>
            <span className="font-inter font-bold text-[18px] leading-[20px] text-[#FFFDE6]">
              Review Conversation
            </span>
          </button>

          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-[#FF6200] border-2 border-[#FFFDE6] rounded-xl font-inter font-bold text-[18px] leading-[24px] text-[#FFFDE6] hover:bg-[#e55800] transition-colors">
              Retry Scenario
            </button>
            <button className="flex-1 py-3 bg-[#FFFDE6] border-2 border-[#FFFDE6] rounded-xl font-inter font-bold text-[18px] leading-[24px] text-[#FF4D01] hover:bg-white transition-colors">
              Next Scenario
            </button>
          </div>
        </div>
      </div>
    </div>);

}
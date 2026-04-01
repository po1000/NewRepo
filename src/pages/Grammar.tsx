import React from 'react';
import { Navigation } from '../components/Navigation';
import { UserProfile } from '../components/UserProfile';
import { Search } from 'lucide-react';
interface GrammarProps {
  onNavigateBack?: () => void;
  onLearnSpeakWriteClick?: () => void;
  onCultureClick?: () => void;
  onNavigateToERVerbs?: () => void;
  onNavigateToSer?: () => void;
  onCommunityClick?: () => void;
}
export function Grammar({
  onNavigateBack,
  onLearnSpeakWriteClick,
  onCultureClick,
  onNavigateToERVerbs,
  onNavigateToSer,
  onCommunityClick
}: GrammarProps) {
  return (
    <div className="min-h-screen w-full bg-[#FF4D01] font-inter relative overflow-hidden">
      {/* Diagonal Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#FF7032] origin-top-left -skew-y-3 pointer-events-none" />

      {/* Top Navigation */}
      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="relative flex flex-col pt-[42px]">
          <div className="absolute right-4 top-[42px] z-20 hidden md:block">
            <UserProfile username="username_here" />
          </div>
          <div className="[&_a]:text-[#FFFDE6] [&_button]:text-[#FFFDE6] [&_svg]:text-[#FFFDE6]">
            <Navigation
              onLearnLessonsClick={onNavigateBack}
              onLearnSpeakWriteClick={onLearnSpeakWriteClick}
              onCultureClick={onCultureClick}
              onGrammarClick={() => {}}
              onCommunityClick={onCommunityClick} />
            
          </div>
          <div className="flex justify-end mt-4 md:hidden">
            <UserProfile username="username_here" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[620px] mx-auto pt-12 pb-20">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-white">
              Grammar
            </h1>
            <div className="w-full sm:w-[256px] h-[42px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 gap-3 shadow-sm">
              <Search className="w-4.5 h-4.5 text-[#B1B1B1]" />
              <input
                type="text"
                placeholder="Search topics..."
                className="flex-1 bg-transparent border-none outline-none font-inter text-[16px] leading-[24px] text-[#372213] placeholder:text-[#B1B1B1]" />
              
            </div>
          </div>

          {/* Cards Container */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Conjugations Card */}
            <div className="w-full md:w-[219px] bg-[#FFE43C] rounded-xl p-6 flex flex-col gap-6">
              <h2 className="font-inter font-bold text-[16.3px] leading-[28px] text-[#372213]">
                Conjugations
              </h2>
              <div className="flex flex-col gap-2">
                <button className="w-full h-[48px] bg-[#A9DEFF] rounded-lg flex items-center px-4 hover:brightness-95 transition-all">
                  <span className="font-inter font-semibold text-[13.6px] leading-[24px] text-[#372213]">
                    -ar Verbs
                  </span>
                </button>
                <button
                  onClick={onNavigateToERVerbs}
                  className="w-full h-[48px] bg-[#E3B2FF] rounded-lg flex items-center px-4 hover:brightness-95 transition-all">
                  
                  <span className="font-inter font-semibold text-[13.6px] leading-[24px] text-[#372213]">
                    -er Verbs
                  </span>
                </button>
                <button className="w-full h-[48px] bg-[#FFB1B1] rounded-lg flex items-center px-4 hover:brightness-95 transition-all">
                  <span className="font-inter font-semibold text-[13.6px] leading-[24px] text-[#372213]">
                    -ir Verbs
                  </span>
                </button>
              </div>
            </div>

            {/* Topics Card */}
            <div className="flex-1 bg-[#FFE43C] rounded-xl p-6 flex flex-col gap-6">
              <h2 className="font-inter font-bold text-[16.3px] leading-[28px] text-[#372213]">
                Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Pronouns
                  </span>
                </button>
                <button className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Gender Rules
                  </span>
                </button>
                <button
                  onClick={onNavigateToSer}
                  className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Ser vs Estar
                  </span>
                </button>
                <button className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex flex-col justify-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Adjective
                  </span>
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Agreement
                  </span>
                </button>
                <button className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Plural Formation
                  </span>
                </button>
                <button className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Question Words
                  </span>
                </button>
                <button className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex flex-col justify-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Stem-changing
                  </span>
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Verbs Rules
                  </span>
                </button>
                <button className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Preterite Tense
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
import React from 'react';
import { Navigation } from '../components/Navigation';
import { UserProfile } from '../components/UserProfile';
import { Search } from 'lucide-react';
interface ERVerbsProps {
  onBack?: () => void;
  onNavigateToSer?: () => void;
  onLearnSpeakWriteClick?: () => void;
  onCultureClick?: () => void;
  onGrammarClick?: () => void;
  onCommunityClick?: () => void;
}
export function ERVerbs({
  onBack,
  onNavigateToSer,
  onLearnSpeakWriteClick,
  onCultureClick,
  onGrammarClick,
  onCommunityClick
}: ERVerbsProps) {
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
              onLearnLessonsClick={onBack}
              onLearnSpeakWriteClick={onLearnSpeakWriteClick}
              onCultureClick={onCultureClick}
              onGrammarClick={onGrammarClick}
              onCommunityClick={onCommunityClick} />
            
          </div>
          <div className="flex justify-end mt-4 md:hidden">
            <UserProfile username="username_here" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[684px] mx-auto pt-12 pb-20 px-8">
          {/* Breadcrumb */}
          <div className="mb-4">
            <span className="font-inter font-medium text-[16px] leading-[36px] text-white">
              Grammar / Conjugations / ER Verbs
            </span>
          </div>

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
            <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-white">
              ER Verbs
            </h1>
            <div className="w-full sm:w-[256px] h-[42px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 gap-3 shadow-sm">
              <Search className="w-4.5 h-4.5 text-[#B1B1B1]" />
              <input
                type="text"
                placeholder="Search topics..."
                className="flex-1 bg-transparent border-none outline-none font-inter text-[16px] leading-[24px] text-[#372213] placeholder:text-[#B1B1B1]" />
              
            </div>
          </div>

          {/* Scattered Verb Chips Grid */}
          <div className="relative w-full h-[300px] flex items-center justify-center">
            {/* Row 1 */}
            <button className="absolute top-0 left-0 w-[167px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Aprender
              </span>
            </button>
            <button className="absolute top-0 left-[198px] w-[130px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Beber
              </span>
            </button>
            <button className="absolute top-0 left-[359px] w-[127px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Tener
              </span>
            </button>
            <button
              onClick={onNavigateToSer}
              className="absolute top-0 left-[517px] w-[102px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Ser
              </span>
            </button>

            {/* Row 2 */}
            <button className="absolute top-[80px] left-0 w-[52px] h-[138px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213] rotate-90 whitespace-nowrap">
                Comer
              </span>
            </button>
            <button className="absolute top-[80px] left-[83px] w-[102px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Ver
              </span>
            </button>
            <button className="absolute top-[80px] left-[212px] w-[140px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Querer
              </span>
            </button>
            <button className="absolute top-[80px] left-[378px] w-[164px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Entender
              </span>
            </button>
            <button className="absolute top-[80px] left-[568px] w-[52px] h-[130px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213] rotate-90 whitespace-nowrap">
                Poder
              </span>
            </button>

            {/* Row 3 */}
            <button className="absolute top-[166px] left-[83px] w-[130px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Hacer
              </span>
            </button>
            <button className="absolute top-[166px] left-[244px] w-[113px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Leer
              </span>
            </button>
            <button className="absolute top-[166px] left-[388px] w-[129px] h-[52px] bg-[#FFEB15] rounded-none flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform">
              <span className="font-inter font-medium text-[23px] leading-[24px] text-[#372213]">
                Poner
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>);

}
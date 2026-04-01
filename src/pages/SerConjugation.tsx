import React from 'react';
import { Navigation } from '../components/Navigation';
import { UserProfile } from '../components/UserProfile';
interface SerConjugationProps {
  onBack?: () => void;
  onLearnSpeakWriteClick?: () => void;
  onCultureClick?: () => void;
  onGrammarClick?: () => void;
  onCommunityClick?: () => void;
}
export function SerConjugation({
  onBack,
  onLearnSpeakWriteClick,
  onCultureClick,
  onGrammarClick,
  onCommunityClick
}: SerConjugationProps) {
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
              Grammar / Conjugations / ER Verbs / Ser
            </span>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="font-inter text-[25.5px] leading-[36px] text-white">
              <span className="font-bold">Ser</span> (To be)
            </h1>
          </div>

          {/* Conjugation Table */}
          <div className="w-full max-w-[514px] mx-auto">
            {/* Table Headers */}
            <div className="flex mb-4 ml-[45px]">
              <div className="w-[83px] flex justify-center">
                <span className="font-inter font-medium text-[16.3px] leading-[28px] text-white">
                  Pronouns
                </span>
              </div>
              <div className="w-[90px] ml-[12px] flex justify-center">
                <span className="font-inter font-medium text-[16.3px] leading-[28px] text-white">
                  Present
                </span>
              </div>
              <div className="w-[90px] ml-[12px] flex justify-center">
                <span className="font-inter font-medium text-[16.3px] leading-[28px] text-white">
                  Preterite
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Left Sidebars (Singular/Plural) */}
              <div className="w-[33px] flex flex-col gap-4">
                <div className="w-full h-[220px] bg-[#FF7032] rounded-lg flex items-center justify-center">
                  <span className="font-inter font-semibold text-[17.6px] leading-[24px] text-white -rotate-90 whitespace-nowrap">
                    Singular
                  </span>
                </div>
                <div className="w-full h-[224px] bg-[#FF7032] rounded-lg flex items-center justify-center">
                  <span className="font-inter font-semibold text-[17.6px] leading-[24px] text-white -rotate-90 whitespace-nowrap">
                    Plural
                  </span>
                </div>
              </div>

              {/* Pronouns Column */}
              <div className="w-[83px] flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-medium text-[12px] leading-[20px] text-[#372213]">
                      yo
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-medium text-[12px] leading-[20px] text-[#372213]">
                      tú
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-medium text-[12px] leading-[20px] text-[#372213] text-center">
                      él
                      <br />
                      ella
                      <br />
                      usted
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-medium text-[12px] leading-[20px] text-[#372213] text-center">
                      Nosotros
                      <br />
                      Nosotras
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-medium text-[12px] leading-[20px] text-[#372213] text-center">
                      Vosotros
                      <br />
                      Vosotras
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-[#FFE83C] rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-medium text-[12px] leading-[20px] text-[#372213] text-center">
                      ellos
                      <br />
                      ellas
                      <br />
                      ustedes
                    </span>
                  </div>
                </div>
              </div>

              {/* Present Column */}
              <div className="w-[90px] flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      soy
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      eres
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      es
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      somos
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      sois
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      son
                    </span>
                  </div>
                </div>
              </div>

              {/* Preterite Column */}
              <div className="w-[90px] flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      fui
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      fuiste
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      fue
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      fuimos
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      fuisteis
                    </span>
                  </div>
                  <div className="w-full h-[68px] bg-white rounded-lg flex items-center justify-center p-2">
                    <span className="font-inter font-semibold text-[18px] leading-[20px] text-[#372213]">
                      fueron
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
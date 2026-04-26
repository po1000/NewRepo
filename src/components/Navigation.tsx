import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavigationProps {
  onLearnLessonsClick?: () => void;
  onLearnSpeakWriteClick?: () => void;
  onCultureClick?: () => void;
  onGrammarClick?: () => void;
  onCommunityClick?: () => void;
}

export function Navigation({
  onLearnLessonsClick,
  onLearnSpeakWriteClick,
  onCultureClick,
  onGrammarClick,
  onCommunityClick,
}: NavigationProps) {
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-center items-center py-6 w-full max-w-[632px] mx-auto">
      <ul className="flex flex-row gap-8 items-center">
        <li className="relative">
          <button
            onClick={() => setShowLearnDropdown(!showLearnDropdown)}
            className="flex items-center gap-1 font-inter font-semibold text-[15px] text-[#372213] hover:text-[#FF4D01] transition-colors"
          >
            {t('nav.learn')}
            <ChevronDown className={`w-4 h-4 transition-transform ${showLearnDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLearnDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[180px] z-50">
              <button
                onClick={() => { setShowLearnDropdown(false); onLearnLessonsClick?.(); }}
                className="w-full text-left px-4 py-2 font-inter text-[15px] !text-[#372213] hover:bg-gray-100 transition-colors"
              >
                {t('nav.lessons')}
              </button>
              <button
                onClick={() => { setShowLearnDropdown(false); onLearnSpeakWriteClick?.(); }}
                className="w-full text-left px-4 py-2 font-inter text-[15px] !text-[#372213] hover:bg-gray-100 transition-colors"
              >
                {t('nav.speakAndWrite')}
              </button>
            </div>
          )}
        </li>
        <li>
          <button
            onClick={onGrammarClick}
            className="font-inter font-semibold text-[15px] text-[#372213] hover:text-[#FF4D01] transition-colors"
          >
            {t('nav.grammar')}
          </button>
        </li>
        <li>
          <button
            onClick={onCultureClick}
            className="font-inter font-semibold text-[15px] text-[#372213] hover:text-[#FF4D01] transition-colors"
          >
            {t('nav.culture')}
          </button>
        </li>
        <li>
          <button
            onClick={onCommunityClick}
            className="font-inter font-semibold text-[15px] text-[#372213] hover:text-[#FF4D01] transition-colors"
          >
            {t('nav.community')}
          </button>
        </li>
      </ul>
    </nav>
  );
}

import React from 'react';
import { Settings, X, Globe, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { language, toggleLanguage, t, showInstructions, setShowInstructions } = useLanguage();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end" onClick={onClose}>
      <div
        className="mt-16 mr-4 w-[300px] bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#6B7280]" />
            <span className="font-inter font-bold text-[14px] text-[#372213]">{t('settings.title')}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Language Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FF4D01]" />
              <span className="font-inter font-medium text-[13px] text-[#372213]">{t('settings.language')}</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors bg-[#FF4D01] text-white hover:bg-[#E8451A]"
            >
              {language === 'en' ? '🇬🇧 English' : '🇪🇸 Español'}
            </button>
          </div>

          {/* Instructions Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FF4D01]" />
              <span className="font-inter font-medium text-[13px] text-[#372213]">{t('settings.instructions')}</span>
            </div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className={`relative w-10 h-5 rounded-full transition-colors ${showInstructions ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showInstructions ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <p className="text-[11px] text-[#9CA3AF] leading-[16px] -mt-2">
            {t('settings.instructionsHint')}
          </p>
        </div>
      </div>
    </div>
  );
}

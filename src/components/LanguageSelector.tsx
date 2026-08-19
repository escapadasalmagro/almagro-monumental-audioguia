import React from 'react';
import { SUPPORTED_LANGUAGES } from '../data/monuments';
import { LanguageCode } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  return (
    <div id="language-selector-container" className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#A0522D]">
          <Globe className="w-3.5 h-3.5 text-[#A0522D]" />
          <span>Seleccionar Idioma</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#4A3728]">
          {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.nativeLabel}
        </span>
      </div>

      {/* 2-row grid of 3 columns for clear readability on mobile */}
      <div className="grid grid-cols-3 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code === selectedLanguage;
          return (
            <button
              key={lang.code}
              id={`btn-lang-${lang.code}`}
              onClick={() => onSelectLanguage(lang.code)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-black transition-all active:scale-95 border cursor-pointer ${
                isSelected
                  ? 'bg-[#A0522D] text-white border-[#8B4513] shadow-sm'
                  : 'bg-white hover:bg-[#E6D5B8]/40 text-[#4A3728] border-[#E6D5B8]'
              }`}
            >
              <span className="text-sm leading-none shrink-0">{lang.flag}</span>
              <span className="tracking-tight truncate">{lang.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

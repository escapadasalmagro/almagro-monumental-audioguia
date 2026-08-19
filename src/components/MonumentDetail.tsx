import React, { useState, useEffect } from 'react';
import { Monument, LanguageCode } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { AudioPlayer } from './AudioPlayer';
import { translateMonument, TranslatedMonumentContent } from '../services/translationService';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface MonumentDetailProps {
  monument: Monument;
  onBack: () => void;
}

export const MonumentDetail: React.FC<MonumentDetailProps> = ({
  monument,
  onBack,
}) => {
  // Always initialize strictly in Spanish (no auto-detect)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('es');

  // Current active text content
  const [content, setContent] = useState<TranslatedMonumentContent>({
    title: monument.originalText.title,
    subtitle: monument.originalText.subtitle,
    shortDescription: monument.originalText.shortDescription,
    introductoryText: monument.originalText.introductoryText,
  });

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Handle translation whenever selectedLanguage changes
  useEffect(() => {
    let isCancelled = false;

    if (selectedLanguage === 'es') {
      setContent({
        title: monument.originalText.title,
        subtitle: monument.originalText.subtitle,
        shortDescription: monument.originalText.shortDescription,
        introductoryText: monument.originalText.introductoryText,
      });
      setIsTranslating(false);
      setTranslationError(null);
      return;
    }

    async function performTranslation() {
      setIsTranslating(true);
      setTranslationError(null);

      try {
        const translated = await translateMonument(monument, selectedLanguage);
        if (!isCancelled) {
          setContent(translated);
          setIsTranslating(false);
        }
      } catch (err) {
        if (!isCancelled) {
          // Fallback to original Spanish text and show discreet notice
          setContent({
            title: monument.originalText.title,
            subtitle: monument.originalText.subtitle,
            shortDescription: monument.originalText.shortDescription,
            introductoryText: monument.originalText.introductoryText,
          });
          setIsTranslating(false);
          setTranslationError(
            'No se ha podido traducir el texto. Mostrando versión en español.'
          );
        }
      }
    }

    performTranslation();

    return () => {
      isCancelled = true;
    };
  }, [monument, selectedLanguage]);

  return (
    <div
      id="monument-detail-view"
      className="flex flex-col w-full min-h-full bg-[#F9F7F2] pb-28 animate-in fade-in duration-200"
    >
      <div className="max-w-3xl mx-auto w-full flex flex-col">
        {/* 1. Floating Back Button & 2. Main Monument Image */}
        <div className="relative h-56 sm:h-72 md:h-80 bg-[#4A3728] overflow-hidden sm:rounded-3xl sm:mt-2 shadow-md">
          {monument.imageUrl ? (
            <img
              src={monument.imageUrl}
              alt={content.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#E6D5B8] text-sm font-bold uppercase tracking-wider">
              {content.title}
            </div>
          )}

          {/* 1. Botón Volver */}
          <div className="absolute top-4 left-4 z-20">
            <button
              id="btn-back-to-monuments"
              onClick={onBack}
              className="bg-[#4A3728]/90 hover:bg-[#3b2b1f] backdrop-blur-xs rounded-full py-2 px-4 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Volver
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6 space-y-5 max-w-full">
          {/* 3. Nombre del monumento y subtítulo */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#4A3728] tracking-tight uppercase leading-tight">
              {content.title}
            </h2>

            {(content.subtitle || monument.subtitle) && (
              <p className="text-xs sm:text-sm font-bold text-[#A0522D] tracking-wide">
                {content.subtitle || monument.subtitle}
              </p>
            )}
          </div>

          {/* 4. Selector de Idioma */}
          <div className="bg-[#E6D5B8]/30 p-3.5 sm:p-4 rounded-2xl border border-[#E6D5B8]/80">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
            />
          </div>

          {/* 5. Texto histórico / descripción */}
          <div className="relative bg-white p-4 sm:p-6 rounded-2xl border border-[#E6D5B8] shadow-xs space-y-2">
            {/* Discrete "Traduciendo..." indicator */}
            {isTranslating && (
              <div className="flex items-center gap-2 text-xs font-black text-[#A0522D] bg-[#E6D5B8]/40 px-3 py-1.5 rounded-xl animate-pulse w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A0522D]" />
                <span>Traduciendo...</span>
              </div>
            )}

            {/* Translation Error notice */}
            {translationError && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8B4513] bg-[#E6D5B8]/60 p-2.5 rounded-xl border border-[#A0522D]/30">
                <AlertCircle className="w-4 h-4 text-[#A0522D] shrink-0" />
                <span>{translationError}</span>
              </div>
            )}

            <p className="text-[17px] sm:text-[18px] text-[#4A3728] leading-[1.7] font-normal transition-opacity duration-200">
              {content.introductoryText}
            </p>
          </div>

          {/* 6. Reproductor de audioguía */}
          <div>
            <AudioPlayer
              monumentName={content.title}
              durationSeconds={monument.originalText.audioDurationSeconds}
              language={selectedLanguage}
              audioFileUrl={monument.audioFiles[selectedLanguage]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

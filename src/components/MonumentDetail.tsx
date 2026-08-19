import React, { useState, useEffect } from 'react';
import { Monument, LanguageCode } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { AudioPlayer } from './AudioPlayer';
import { MonumentLocation } from './MonumentLocation';
import { INITIAL_MONUMENTS } from '../data/monuments';
import { translateMonument, TranslatedMonumentContent } from '../services/translationService';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Loader2,
  AlertCircle,
  Clock,
  MapPin,
  Landmark,
} from 'lucide-react';

interface MonumentDetailProps {
  monument: Monument;
  onBack: () => void;
  onSelectMonument: (monument: Monument) => void;
}

export const MonumentDetail: React.FC<MonumentDetailProps> = ({
  monument,
  onBack,
  onSelectMonument,
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

  // 1. Cálculo dinámico del progreso: "1 de 6", "2 de 6", etc.
  const currentIndex = INITIAL_MONUMENTS.findIndex((m) => m.id === monument.id);
  const totalMonuments = INITIAL_MONUMENTS.length;
  const currentNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const isLastMonument = currentIndex === totalMonuments - 1;
  const nextMonument = !isLastMonument && currentIndex >= 0 ? INITIAL_MONUMENTS[currentIndex + 1] : null;

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
    <article
      id="monument-detail-view"
      className="flex flex-col w-full min-h-full bg-[#F9F7F2] pb-24 md:pb-12 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-6xl mx-auto px-3.5 sm:px-6 py-2 sm:py-4">
        {/* Barra Superior: 1. Botón Volver + 1. Indicador de Progreso Discreto "X de 6" */}
        <div className="flex items-center justify-between mb-3.5 sm:mb-5">
          <button
            id="btn-back-to-monuments"
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-[#4A3728] hover:bg-[#3b2b1f] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer border border-[#d8c5a4]/30"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Volver</span>
          </button>

          {/* 1. Indicador discreto y elegante: "X de 6" */}
          <div
            id="monument-progress-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E6D5B8]/40 border border-[#E6D5B8] rounded-full text-xs font-black text-[#A0522D] shadow-2xs select-none"
          >
            <span className="text-[#5D4037]/75 font-semibold text-[11px]">Monumento</span>
            <span className="text-[#A0522D] font-black">{currentNumber} de {totalMonuments}</span>
          </div>
        </div>

        {/* Layout Responsive: 1 columna en móvil/tablet (<lg), 2 columnas en escritorio (>=lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* COLUMNA IZQUIERDA (lg: 5 columnas): 2. Imagen Principal + Ficha Técnica de Visita */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* 2. Imagen Principal */}
            <div className="relative w-full h-64 sm:h-80 lg:h-[380px] bg-[#4A3728] overflow-hidden rounded-3xl shadow-md border border-[#E6D5B8]">
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

              {/* Tag flotante sobre la imagen */}
              <div className="absolute top-3 right-3 bg-[#4A3728]/90 text-[#C5A059] backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-[#C5A059]/40 shadow-xs">
                {monument.tag}
              </div>
            </div>

            {/* Ficha de datos clave del monumento (Dirección, Época, Duración) */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6D5B8] shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#A0522D] border-b border-[#E6D5B8]/60 pb-2">
                Información de la visita
              </h3>

              <div className="space-y-2.5 text-xs text-[#5D4037]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#A0522D] shrink-0 mt-0.5" />
                  <span className="leading-snug">{monument.address}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Landmark className="w-4 h-4 text-[#A0522D] shrink-0" />
                  <span className="font-semibold">{monument.century}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#A0522D] shrink-0" />
                  <span>Duración estimada: <strong>~{monument.visitDurationMinutes || 35} min</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (lg: 7 columnas): 
              3. Nombre del monumento
              4. Selector de idioma
              5. Texto histórico
              6. Reproductor de audioguía con memoria de posición
              7. Ubicación
              8. Mapa interactivo del monumento + Botón Cómo llegar
              9. Botón Siguiente Monumento / Volver al inicio
          */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* 3. Nombre del monumento y subtítulo */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#4A3728] tracking-tight uppercase leading-tight">
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

            {/* 5. Texto histórico / descriptivo */}
            <div className="relative bg-white p-4 sm:p-6 rounded-2xl border border-[#E6D5B8] shadow-xs space-y-2.5">
              {/* Indicador discreto de traducción */}
              {isTranslating && (
                <div className="flex items-center gap-2 text-xs font-black text-[#A0522D] bg-[#E6D5B8]/40 px-3 py-1.5 rounded-xl animate-pulse w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A0522D]" />
                  <span>Traduciendo contenido...</span>
                </div>
              )}

              {/* Aviso de error de traducción */}
              {translationError && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8B4513] bg-[#E6D5B8]/60 p-2.5 rounded-xl border border-[#A0522D]/30">
                  <AlertCircle className="w-4 h-4 text-[#A0522D] shrink-0" />
                  <span>{translationError}</span>
                </div>
              )}

              <p className="text-[16px] sm:text-[17px] lg:text-[18px] text-[#4A3728] leading-[1.7] font-normal transition-opacity duration-200">
                {content.introductoryText}
              </p>
            </div>

            {/* 6. Reproductor de audioguía con persistencia de posición */}
            <div className="w-full">
              <AudioPlayer
                monumentId={monument.id}
                monumentName={content.title}
                durationSeconds={monument.originalText.audioDurationSeconds}
                language={selectedLanguage}
                audioFileUrl={monument.audioFiles[selectedLanguage]}
              />
            </div>

            {/* 7 & 8. Sección de Ubicación y Mapa individual del monumento con botón Cómo llegar */}
            <div className="w-full pt-1">
              <MonumentLocation
                name={content.title}
                address={monument.address}
                coordinates={monument.coordinates}
              />
            </div>

            {/* 2. BOTÓN "SIGUIENTE MONUMENTO" / "VOLVER AL INICIO" */}
            <div className="w-full pt-2">
              {nextMonument ? (
                <button
                  id={`btn-siguiente-monumento-${nextMonument.id}`}
                  onClick={() => onSelectMonument(nextMonument)}
                  className="w-full bg-[#4A3728] hover:bg-[#3b2b1f] text-white p-4 sm:p-4.5 rounded-3xl uppercase tracking-wider shadow-md flex items-center justify-between gap-3 transition-all active:scale-[0.99] cursor-pointer border border-[#C5A059]/40 group"
                >
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-[10px] sm:text-xs text-[#C5A059] font-black uppercase tracking-widest">
                      Siguiente monumento ({currentNumber + 1} de {totalMonuments})
                    </span>
                    <span className="text-sm sm:text-base text-white font-black truncate mt-0.5">
                      {nextMonument.name}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#C5A059] flex items-center justify-center text-[#4A3728] shrink-0 group-hover:translate-x-1 transition-transform shadow-xs">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ) : (
                <button
                  id="btn-volver-inicio-final"
                  onClick={onBack}
                  className="w-full bg-[#4A3728] hover:bg-[#3b2b1f] text-white p-4 sm:p-4.5 rounded-3xl uppercase tracking-wider shadow-md flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer border border-[#C5A059]/40 group"
                >
                  <Home className="w-5 h-5 text-[#C5A059] shrink-0" />
                  <span className="text-sm sm:text-base text-white font-black">
                    Volver al inicio
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

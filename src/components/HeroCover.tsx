import React from 'react';
import { Search, Map, X } from 'lucide-react';

interface HeroCoverProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenMap: () => void;
}

export const HeroCover: React.FC<HeroCoverProps> = ({
  searchTerm,
  onSearchChange,
  onOpenMap,
}) => {
  return (
    <section
      id="hero-explora-almagro"
      className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-[#3a2a1d]/30 min-h-[380px] sm:min-h-[420px] md:min-h-[360px] flex flex-col justify-between md:justify-center p-5 sm:p-8 md:p-10 text-center"
    >
      {/* Background Photography with Dark Atmospheric Gradient Overlay */}
      <img
        src="https://drive.google.com/thumbnail?id=1-gy3wDrPfLZAZ21Llfl1fwiR_tWRvNje&sz=w1600"
        alt="Explora Almagro"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d1e14]/75 via-[#3b2b1f]/80 to-[#1e130c]/95 z-10" />

      {/* Main Heading & Intro Text */}
      <div className="relative z-20 flex flex-col items-center justify-center space-y-2.5 sm:space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-[1.1] drop-shadow-md">
          EXPLORA<br className="md:hidden" /> ALMAGRO
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-[#F9F7F2]/90 leading-relaxed max-w-[320px] sm:max-w-[480px] md:max-w-[620px] mx-auto font-normal drop-shadow-xs">
          Descubre los tesoros históricos y culturales de nuestra ciudad. Cada monumento cuenta una historia única esperando ser revelada.
        </p>
      </div>

      {/* Search Input & Ver Mapa Button */}
      <div className="relative z-20 w-full max-w-xl mx-auto space-y-3 pt-4 sm:pt-6">
        {/* Search Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C5A059]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-monument"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar monumento por nombre o descripción..."
            className="w-full bg-white/95 text-[#4A3728] placeholder-[#5D4037]/70 text-xs sm:text-sm font-semibold rounded-2xl pl-10 pr-10 py-3.5 shadow-md border border-white/40 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5D4037] hover:text-[#4A3728] cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Big "Ver Mapa" Button */}
        <button
          id="btn-hero-ver-mapa"
          onClick={onOpenMap}
          className="w-full bg-[#C5A059] hover:bg-[#b8944f] text-[#4A3728] font-black text-xs sm:text-sm py-3.5 rounded-2xl uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border border-[#d8c5a4]"
        >
          <Map className="w-4 h-4 text-[#4A3728]" />
          <span>Ver Mapa Interactivo</span>
        </button>
      </div>
    </section>
  );
};

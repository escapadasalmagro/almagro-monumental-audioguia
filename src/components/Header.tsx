import React from 'react';
import { Compass, Home, Map } from 'lucide-react';
import { NavigationTab } from '../types';

interface HeaderProps {
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  isMobileFramed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isMobileFramed = false,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-[#4A3728] text-white px-4 py-3 shadow-md border-b border-[#3a2a1d] transition-all w-full"
    >
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onTabChange?.('inicio')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-[#C5A059] flex items-center justify-center shadow-xs shrink-0">
            <Compass className="w-4 h-4 text-[#4A3728]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wider text-[#C5A059] uppercase leading-none">
              Almagro Monumental
            </h1>
            <p className="text-[10px] text-[#F9F7F2]/70 font-semibold tracking-wide hidden sm:block">
              Guía y Audioguía Oficial
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Navigation Links (hidden if in framed mobile preview or on mobile screens) */}
        {onTabChange && !isMobileFramed && (
          <nav className="hidden md:flex items-center gap-2" aria-label="Navegación escritorio">
            <button
              id="header-nav-inicio"
              onClick={() => onTabChange('inicio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'inicio'
                  ? 'bg-[#C5A059] text-[#4A3728] shadow-sm'
                  : 'text-[#F9F7F2]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </button>

            <button
              id="header-nav-mapa"
              onClick={() => onTabChange('mapa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'mapa'
                  ? 'bg-[#C5A059] text-[#4A3728] shadow-sm'
                  : 'text-[#F9F7F2]/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Mapa</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

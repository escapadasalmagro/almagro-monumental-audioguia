import React from 'react';
import { Home, Map } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      id="bottom-navigation"
      aria-label="Navegación móvil"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#4A3728]/95 backdrop-blur-md border-t border-[#3a2a1d] shadow-2xl px-4 py-2 pb-safe md:hidden w-full"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Inicio */}
        <button
          id="nav-tab-inicio"
          onClick={() => onTabChange('inicio')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'inicio'
              ? 'text-[#C5A059] font-black'
              : 'text-[#F9F7F2]/60 hover:text-[#F9F7F2] font-semibold'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'inicio' ? 'bg-[#3b2b1f] scale-105' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] uppercase tracking-wider mt-0.5">Inicio</span>
        </button>

        {/* Separator Line */}
        <div className="w-[1px] h-7 bg-white/10" />

        {/* Mapa */}
        <button
          id="nav-tab-mapa"
          onClick={() => onTabChange('mapa')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'mapa'
              ? 'text-[#C5A059] font-black'
              : 'text-[#F9F7F2]/60 hover:text-[#F9F7F2] font-semibold'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'mapa' ? 'bg-[#3b2b1f] scale-105' : ''
            }`}
          >
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[11px] uppercase tracking-wider mt-0.5">Mapa</span>
        </button>
      </div>
    </nav>
  );
};

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroCover } from './components/HeroCover';
import { MonumentCard } from './components/MonumentCard';
import { MonumentMap } from './components/MonumentMap';
import { MonumentDetail } from './components/MonumentDetail';
import { BottomNavigation } from './components/BottomNavigation';
import { ViewportSwitcher, ViewportMode } from './components/ViewportSwitcher';
import { INITIAL_MONUMENTS } from './data/monuments';
import { Monument, NavigationTab } from './types';

export default function App() {
  // Default to 390px as requested by user to preview standard mobile format
  const [viewportMode, setViewportMode] = useState<ViewportMode>('390px');
  const [activeTab, setActiveTab] = useState<NavigationTab>('inicio');
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Carga directa e inmediata de los datos locales sin dependencias de red ni Firestore
  const monuments: Monument[] = INITIAL_MONUMENTS;

  const isMobileFramed = viewportMode !== '100%';

  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    setSelectedMonument(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMonument = (monument: Monument) => {
    setSelectedMonument(monument);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMap = () => {
    setActiveTab('mapa');
    setSelectedMonument(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter monuments based on search query
  const filteredMonuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return monuments;
    }
    return monuments.filter((monument) => {
      const matchName = monument.name.toLowerCase().includes(query);
      const matchSubtitle =
        monument.subtitle?.toLowerCase().includes(query) ?? false;
      const matchTag = monument.tag.toLowerCase().includes(query);
      const matchDesc = monument.originalText.shortDescription
        .toLowerCase()
        .includes(query);
      return matchName || matchSubtitle || matchTag || matchDesc;
    });
  }, [monuments, searchTerm]);

  // Width container class based on selected preset
  const getContainerWidthClass = () => {
    switch (viewportMode) {
      case '320px':
        return 'max-w-[320px] shadow-2xl border-x border-[#E6D5B8] my-0 sm:my-3 rounded-none sm:rounded-3xl overflow-hidden';
      case '375px':
        return 'max-w-[375px] shadow-2xl border-x border-[#E6D5B8] my-0 sm:my-3 rounded-none sm:rounded-3xl overflow-hidden';
      case '390px':
        return 'max-w-[390px] shadow-2xl border-x border-[#E6D5B8] my-0 sm:my-3 rounded-none sm:rounded-3xl overflow-hidden';
      case '430px':
        return 'max-w-[430px] shadow-2xl border-x border-[#E6D5B8] my-0 sm:my-3 rounded-none sm:rounded-3xl overflow-hidden';
      case '100%':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="min-h-screen bg-[#D4C3A3] flex flex-col font-sans selection:bg-[#A0522D]/20 selection:text-[#A0522D] overflow-x-hidden">
      {/* Top Preview Bar: Allows switching between 320px, 375px, 390px (default), 430px, 100% */}
      <ViewportSwitcher
        currentMode={viewportMode}
        onModeChange={setViewportMode}
      />

      {/* Main Responsive Canvas Wrapper */}
      <div className="flex-1 flex justify-center w-full">
        <div
          className={`w-full ${getContainerWidthClass()} bg-[#F9F7F2] min-h-[calc(100vh-42px)] flex flex-col transition-all duration-300 relative`}
        >
          {/* Cabecera Principal */}
          <Header
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isMobileFramed={isMobileFramed}
          />

          {/* Contenedor de Vistas */}
          <div className="flex-1 w-full flex flex-col overflow-x-hidden">
            {/* 1. Vista Ficha de Detalle */}
            {selectedMonument ? (
              <div className="flex-1 w-full px-0 sm:px-4 py-0 sm:py-4">
                <MonumentDetail
                  monument={selectedMonument}
                  onBack={() => setSelectedMonument(null)}
                />
              </div>
            ) : activeTab === 'inicio' ? (
              /* 2. Pantalla Inicio: Portada "EXPLORA ALMAGRO" + Buscador + Tarjetas */
              <main className="flex-1 w-full px-3.5 sm:px-5 py-4 space-y-5 pb-20">
                {/* Portada Visual "EXPLORA ALMAGRO" */}
                <HeroCover
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onOpenMap={handleOpenMap}
                />

                {/* Grid de Tarjetas de Monumentos */}
                {filteredMonuments.length > 0 ? (
                  <div
                    className={
                      isMobileFramed
                        ? 'grid grid-cols-1 gap-4'
                        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                    }
                  >
                    {filteredMonuments.map((monument) => (
                      <MonumentCard
                        key={monument.id}
                        monument={monument}
                        onDiscover={handleSelectMonument}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-6 text-center border border-[#E6D5B8] shadow-xs">
                    <p className="text-xs font-bold text-[#4A3728]">
                      No se encontraron monumentos con &ldquo;{searchTerm}&rdquo;
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-xs font-black text-[#A0522D] uppercase tracking-wider underline cursor-pointer"
                    >
                      Restablecer búsqueda
                    </button>
                  </div>
                )}
              </main>
            ) : (
              /* 3. Pantalla Mapa Interactivo */
              <main className="flex-1 w-full flex flex-col relative min-h-[520px]">
                <MonumentMap
                  monuments={monuments}
                  onSelectMonument={handleSelectMonument}
                />
              </main>
            )}
          </div>

          {/* Barra Inferior Fija para Móvil (Inicio / Mapa) */}
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isMobileFramed={isMobileFramed}
          />
        </div>
      </div>
    </div>
  );
}

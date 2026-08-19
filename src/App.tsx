import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroCover } from './components/HeroCover';
import { MonumentCard } from './components/MonumentCard';
import { MonumentMap } from './components/MonumentMap';
import { MonumentDetail } from './components/MonumentDetail';
import { BottomNavigation } from './components/BottomNavigation';
import { INITIAL_MONUMENTS } from './data/monuments';
import { Monument, NavigationTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('inicio');
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Monumentos cargados localmente de forma inmediata y síncrona
  const monuments: Monument[] = INITIAL_MONUMENTS;

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

  // Filtrado reactivo de monumentos según el término de búsqueda
  const filteredMonuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return monuments;
    }
    return monuments.filter((monument) => {
      const matchName = monument.name.toLowerCase().includes(query);
      const matchSubtitle = monument.subtitle?.toLowerCase().includes(query) ?? false;
      const matchTag = monument.tag.toLowerCase().includes(query);
      const matchDesc = monument.originalText.shortDescription.toLowerCase().includes(query);
      return matchName || matchSubtitle || matchTag || matchDesc;
    });
  }, [monuments, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#4A3728] flex flex-col font-sans selection:bg-[#A0522D]/20 selection:text-[#A0522D] overflow-x-hidden w-full">
      {/* Cabecera Principal con Navegación para Tablet/Escritorio */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Contenedor Principal Adaptativo (Mobile-first, max-w-7xl en Escritorio) */}
      <div className="flex-1 w-full flex flex-col">
        {selectedMonument ? (
          /* 1. Vista Ficha de Detalle (1 columna en móvil, 2 columnas en escritorio) */
          <main className="flex-1 w-full">
            <MonumentDetail
              monument={selectedMonument}
              onBack={() => {
                setSelectedMonument(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectMonument={handleSelectMonument}
            />
          </main>
        ) : activeTab === 'inicio' ? (
          /* 2. Pantalla Inicio: Hero "EXPLORA ALMAGRO" + Buscador + Cuadrícula de Monumentos */
          <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-24 md:pb-12">
            {/* Bloque Destacado "EXPLORA ALMAGRO" */}
            <HeroCover
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenMap={handleOpenMap}
            />

            {/* Cuadrícula Adaptativa de Monumentos:
                - Móvil (<640px): 1 columna
                - Tablet (640px - 1023px): 2 columnas
                - Escritorio (>=1024px): 3 columnas
            */}
            {filteredMonuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredMonuments.map((monument) => (
                  <MonumentCard
                    key={monument.id}
                    monument={monument}
                    onDiscover={handleSelectMonument}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-[#E6D5B8] shadow-xs max-w-lg mx-auto my-6">
                <p className="text-sm font-bold text-[#4A3728]">
                  No se encontraron monumentos con &ldquo;{searchTerm}&rdquo;
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-xs font-black text-[#A0522D] uppercase tracking-wider underline cursor-pointer"
                >
                  Restablecer búsqueda
                </button>
              </div>
            )}
          </main>
        ) : (
          /* 3. Pantalla Mapa Interactivo */
          <main className="flex-1 w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-4 flex flex-col min-h-[550px] md:min-h-[650px]">
            <div className="flex-1 w-full rounded-none sm:rounded-3xl overflow-hidden shadow-xs border-y sm:border border-[#E6D5B8] flex flex-col">
              <MonumentMap
                monuments={monuments}
                onSelectMonument={handleSelectMonument}
              />
            </div>
          </main>
        )}
      </div>

      {/* Pie de Página Centrado, Discreto y Elegante */}
      <footer
        id="app-footer"
        className="w-full mt-auto border-t border-[#E6D5B8]/80 bg-[#F9F7F2] py-7 sm:py-9 px-4 pb-24 md:pb-9 text-center"
      >
        <div className="max-w-4xl mx-auto space-y-1.5">
          <p className="text-xs sm:text-sm text-[#4A3728]/90 font-medium leading-relaxed">
            © 2026 Almagro Monumental. Todos los derechos reservados.
          </p>
          <p className="text-xs sm:text-sm text-[#5D4037]/75 font-normal leading-relaxed">
            Descubre la historia y belleza de Almagro.
          </p>
        </div>
      </footer>

      {/* Navegación Inferior Móvil (oculta automáticamente en md: >= 768px) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}

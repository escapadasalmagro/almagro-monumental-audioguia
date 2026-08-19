import React from 'react';
import { Smartphone, Monitor, Eye } from 'lucide-react';

export type ViewportMode = '320px' | '375px' | '390px' | '430px' | '100%';

interface ViewportSwitcherProps {
  currentMode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
}

export const ViewportSwitcher: React.FC<ViewportSwitcherProps> = ({
  currentMode,
  onModeChange,
}) => {
  const [isMinimized, setIsMinimized] = React.useState<boolean>(false);

  const presets: { mode: ViewportMode; label: string; sub: string }[] = [
    { mode: '320px', label: '320 px', sub: 'iPhone SE' },
    { mode: '375px', label: '375 px', sub: 'Estándar' },
    { mode: '390px', label: '390 px', sub: 'Principal' },
    { mode: '430px', label: '430 px', sub: 'Max' },
    { mode: '100%', label: '100%', sub: 'Escritorio' },
  ];

  if (isMinimized) {
    return (
      <div className="fixed top-2 right-2 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-[#4A3728] text-[#C5A059] border border-[#C5A059]/40 shadow-xl px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-[#3b2b1f] transition-all cursor-pointer"
          title="Mostrar selector de vista móvil"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Vista: {currentMode}</span>
          <Eye className="w-3 h-3 opacity-80" />
        </button>
      </div>
    );
  }

  return (
    <aside
      id="viewport-preview-toolbar"
      aria-label="Selector de previsualización responsive"
      className="bg-[#2D1E14] text-white px-3 py-2 border-b border-[#3a2a1d] shadow-md z-50 flex items-center justify-between gap-2 overflow-x-auto select-none"
    >
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#C5A059]">
          <Smartphone className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="hidden sm:inline">Previsualización:</span>
          <span className="sm:hidden">Vista:</span>
        </div>
      </div>

      {/* Mode buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {presets.map((preset) => {
          const isActive = currentMode === preset.mode;
          return (
            <button
              key={preset.mode}
              id={`btn-viewport-${preset.mode.replace('%', 'pct')}`}
              onClick={() => onModeChange(preset.mode)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#C5A059] text-[#4A3728] shadow-xs'
                  : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20'
              }`}
            >
              {preset.mode === '100%' ? (
                <Monitor className="w-3 h-3 shrink-0" />
              ) : (
                <Smartphone className="w-3 h-3 shrink-0" />
              )}
              <span>{preset.label}</span>
              {preset.mode === '390px' && (
                <span className="text-[9px] bg-[#A0522D] text-white px-1 rounded-sm uppercase tracking-tight ml-0.5">
                  Revisar
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Minimize button */}
      <button
        onClick={() => setIsMinimized(true)}
        className="text-[#F9F7F2]/60 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        title="Minimizar barra"
      >
        Ocultar
      </button>
    </aside>
  );
};

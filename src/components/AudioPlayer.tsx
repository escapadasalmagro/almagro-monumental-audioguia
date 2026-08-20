import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Gauge,
  Headphones,
  VolumeX,
  RotateCcw as ResetIcon,
} from 'lucide-react';
import { LanguageCode } from '../types';

interface AudioPlayerProps {
  monumentId: string;
  monumentName: string;
  durationSeconds?: number;
  language: LanguageCode;
  audioFileUrl?: string | null;
}

const STORAGE_KEY = 'almagro_audio_progress';

// Helper to safely read saved audio progress from localStorage
function getSavedProgress(monumentId: string, language: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const key = `${monumentId}_${language}`;
    const time = Number(data[key]);
    return isFinite(time) && time > 0 ? time : 0;
  } catch {
    return 0;
  }
}

// Helper to safely write saved audio progress to localStorage
function saveProgress(
  monumentId: string,
  language: string,
  time: number,
  duration: number
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const key = `${monumentId}_${language}`;

    // Si ha llegado al 95% o más, lo consideramos completado y lo reiniciamos
    if (duration > 0 && time >= duration * 0.95) {
      delete data[key];
    } else if (time > 2) {
      data[key] = Math.floor(time);
    } else {
      delete data[key];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Fallback silencioso si localStorage está restringido
  }
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
  const rounded = Math.floor(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  monumentId,
  monumentName,
  language,
  audioFileUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasRestoredPosition, setHasRestoredPosition] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastSavedTimeRef = useRef<number>(0);

  const monumentIdRef = useRef(monumentId);
  const languageRef = useRef(language);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    monumentIdRef.current = monumentId;
    languageRef.current = language;
  }, [monumentId, language]);

  // Único efecto que se ejecuta ÚNICAMENTE cuando cambia la URL del audio
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasRestoredPosition(false);
    setIsAvailable(!!audioFileUrl);
    lastSavedTimeRef.current = 0;

    return () => {
      // Guardar progreso al desmontar o antes de cambiar de pista
      const a = audioRef.current;
      if (a && a.currentTime > 0) {
        saveProgress(monumentIdRef.current, languageRef.current, a.currentTime, a.duration || 0);
      }
    };
  }, [audioFileUrl]);

  // Event handlers del elemento <audio> HTML5
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration) && !isNaN(audio.duration)) {
      setDuration(audio.duration);
      setIsAvailable(true);

      // Restaurar progreso guardado si existe y es menor al 95%
      const saved = getSavedProgress(monumentId, language);
      if (saved > 0 && saved < audio.duration * 0.95) {
        audio.currentTime = saved;
        setCurrentTime(saved);
        setHasRestoredPosition(true);
      } else {
        audio.currentTime = 0;
        setCurrentTime(0);
        setHasRestoredPosition(false);
      }
    }
  };

  const handleCanPlay = () => {
    setIsAvailable(true);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isDraggingRef.current) {
      setCurrentTime(audio.currentTime);
    }
    if (Number.isFinite(audio.duration) && audio.duration > 0 && duration === 0) {
      setDuration(audio.duration);
    }

    // Guardar periódicamente cada 3 segundos de reproducción continua
    if (Math.abs(audio.currentTime - lastSavedTimeRef.current) >= 3) {
      saveProgress(monumentId, language, audio.currentTime, audio.duration || duration);
      lastSavedTimeRef.current = audio.currentTime;
    }
  };

  const handleOnPlay = () => {
    setIsPlaying(true);
  };

  const handleOnPause = () => {
    setIsPlaying(false);
  };

  const handleOnEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasRestoredPosition(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    saveProgress(monumentIdRef.current, languageRef.current, 0, duration);
  };

  const handleError = () => {
    setIsAvailable(false);
    setIsPlaying(false);
  };

  // Play / Pause Toggle
  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioFileUrl || !isAvailable) return;

    if (audio.paused) {
      // Si el audio había finalizado o está al final, reiniciar desde el principio
      if (audio.ended || (audio.duration && audio.currentTime >= audio.duration - 0.5)) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      audio.playbackRate = playbackRate;
      try {
        await audio.play();
        setHasRestoredPosition(false);
      } catch (error: any) {
        // Ignorar interrupciones benignas de reproducción (AbortError / interrupted)
        if (error?.name !== 'AbortError' && !error?.message?.includes('interrupted')) {
          console.error('AUDIO PLAY ERROR:', error);
        }
      }
    } else {
      audio.pause();
    }
  };

  // Salto de 10 segundos
  const handleSkip = (deltaSeconds: number) => {
    const audio = audioRef.current;
    if (!audio || !isAvailable) return;
    const targetDuration = audio.duration || duration || 0;
    const newTime = Math.max(0, Math.min(audio.currentTime + deltaSeconds, targetDuration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    saveProgress(monumentIdRef.current, languageRef.current, newTime, targetDuration);
    lastSavedTimeRef.current = newTime;
  };

  // Reiniciar a 00:00 manualmente
  const handleResetToStart = () => {
    const audio = audioRef.current;
    if (!audio || !isAvailable) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    setHasRestoredPosition(false);
    saveProgress(monumentIdRef.current, languageRef.current, 0, duration);
    lastSavedTimeRef.current = 0;
  };

  // Cambio manual en la barra de progreso
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && isAvailable) {
      audioRef.current.currentTime = newTime;
      saveProgress(monumentIdRef.current, languageRef.current, newTime, duration);
      lastSavedTimeRef.current = newTime;
    }
  };

  // Selector de velocidad
  const handleToggleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackRate(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="custom-audioguide-player"
      className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#E6D5B8] flex flex-col space-y-4"
    >
      {/* Elemento de Audio HTML5 real gestionado por React */}
      <audio
        ref={audioRef}
        src={audioFileUrl || undefined}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onEnded={handleOnEnded}
        onError={handleError}
        className="hidden"
      />

      {/* Cabecera del Reproductor */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E6D5B8]/60 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#A0522D] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#A0522D]">
              Audioguía Oficial
            </p>
            <h4 className="text-xs sm:text-sm font-black text-[#4A3728] truncate uppercase tracking-tight">
              {monumentName}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Botón de reinicio a 00:00 si se ha restaurado progreso previo */}
          {hasRestoredPosition && !isPlaying && (
            <button
              onClick={handleResetToStart}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#E6D5B8] bg-[#F9F7F2] text-[#A0522D] text-[11px] font-bold hover:bg-[#E6D5B8]/50 transition-all cursor-pointer"
              title="Volver a escuchar desde el inicio"
            >
              <ResetIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Desde inicio</span>
            </button>
          )}

          {/* Selector de velocidad */}
          <button
            id="btn-audio-speed"
            onClick={handleToggleSpeed}
            disabled={!isAvailable}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-black transition-all ${
              isAvailable
                ? 'bg-[#E6D5B8]/50 hover:bg-[#E6D5B8] border-[#d8c5a4] text-[#4A3728] active:scale-95 cursor-pointer'
                : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-60'
            }`}
            title="Velocidad de reproducción"
          >
            <Gauge className="w-3 h-3 text-[#A0522D]" />
            <span>{playbackRate}x</span>
          </button>
        </div>
      </div>

      {/* Barra de progreso y tiempos */}
      <div className="w-full space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-black font-mono text-[#4A3728]">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[#5D4037]/70">{formatTime(duration)}</span>
        </div>

        <div className="relative flex items-center">
          <input
            id="audio-progress-slider"
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={currentTime}
            disabled={!isAvailable}
            onChange={handleProgressChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            aria-label="Progreso de la pista de audio"
            className={`w-full h-2 rounded-full appearance-none z-10 ${
              isAvailable ? 'bg-[#E6D5B8] cursor-pointer' : 'bg-stone-200 cursor-not-allowed opacity-60'
            }`}
            style={{
              background: isAvailable
                ? `linear-gradient(to right, #A0522D 0%, #A0522D ${progressPercentage}%, #E6D5B8 ${progressPercentage}%, #E6D5B8 100%)`
                : '#E5E7EB',
            }}
          />
        </div>
      </div>

      {/* Controles de Transporte */}
      <div className="flex items-center justify-center space-x-6 sm:space-x-8 pt-2">
        {/* Retroceder 10s */}
        <button
          id="btn-audio-skip-back"
          onClick={() => handleSkip(-10)}
          disabled={!isAvailable}
          className={`flex flex-col items-center justify-center p-2 transition-all ${
            isAvailable
              ? 'text-[#4A3728] opacity-70 hover:opacity-100 hover:text-[#A0522D] active:scale-90 cursor-pointer group'
              : 'text-stone-300 opacity-40 cursor-not-allowed'
          }`}
          title="Retroceder 10 segundos"
          aria-label="Retroceder 10 segundos"
        >
          <div className="relative flex items-center justify-center">
            <RotateCcw className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
            <span className="absolute text-[8px] font-black mt-0.5">10</span>
          </div>
        </button>

        {/* Botón Central Play / Pause */}
        <button
          id="btn-audio-play-pause"
          onClick={handleTogglePlay}
          disabled={!isAvailable}
          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white shadow-xl transition-all border-2 border-white/20 ${
            isAvailable
              ? 'bg-[#A0522D] hover:bg-[#8B4513] shadow-[#A0522D]/35 active:scale-95 cursor-pointer'
              : 'bg-stone-400 opacity-60 cursor-not-allowed shadow-none'
          }`}
          aria-label={
            !isAvailable
              ? 'Audioguía no disponible todavía'
              : isPlaying
              ? 'Pausar audioguía'
              : 'Reproducir audioguía'
          }
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current text-white" />
          ) : (
            <Play className="w-8 h-8 fill-current text-white ml-1" />
          )}
        </button>

        {/* Avanzar 10s */}
        <button
          id="btn-audio-skip-forward"
          onClick={() => handleSkip(10)}
          disabled={!isAvailable}
          className={`flex flex-col items-center justify-center p-2 transition-all ${
            isAvailable
              ? 'text-[#4A3728] opacity-70 hover:opacity-100 hover:text-[#A0522D] active:scale-90 cursor-pointer group'
              : 'text-stone-300 opacity-40 cursor-not-allowed'
          }`}
          title="Avanzar 10 segundos"
          aria-label="Avanzar 10 segundos"
        >
          <div className="relative flex items-center justify-center">
            <RotateCw className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute text-[8px] font-black mt-0.5">10</span>
          </div>
        </button>
      </div>

      {/* Mensaje de estado inferior */}
      <div className="text-center pt-1">
        {isAvailable ? (
          <span className="text-[10px] font-black text-[#A0522D] uppercase tracking-widest">
            {isPlaying
              ? '🎧 Reproduciendo audioguía oficial...'
              : hasRestoredPosition
              ? `Reanudando en ${formatTime(currentTime)} • Pulsa Play para continuar`
              : 'Audioguía Oficial Almagro'}
          </span>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-900 text-xs font-bold shadow-2xs">
            <VolumeX className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Audioguía no disponible todavía</span>
          </div>
        )}
      </div>
    </div>
  );
};

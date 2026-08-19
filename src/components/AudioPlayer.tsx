import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Gauge,
  Headphones,
  VolumeX,
} from 'lucide-react';
import { LanguageCode } from '../types';

interface AudioPlayerProps {
  monumentName: string;
  durationSeconds: number;
  language: LanguageCode;
  audioFileUrl?: string;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
  const rounded = Math.floor(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  monumentName,
  durationSeconds,
  language,
  audioFileUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(durationSeconds || 180);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Handle Track Source & Language Switch
  useEffect(() => {
    // 1. Detener el audio actual si estaba sonando
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // 2. Resetear estados al idioma / archivo nuevo
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(durationSeconds || 180);
    setIsAvailable(true);

    if (!audioFileUrl) {
      setIsAvailable(false);
      return;
    }

    // 3. Crear y configurar elemento de audio HTML5
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = audioFileUrl;
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsAvailable(true);
    };

    const handleTimeUpdate = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(audio.currentTime);
      }
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handleError = () => {
      // El archivo MP3 no está físicamente disponible
      setIsAvailable(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // 4. Ejecutar load()
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [audioFileUrl, language, durationSeconds]);

  // Play / Pause Toggle
  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !isAvailable || !audioFileUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // No se pudo reproducir el MP3 (archivo aún no cargado en el servidor)
            setIsAvailable(false);
            setIsPlaying(false);
          });
      }
    }
  };

  // Salto de 10 segundos
  const handleSkip = (deltaSeconds: number) => {
    const audio = audioRef.current;
    if (!audio || !isAvailable) return;
    const newTime = Math.max(0, Math.min(audio.currentTime + deltaSeconds, duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Cambio manual en la barra de progreso
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && isAvailable) {
      audioRef.current.currentTime = newTime;
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

  const progressPercentage = (currentTime / (duration || 1)) * 100;

  return (
    <div
      id="custom-audioguide-player"
      className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#E6D5B8] flex flex-col space-y-4"
    >
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
            max={duration}
            step="1"
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
            {isPlaying ? '🎧 Reproduciendo audioguía oficial...' : 'Audioguía Oficial Almagro'}
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

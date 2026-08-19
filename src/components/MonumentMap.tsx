import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Monument } from '../types';
import { Navigation, ArrowRight, AlertCircle, Loader2, MapPin, X } from 'lucide-react';

interface MonumentMapProps {
  monuments: Monument[];
  onSelectMonument: (monument: Monument) => void;
}

export const MonumentMap: React.FC<MonumentMapProps> = ({
  monuments,
  onSelectMonument,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Inicializar mapa interactivo de Leaflet con OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Coordenadas centrales del casco histórico de Almagro
    const almagroCenter: [number, number] = [38.8895, -3.7112];

    const map = L.map(mapContainerRef.current, {
      center: almagroCenter,
      zoom: 16,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Capa de mapas OpenStreetMap con atribución legal obligatoria
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Marcadores interactivos para los 6 monumentos
    const latLngs: L.LatLngTuple[] = [];

    monuments.forEach((monument, index) => {
      const latLng: L.LatLngTuple = [
        monument.coordinates.lat,
        monument.coordinates.lng,
      ];
      latLngs.push(latLng);

      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background-color: #4A3728;
            color: #C5A059;
            border-radius: 50%;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            font-weight: 900;
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedMonument(monument);
        map.panTo(latLng, {
          animate: true,
          duration: 0.5,
        });
      });

      markersRef.current[monument.id] = marker;
    });

    // Ajustar zoom y encuadre para que los 6 monumentos sean visibles
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: 16,
      });
    }

    // Cerrar tarjeta flotante al pulsar en el mapa
    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.custom-marker-icon')) return;
      setSelectedMonument(null);
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
    };
  }, [monuments]);

  // Manejador de geolocalización "Mi ubicación"
  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('La geolocalización no es compatible con tu navegador');
      setTimeout(() => setGeoError(null), 4000);
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17, {
            animate: true,
          });

          // Marcador de posición del usuario
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-marker-icon',
              html: `
                <div style="
                  position: relative;
                  width: 24px;
                  height: 24px;
                  background-color: #2563eb;
                  border-radius: 50%;
                  border: 3px solid #ffffff;
                  box-shadow: 0 0 12px rgba(37,99,235,0.6);
                ">
                  <div style="
                    position: absolute;
                    inset: -6px;
                    background-color: rgba(37,99,235,0.25);
                    border-radius: 50%;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: userIcon,
            }).addTo(mapInstanceRef.current);
          }
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Permiso de ubicación denegado en el navegador');
        } else {
          setGeoError('No se pudo obtener tu ubicación actual');
        }
        setTimeout(() => setGeoError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col flex-1 min-h-[500px] md:min-h-[600px] pb-20 md:pb-4">
      {/* Contenedor del Mapa */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[500px] md:min-h-[600px] flex-1 z-0 bg-[#E6D5B8]"
      />

      {/* Botón de Geolocalización "Mi ubicación" */}
      <div className="absolute top-4 left-4 z-20">
        <button
          id="btn-my-location"
          onClick={handleGetLocation}
          disabled={isLocating}
          className="bg-white hover:bg-[#F9F7F2] text-[#4A3728] font-bold text-xs py-2.5 px-3.5 rounded-2xl shadow-lg border border-[#E6D5B8] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-[#A0522D] animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 text-[#A0522D]" />
          )}
          <span>{isLocating ? 'Buscando...' : 'Mi ubicación'}</span>
        </button>
      </div>

      {/* Alerta de Error de Geolocalización */}
      {geoError && (
        <div className="absolute top-16 left-4 right-4 max-w-md md:mx-auto z-30 bg-[#4A3728] text-white text-xs py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 border border-[#C5A059]/40 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span className="font-semibold">{geoError}</span>
        </div>
      )}

      {/* Tarjeta Emergente del Monumento Seleccionado */}
      {selectedMonument && (
        <div className="absolute bottom-24 md:bottom-6 left-3 right-3 sm:left-6 sm:right-6 max-w-xl md:mx-auto z-30 animate-in slide-in-from-bottom duration-200">
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-[#E6D5B8] flex flex-col gap-3 relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedMonument(null)}
              className="absolute top-3 right-3 text-[#5D4037]/70 hover:text-[#4A3728] p-1 rounded-full hover:bg-[#E6D5B8]/40 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Información del monumento */}
            <div className="flex items-start gap-3.5 pr-6">
              {selectedMonument.thumbnailUrl ? (
                <img
                  src={selectedMonument.thumbnailUrl}
                  alt={selectedMonument.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-[#E6D5B8] shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#4A3728] border border-[#E6D5B8] shrink-0 shadow-xs flex items-center justify-center text-[#E6D5B8] text-[10px] font-bold text-center p-1 uppercase">
                  {selectedMonument.name.substring(0, 10)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-black uppercase text-[#4A3728] leading-tight">
                  {selectedMonument.name}
                </h4>
                {selectedMonument.subtitle && (
                  <p className="text-[11px] sm:text-xs font-bold text-[#A0522D] mt-0.5">
                    {selectedMonument.subtitle}
                  </p>
                )}
                <div className="flex items-start gap-1.5 mt-1 text-[11px] sm:text-xs text-[#5D4037] font-medium leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-[#A0522D] shrink-0 mt-0.5" />
                  <span>{selectedMonument.address}</span>
                </div>
              </div>
            </div>

            {/* Botón Descubrir */}
            <button
              id={`btn-map-discover-${selectedMonument.id}`}
              onClick={() => onSelectMonument(selectedMonument)}
              className="w-full bg-[#C5A059] hover:bg-[#b8944f] text-[#4A3728] font-black text-xs sm:text-sm py-3 rounded-2xl uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span>Descubrir</span>
              <ArrowRight className="w-4 h-4 text-[#4A3728]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

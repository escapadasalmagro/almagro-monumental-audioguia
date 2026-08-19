import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Footprints,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  computeWalkingRoute,
  formatDistance,
  formatDuration,
  WalkingRouteResult,
} from '../services/routingService';

interface MonumentLocationProps {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const MonumentLocation: React.FC<MonumentLocationProps> = ({
  name,
  address,
  coordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const monumentMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeBorderRef = useRef<L.Polyline | null>(null);

  const [routeState, setRouteState] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [routeData, setRouteData] = useState<WalkingRouteResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Inicializar mapa de Leaflet centrado en el monumento
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destruir mapa previo al cambiar de monumento
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    setRouteState('idle');
    setRouteData(null);
    setErrorMessage(null);
    setShowSteps(false);

    const monumentLatLng: [number, number] = [coordinates.lat, coordinates.lng];

    const map = L.map(mapContainerRef.current, {
      center: monumentLatLng,
      zoom: 17,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Capa de mapas Voyager de alto contraste
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Marcador del monumento
    const monumentIcon = L.divIcon({
      className: 'custom-monument-marker',
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background-color: #A0522D;
          color: #FFFFFF;
          border-radius: 50%;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(74, 55, 40, 0.4);
          cursor: pointer;
        ">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -42],
    });

    const marker = L.marker(monumentLatLng, { icon: monumentIcon }).addTo(map);
    monumentMarkerRef.current = marker;

    marker
      .bindPopup(
        `
        <div style="padding: 8px 10px; max-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <h4 style="margin: 0; font-size: 13px; font-weight: 900; color: #4A3728; text-transform: uppercase; line-height: 1.2;">
            ${name}
          </h4>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #5D4037; line-height: 1.3;">
            ${address}
          </p>
        </div>
      `,
        { closeButton: false }
      )
      .openPopup();

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
      routePolylineRef.current = null;
      routeBorderRef.current = null;
    };
  }, [coordinates.lat, coordinates.lng, name, address]);

  // Limpiar ruta previa en el mapa
  const clearRouteFromMap = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (routeBorderRef.current) {
      map.removeLayer(routeBorderRef.current);
      routeBorderRef.current = null;
    }
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
  };

  // Restablecer vista inicial del mapa
  const handleResetView = () => {
    clearRouteFromMap();
    setRouteState('idle');
    setRouteData(null);
    setErrorMessage(null);
    setShowSteps(false);

    const map = mapInstanceRef.current;
    if (map) {
      map.setView([coordinates.lat, coordinates.lng], 17, { animate: true });
      if (monumentMarkerRef.current) {
        monumentMarkerRef.current.openPopup();
      }
    }
  };

  // Obtener geolocalización y calcular la ruta a pie dentro de Almagro Monumental
  const handleGetWalkingDirections = () => {
    if (!navigator.geolocation) {
      setRouteState('error');
      setErrorMessage('Tu navegador no soporta geolocalización.');
      return;
    }

    setRouteState('loading');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        try {
          const result = await computeWalkingRoute(
            { lat: userLat, lng: userLng },
            { lat: coordinates.lat, lng: coordinates.lng }
          );

          const map = mapInstanceRef.current;
          if (!map) return;

          // 1. Limpiar elementos previos de ruta
          clearRouteFromMap();

          // 2. Crear marcador del usuario (punto azul con halo)
          const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 38px;
                height: 38px;
                background-color: #2563EB;
                color: #FFFFFF;
                border-radius: 50%;
                border: 3px solid #FFFFFF;
                box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M20 21a8 8 0 0 0-16 0"/>
                </svg>
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -19],
          });

          const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
          userMarker.bindPopup(
            '<div style="padding: 4px 6px; font-weight: bold; font-size: 11px; color: #1E3A8A;">Tu ubicación actual</div>'
          );
          userMarkerRef.current = userMarker;

          // 3. Dibujar la línea de la ruta a pie (borde blanco + trazo color tierra/albero)
          const borderPolyline = L.polyline(result.coordinates, {
            color: '#FFFFFF',
            weight: 7,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);
          routeBorderRef.current = borderPolyline;

          const mainPolyline = L.polyline(result.coordinates, {
            color: '#A0522D',
            weight: 4.5,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);
          routePolylineRef.current = mainPolyline;

          // 4. Ajustar encuadre y zoom automáticamente para que se vean Origen, Ruta y Destino
          const allPoints: [number, number][] = [
            [userLat, userLng],
            ...result.coordinates,
            [coordinates.lat, coordinates.lng],
          ];
          const bounds = L.latLngBounds(allPoints);
          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 18,
            animate: true,
          });

          // 5. Guardar resultado de la ruta
          setRouteData(result);
          setRouteState('active');
        } catch {
          setRouteState('error');
          setErrorMessage('No hemos podido calcular la ruta en este momento.');
        }
      },
      (error) => {
        setRouteState('error');
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Necesitamos tu ubicación para calcular cómo llegar.');
        } else {
          setErrorMessage('No hemos podido calcular la ruta en este momento.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <section
      id="seccion-ubicacion-monumento"
      className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#E6D5B8] flex flex-col space-y-4"
    >
      {/* 7. Cabecera de Ubicación: Título, Nombre del Monumento y Dirección */}
      <div className="space-y-2 border-b border-[#E6D5B8]/60 pb-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#A0522D]/15 flex items-center justify-center text-[#A0522D] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#A0522D]">
              Ubicación
            </h3>
          </div>

          {/* Botón para restablecer el mapa a la vista original */}
          {routeState === 'active' && (
            <button
              onClick={handleResetView}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A0522D] hover:text-[#4A3728] px-2.5 py-1 rounded-full bg-[#E6D5B8]/40 hover:bg-[#E6D5B8]/70 transition-all cursor-pointer"
              title="Restablecer mapa a vista de monumento"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ver monumento</span>
            </button>
          )}
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-black uppercase text-[#4A3728] leading-snug">
            {name}
          </h4>
          <div className="flex items-start gap-1.5 mt-1 text-xs sm:text-sm text-[#5D4037] font-medium leading-relaxed">
            <MapPin className="w-4 h-4 text-[#A0522D] shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Resumen de Ruta Calculada (si la ruta está activa) */}
      {routeState === 'active' && routeData && (
        <div
          id="resumen-ruta-activa"
          className="bg-[#F9F7F2] p-4 rounded-2xl border border-[#E6D5B8] space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#A0522D] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#A0522D]">
                  Ruta a pie calculada
                </p>
                <p className="text-sm sm:text-base font-black text-[#4A3728]">
                  🚶 {formatDuration(routeData.durationSeconds)} · {formatDistance(routeData.distanceMeters)} andando
                </p>
              </div>
            </div>

            {/* Botón desplegable opcional para ver los pasos */}
            {routeData.steps.length > 0 && (
              <button
                id="btn-toggle-indicaciones"
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center gap-1 text-xs font-black text-[#A0522D] bg-white border border-[#E6D5B8] px-3 py-1.5 rounded-full hover:bg-[#E6D5B8]/30 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <span>{showSteps ? 'Ocultar' : 'Ver indicaciones'}</span>
                {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Lista desplegable de indicaciones paso a paso (cerrada por defecto) */}
          {showSteps && routeData.steps.length > 0 && (
            <div className="pt-2 border-t border-[#E6D5B8]/70 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#A0522D]">
                Indicaciones paso a paso:
              </p>
              <ol className="space-y-2 text-xs text-[#4A3728] pl-1">
                {routeData.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#E6D5B8] text-[#4A3728] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold">{step.instruction}</span>
                      {step.distanceMeters > 0 && (
                        <span className="text-[10px] text-[#5D4037]/75 ml-1 font-medium">
                          ({formatDistance(step.distanceMeters)})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* 8. Mapa interactivo del monumento con ruta dibujada */}
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] rounded-2xl overflow-hidden border border-[#E6D5B8] shadow-xs">
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0 bg-[#E6D5B8]"
        />
      </div>

      {/* Mensaje de Error / Permiso Rechazado */}
      {routeState === 'error' && errorMessage && (
        <div
          id="error-ubicacion-aviso"
          className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 leading-snug">
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Botón Principal: "Cómo llegar" */}
      <div>
        {routeState === 'loading' ? (
          <div className="w-full bg-[#E6D5B8]/80 text-[#4A3728] font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 border border-[#d8c5a4]">
            <Loader2 className="w-5 h-5 animate-spin text-[#A0522D]" />
            <span>Calculando ruta a pie...</span>
          </div>
        ) : routeState === 'active' ? (
          <div className="flex gap-2">
            <button
              onClick={handleGetWalkingDirections}
              className="flex-1 bg-[#C5A059] hover:bg-[#b8944f] text-[#4A3728] font-black text-xs sm:text-sm py-3 px-3 rounded-2xl uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-[#d8c5a4] cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#4A3728]" />
              <span>Actualizar ruta</span>
            </button>
            <button
              onClick={handleResetView}
              className="bg-stone-100 hover:bg-stone-200 text-[#4A3728] font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border border-stone-300 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        ) : (
          <button
            id="btn-como-llegar-a-pie"
            onClick={handleGetWalkingDirections}
            className="w-full bg-[#C5A059] hover:bg-[#b8944f] text-[#4A3728] font-black text-sm sm:text-base py-3.5 px-4 rounded-2xl uppercase tracking-wider shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] border border-[#d8c5a4] cursor-pointer group"
          >
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A3728] group-hover:-translate-y-0.5 transition-transform" />
            <span>Cómo llegar (a pie)</span>
            <Footprints className="w-4 h-4 text-[#4A3728]/80 ml-1" />
          </button>
        )}
      </div>
    </section>
  );
};

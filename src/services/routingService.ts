// Servicio de cálculo de rutas a pie con OpenRouteService (foot-walking)
// Exclusivamente libre y sin dependencias de Google Maps

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
}

export interface WalkingRouteResult {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [lat, lng] para Leaflet
  steps: RouteStep[];
}

/**
 * Calcula una ruta peatonal (foot-walking) utilizando OpenRouteService.
 * Requiere la variable de entorno VITE_ORS_API_KEY.
 */
export async function computeWalkingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<WalkingRouteResult> {
  const orsApiKey = (import.meta.env.VITE_ORS_API_KEY as string | undefined)?.trim();

  // Si no existe la API Key de OpenRouteService, lanzamos un error controlado
  if (!orsApiKey) {
    throw new Error('MISSING_API_KEY');
  }

  try {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
      {
        method: 'POST',
        headers: {
          'Authorization': orsApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/geo+json',
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lng, origin.lat],
            [destination.lng, destination.lat],
          ],
          instructions: true,
          language: 'es',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ORS_ERROR_${response.status}`);
    }

    const data = await response.json();
    const feature = data.features?.[0];

    if (!feature || !feature.geometry || !feature.properties?.summary) {
      throw new Error('NO_ROUTE_FOUND');
    }

    const distanceMeters = Math.round(feature.properties.summary.distance || 0);
    const durationSeconds = Math.round(feature.properties.summary.duration || 0);

    // GeoJSON coordinates vienen como [lng, lat], Leaflet requiere [lat, lng]
    const rawCoords: [number, number][] = feature.geometry.coordinates || [];
    const coordinates: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng]);

    const steps: RouteStep[] = [];
    const segments = feature.properties.segments;
    if (Array.isArray(segments) && segments.length > 0 && Array.isArray(segments[0].steps)) {
      for (const step of segments[0].steps) {
        if (step.instruction) {
          steps.push({
            instruction: step.instruction,
            distanceMeters: Math.round(step.distance || 0),
          });
        }
      }
    }

    return {
      distanceMeters,
      durationSeconds,
      coordinates,
      steps,
    };
  } catch (err) {
    console.warn('[RoutingService] Error al consultar OpenRouteService:', err);
    throw err;
  }
}

/**
 * Formatea metros a texto amigable ("450 m" o "1,2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  const km = (meters / 1000).toFixed(1).replace('.', ',');
  return `${km} km`;
}

/**
 * Formatea segundos a tiempo estimado andando ("6 min" o "1 h 12 min")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainingMins} min`;
}

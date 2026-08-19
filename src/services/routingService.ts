// Servicio de cálculo de rutas a pie para Almagro Monumental
// Compatible con Google Maps Routes API y con motor fallback peatonal OpenStreetMap

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

// Decodificador de Google Encoded Polyline a coordenadas [lat, lng]
function decodeGooglePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Formateador de instrucciones paso a paso
function formatStepInstruction(maneuverType: string, modifier?: string, name?: string): string {
  const street = name && name.trim().length > 0 ? ` en ${name}` : '';
  
  switch (maneuverType) {
    case 'depart':
      return `Comienza la ruta a pie${street}`;
    case 'arrive':
      return 'Llegada al monumento de destino';
    case 'turn':
      if (modifier === 'left' || modifier === 'sharp left') return `Gira a la izquierda${street}`;
      if (modifier === 'right' || modifier === 'sharp right') return `Gira a la derecha${street}`;
      if (modifier === 'slight left') return `Gira ligeramente a la izquierda${street}`;
      if (modifier === 'slight right') return `Gira ligeramente a la derecha${street}`;
      return `Gira${street}`;
    case 'continue':
    case 'new name':
      return `Continúa recto${street}`;
    case 'roundabout':
    case 'rotary':
      return `En la glorieta, toma la salida hacia${street}`;
    default:
      return `Avanza${street}`;
  }
}

/**
 * Calcula una ruta a pie entre la posición actual del usuario y el monumento.
 * Si existe una GOOGLE_MAPS_PLATFORM_KEY, utiliza Google Routes API.
 * En caso contrario o si falla la red, utiliza el motor de rutas peatonales OSRM/OpenStreetMap.
 */
export async function computeWalkingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<WalkingRouteResult> {
  const googleApiKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  // 1. Si hay clave configurada de Google Maps Platform, intentamos con Routes API v2
  if (googleApiKey && googleApiKey.trim().length > 5) {
    try {
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps',
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: origin.lat,
                  longitude: origin.lng,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
            travelMode: 'WALK',
            computeAlternativeRoutes: false,
            languageCode: 'es-ES',
            units: 'METRIC',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const route = data.routes?.[0];
        if (route) {
          const distanceMeters = route.distanceMeters || 0;
          // duration viene en formato "240s"
          const rawDuration = route.duration || '0s';
          const durationSeconds = parseInt(rawDuration.replace('s', ''), 10) || Math.round(distanceMeters / 1.25);
          const encoded = route.polyline?.encodedPolyline || '';
          const coordinates = decodeGooglePolyline(encoded);

          const steps: RouteStep[] = [];
          if (route.legs?.[0]?.steps) {
            for (const step of route.legs[0].steps) {
              const text =
                step.navigationInstruction?.instructions ||
                step.description ||
                'Continúa a pie';
              steps.push({
                instruction: text,
                distanceMeters: step.distanceMeters || 0,
              });
            }
          }

          if (coordinates.length > 0) {
            return {
              distanceMeters,
              durationSeconds,
              coordinates,
              steps,
            };
          }
        }
      }
    } catch {
      // Fallback transparente al motor peatonal
    }
  }

  // 2. Motor peatonal de alta precisión basado en la red de calles de Almagro (OSRM)
  const url = `https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('No se pudo calcular la ruta');
  }

  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('Ruta no encontrada');
  }

  const route = data.routes[0];
  const distanceMeters = Math.round(route.distance);
  const durationSeconds = Math.round(route.duration);

  // GeoJSON coordinates vienen como [lng, lat], Leaflet requiere [lat, lng]
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]]
  );

  const steps: RouteStep[] = [];
  if (route.legs?.[0]?.steps) {
    for (const step of route.legs[0].steps) {
      if (step.distance > 0 || step.maneuver?.type === 'arrive') {
        const instruction = formatStepInstruction(
          step.maneuver?.type,
          step.maneuver?.modifier,
          step.name
        );
        steps.push({
          instruction,
          distanceMeters: Math.round(step.distance),
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

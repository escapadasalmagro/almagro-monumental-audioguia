import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Monument } from '../types';
import { INITIAL_MONUMENTS } from '../data/monuments';

/**
 * Fuente principal de monumentos (Datos Locales).
 * Carga instantánea sin latencia de red, sin dependencias de Firestore
 * y 100% compatible con despliegues estáticos (GitHub Pages, Hostinger, etc.).
 */
export function getMonuments(): Monument[] {
  return INITIAL_MONUMENTS;
}

/**
 * Función auxiliar para sincronización con Cloud Firestore.
 * Disponible para su activación en el futuro (ej. panel de administración).
 */
export async function fetchMonumentsFromFirestore(): Promise<Monument[]> {
  try {
    const monumentsRef = collection(db, 'monuments');
    const monumentsQuery = query(monumentsRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(monumentsQuery);

    if (!querySnapshot.empty && querySnapshot.docs.length > 0) {
      const firestoreMonuments: Monument[] = [];
      const defaultImage = '/corral-de-comedias/corral foto audio.jpeg';

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const name = data.name || '';
        const subtitle = data.subtitle || undefined;
        const shortDescription = data.shortDescription || '';
        const introductoryText =
          data.historyTextEs ||
          data.introductoryText ||
          data.originalText?.introductoryText ||
          '';
        const audioDurationSeconds =
          data.audioDurationSeconds ||
          data.originalText?.audioDurationSeconds ||
          180;
        const imageUrl = data.image || data.imageUrl || defaultImage;
        const thumbnailUrl =
          data.thumbnail || data.thumbnailUrl || data.image || data.imageUrl || defaultImage;
        const address = data.address || '';
        const location = data.location || data.address || '';
        const coordinates = {
          lat: data.latitude ?? data.coordinates?.lat ?? 38.8883,
          lng: data.longitude ?? data.coordinates?.lng ?? -3.71187,
        };
        const audioFiles = data.audio || data.audioFiles || {};
        const code = data.code || `ALM-00${data.order || 1}`;
        const tag = data.tag || 'Patrimonio Cultural';
        const century = data.century || 'Histórico';
        const visitDurationMinutes = data.visitDurationMinutes || 35;

        firestoreMonuments.push({
          id,
          code,
          name,
          subtitle,
          tag,
          century,
          address,
          location,
          coordinates,
          visitDurationMinutes,
          imageUrl,
          thumbnailUrl,
          originalText: {
            title: name,
            subtitle,
            shortDescription,
            introductoryText,
            audioDurationSeconds,
          },
          audioFiles,
        });
      });

      return firestoreMonuments;
    }

    return INITIAL_MONUMENTS;
  } catch (error) {
    console.warn('[Firestore] Error al consultar Firestore:', error);
    return INITIAL_MONUMENTS;
  }
}

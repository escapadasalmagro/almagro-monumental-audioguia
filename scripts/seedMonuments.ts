import { doc, setDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

export interface MonumentSeedData {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  shortDescription: string;
  historyTextEs: string;
  image: string;
  thumbnail: string;
  address: string;
  latitude: number;
  longitude: number;
  order: number;
  century: string;
  tag: string;
  visitDurationMinutes: number;
  audio: {
    es: string;
    en: string;
    fr: string;
    it: string;
    de: string;
    zh: string;
  };
}

export const MONUMENTS_TO_SEED: MonumentSeedData[] = [
  {
    id: 'corral-comedias',
    slug: 'corral-comedias',
    name: 'Corral de Comedias',
    order: 1,
    tag: 'Monumento Nacional',
    century: 'Siglo XVII',
    address: 'Plaza Mayor, 18, 13270 Almagro, Ciudad Real, España',
    latitude: 38.8883,
    longitude: -3.71187,
    visitDurationMinutes: 45,
    image: 'https://drive.google.com/thumbnail?id=1hWsRq--BfdNJ_PagbXHd1mJjWC5zXD66&sz=w1200',
    thumbnail: 'https://drive.google.com/thumbnail?id=1hWsRq--BfdNJ_PagbXHd1mJjWC5zXD66&sz=w400',
    shortDescription: 'El único corral de comedias del Siglo de Oro conservado intacto.',
    historyTextEs: 'El Corral de Comedias de Almagro es un teatro histórico del siglo XVII, el único que se conserva íntegro de esa época. Declarado Monumento Nacional, sigue acogiendo representaciones teatrales, especialmente durante el Festival Internacional de Teatro Clásico de Almagro.',
    audio: {
      es: '/audio/corral/es.mp3',
      en: '/audio/corral/en.mp3',
      fr: '/audio/corral/fr.mp3',
      it: '/audio/corral/it.mp3',
      de: '/audio/corral/de.mp3',
      zh: '/audio/corral/zh.mp3',
    },
  },
  {
    id: 'iglesia-san-agustin',
    slug: 'iglesia-san-agustin',
    name: 'Iglesia de San Agustín',
    order: 2,
    tag: 'Monumento Barroco',
    century: 'Siglo XVIII',
    address: 'Calle San Agustín, 2, 13270 Almagro, Ciudad Real, España',
    latitude: 38.88912,
    longitude: -3.71123,
    visitDurationMinutes: 35,
    image: 'https://drive.google.com/thumbnail?id=17hgohdxbFFFDLhIiLGvo9a8SV-Gl_NQv&sz=w1200',
    thumbnail: 'https://drive.google.com/thumbnail?id=17hgohdxbFFFDLhIiLGvo9a8SV-Gl_NQv&sz=w400',
    shortDescription: 'Antiguo convento agustino con una impresionante arquitectura barroca.',
    historyTextEs: 'La Iglesia de San Agustín, de estilo barroco con influencias clasicistas, fue parte del antiguo convento de los Agustinos. Destaca por su imponente fachada y su retablo mayor. Actualmente, alberga eventos culturales y exposiciones.',
    audio: {
      es: '/audio/san-agustin/es.mp3',
      en: '/audio/san-agustin/en.mp3',
      fr: '/audio/san-agustin/fr.mp3',
      it: '/audio/san-agustin/it.mp3',
      de: '/audio/san-agustin/de.mp3',
      zh: '/audio/san-agustin/zh.mp3',
    },
  },
  {
    id: 'convento-asuncion',
    slug: 'convento-asuncion',
    name: 'Claustro del Convento de la Asunción',
    order: 3,
    tag: 'Joya Renacentista',
    century: 'Siglo XVI',
    address: 'Ejido de Calatrava s/n, 13270 Almagro, Ciudad Real, España',
    latitude: 38.89078,
    longitude: -3.70620,
    visitDurationMinutes: 40,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80',
    shortDescription: 'Uno de los grandes ejemplos del Renacimiento en Almagro.',
    historyTextEs: 'El Claustro del Convento de la Asunción de Calatrava es una joya del Renacimiento español. Formaba parte de un importante convento fundado por la Orden de Calatrava. Sus dos plantas de galerías con arcos de medio punto sobre columnas de mármol son de gran belleza.',
    audio: {
      es: '/audio/claustro/es.mp3',
      en: '/audio/claustro/en.mp3',
      fr: '/audio/claustro/fr.mp3',
      it: '/audio/claustro/it.mp3',
      de: '/audio/claustro/de.mp3',
      zh: '/audio/claustro/zh.mp3',
    },
  },
  {
    id: 'palacio-fucares',
    slug: 'palacio-fucares',
    name: 'Palacio de Juan de Jedler',
    subtitle: 'Antiguo Palacio de los Fúcares',
    order: 4,
    tag: 'Arquitectura Civil S. XVI',
    century: 'Siglo XVI',
    address: 'Calle Arzobispo Cañizares, 6, 13270 Almagro, Ciudad Real, España',
    latitude: 38.88992,
    longitude: -3.70999,
    visitDurationMinutes: 35,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    shortDescription: 'Un destacado ejemplo de arquitectura civil almagreña del siglo XVI.',
    historyTextEs: 'La Casa Palacio de los Jedler, conocida también como Palacio de los Fúcares, es un notable ejemplo de la arquitectura civil del siglo XVI, construida por una familia de banqueros alemanes. Presenta una fachada sobria y un patio interior con elementos góticos y renacentistas.',
    audio: {
      es: '/audio/palacio-fucares/FUCARES_01_SPAIN.mp3',
      en: '/audio/palacio-fucares/FUCARES_01_INGLES.mp3',
      fr: '/audio/palacio-fucares/FUCARES_01_FRANCES.mp3',
      it: '/audio/palacio-fucares/FUCARES_01_ITALIANO.mp3',
      de: '/audio/palacio-fucares/FUCARES_01_ALEMAN.mp3',
      zh: '/audio/palacio-fucares/FUCARES_01_CHINO.mp3',
    },
  },
  {
    id: 'teatro-municipal',
    slug: 'teatro-municipal',
    name: 'Teatro Municipal',
    order: 5,
    tag: 'Teatro Histórico S. XIX',
    century: 'Siglo XIX',
    address: 'Calle San Agustín, 8, 13270 Almagro, Ciudad Real, España',
    latitude: 38.89036,
    longitude: -3.71162,
    visitDurationMinutes: 30,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80',
    shortDescription: 'Elegante teatro del siglo XIX situado en el centro histórico de Almagro.',
    historyTextEs: 'El Teatro Municipal de Almagro, construido en el siglo XIX, es un elegante espacio escénico que complementa la oferta teatral de la ciudad. Con una arquitectura típica de los teatros de la época, acoge diversas representaciones y eventos culturales a lo largo del año.',
    audio: {
      es: '/audio/teatro/es.mp3',
      en: '/audio/teatro/en.mp3',
      fr: '/audio/teatro/fr.mp3',
      it: '/audio/teatro/it.mp3',
      de: '/audio/teatro/de.mp3',
      zh: '/audio/teatro/zh.mp3',
    },
  },
  {
    id: 'museo-encaje',
    slug: 'museo-encaje',
    name: 'Museo del Encaje y la Blonda',
    order: 6,
    tag: 'Artesanía y Tradición',
    century: 'Tradición Histórica',
    address: 'Callejón del Villar, 13270 Almagro, Ciudad Real, España',
    latitude: 38.88906,
    longitude: -3.71203,
    visitDurationMinutes: 40,
    image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=400&q=80',
    shortDescription: 'Un espacio dedicado a una de las tradiciones artesanales más características de Almagro.',
    historyTextEs: 'Un museo dedicado a la tradición del encaje y blonda, mostrando técnicas artesanales y piezas históricas. Almagro es famoso por su encaje de bolillos, y este museo preserva y exhibe esta importante herencia cultural y artesanal.',
    audio: {
      es: '/audio/museo-encaje/AUDIO_ENCAJE_2026_SPAIN.mp3',
      en: '/audio/museo-encaje/AUDIO_ENCAJE_2026_INGLES.mp3',
      fr: '/audio/museo-encaje/AUDIO_ENCAJE_2026_FRANCES.mp3',
      it: '/audio/museo-encaje/AUDIO_ENCAJE_2026_ITALIANO.mp3',
      de: '/audio/museo-encaje/AUDIO_ENCAJE_2026_ALEMAN.mp3',
      zh: '/audio/museo-encaje/AUDIO_ENCAJE_2026_CHINO.mp3',
    },
  },
];

export async function seedMonuments() {
  console.log('🚀 Iniciando migración controlada de monumentos a Cloud Firestore...');
  let count = 0;

  for (const monument of MONUMENTS_TO_SEED) {
    try {
      const docRef = doc(db, 'monuments', monument.id);
      await setDoc(docRef, monument, { merge: true });
      console.log(`✅ [${monument.order}/6] Documento '${monument.id}' migrado correctamente.`);
      count++;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Error al escribir '${monument.id}':`, errorMsg);
      throw err;
    }
  }

  console.log(`🎉 Migración completada con éxito. ${count} monumentos guardados en Firestore.`);
}

// Ejecución directa si se invoca por CLI
if (typeof process !== 'undefined' && process.argv[1]?.includes('seedMonuments')) {
  seedMonuments()
    .then(() => {
      console.log('Finalizado.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fallo en la migración:', err);
      process.exit(1);
    });
}

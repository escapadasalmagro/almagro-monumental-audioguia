import { LanguageCode } from '../types';

// Carga centralizada y segura de todos los archivos de audio en /audios/ gestionados por Vite
// Vite resuelve e incluye cada archivo MP3 en el bundle de producción (dist/assets/)
const audioModules = import.meta.glob<string>(
  '/audios/**/*.mp3',
  {
    eager: true,
    import: 'default',
  }
);

// Mapeo entre idiomas y palabras clave en los nombres de archivo
const LANG_PATTERNS: Record<LanguageCode, string[]> = {
  es: ['SPAIN', 'ESPANOL', 'SPANISH', '_ES_', '_ES.'],
  en: ['INGLES', 'ENGLISH', '_EN_', '_EN.'],
  fr: ['FRANCES', 'FRENCH', '_FR_', '_FR.'],
  it: ['ITALIANO', 'ITALIAN', '_IT_', '_IT.'],
  de: ['ALEMAN', 'GERMAN', 'DEUTSCH', '_DE_', '_DE.'],
  zh: ['CHINO', 'CHINESE', '_ZH_', '_ZH.'],
};

const MONUMENT_FOLDERS: Record<string, string[]> = {
  'corral-de-comedias': ['corral-de-comedias', 'corral'],
  'iglesia-de-san-agustin': ['iglesia-de-san-agustin', 'san-agustin', 'san_agustin'],
  'claustro-del-convento-de-la-asuncion': ['claustro-del-convento-de-la-asuncion', 'convento-asuncion', 'asuncion'],
  'palacio-de-juan-de-jedler': ['palacio-de-juan-de-jedler', 'palacio-fucares', 'fucares', 'juan-de-jedler'],
  'teatro-municipal': ['teatro-municipal', 'teatro'],
  'museo-del-encaje-y-la-blonda': ['museo-del-encaje-y-la-blonda', 'museo-encaje', 'encaje'],
};

/**
 * Busca en audioModules el archivo MP3 correspondiente al monumento e idioma
 */
export function getMonumentAudioUrl(monumentId: string, language: LanguageCode): string | null {
  const folders = MONUMENT_FOLDERS[monumentId] || [monumentId];
  const patterns = LANG_PATTERNS[language] || [];

  for (const [pathKey, url] of Object.entries(audioModules)) {
    const upperKey = pathKey.toUpperCase();
    const matchesFolder = folders.some((f) => upperKey.includes(`/${f.toUpperCase()}/`));
    if (matchesFolder) {
      const fileName = pathKey.split('/').pop()?.toUpperCase() || '';
      const matchesLang = patterns.some((p) => fileName.includes(p.toUpperCase()));
      if (matchesLang) {
        return url;
      }
    }
  }
  return null;
}

/**
 * Genera el mapa de los 6 idiomas para un monumento
 */
export function getMonumentAudioFiles(monumentId: string): Record<LanguageCode, string | null> {
  return {
    es: getMonumentAudioUrl(monumentId, 'es'),
    en: getMonumentAudioUrl(monumentId, 'en'),
    fr: getMonumentAudioUrl(monumentId, 'fr'),
    it: getMonumentAudioUrl(monumentId, 'it'),
    de: getMonumentAudioUrl(monumentId, 'de'),
    zh: getMonumentAudioUrl(monumentId, 'zh'),
  };
}

/**
 * Mapa centralizado de todos los monumentos e idiomas
 */
export const MONUMENT_AUDIOS: Record<string, Record<LanguageCode, string | null>> = {
  'corral-de-comedias': getMonumentAudioFiles('corral-de-comedias'),
  'iglesia-de-san-agustin': getMonumentAudioFiles('iglesia-de-san-agustin'),
  'claustro-del-convento-de-la-asuncion': getMonumentAudioFiles('claustro-del-convento-de-la-asuncion'),
  'palacio-de-juan-de-jedler': getMonumentAudioFiles('palacio-de-juan-de-jedler'),
  'teatro-municipal': getMonumentAudioFiles('teatro-municipal'),
  'museo-del-encaje-y-la-blonda': getMonumentAudioFiles('museo-del-encaje-y-la-blonda'),
};

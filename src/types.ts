export type LanguageCode = 'es' | 'en' | 'fr' | 'it' | 'de' | 'zh';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OriginalSpanishContent {
  title: string;
  subtitle?: string;
  shortDescription: string;
  introductoryText: string;
  audioDurationSeconds: number;
}

export interface Monument {
  id: string;
  code: string;
  name: string;
  subtitle?: string;
  tag: string;
  century: string;
  address: string;
  location: string;
  coordinates: Coordinates;
  visitDurationMinutes: number;
  imageUrl: string;
  thumbnailUrl: string;
  // Original Spanish Content - The single source of truth for all texts
  originalText: OriginalSpanishContent;
  // Audio file paths per language (e.g. /audio/palacio-fucares/FUCARES_01_SPAIN.mp3)
  audioFiles: Record<LanguageCode, string | null>;
}

export type NavigationTab = 'inicio' | 'mapa';

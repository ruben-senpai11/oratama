export type BookGenre =
  | 'roman'
  | 'conte'
  | 'poésie'
  | 'essai'
  | 'nouvelle'
  | 'jeunesse';

export interface Book {
  id: string;
  titre: string;
  auteur: string;
  pays: string;
  genre: BookGenre;
  categorie?: string; // Catégorie thématique spécifique et unique
  pages: number;
  prixFcfa: number;
  themes: string[];
  resume: string;
  presentationAuteur: string; // environ 70 mots
  extrait: string; // environ 120 mots
  couleurBg: string; // pour couverture générée en CSS
  couleurAccent: string;
}

export type BookLengthFilter = 'court' | 'long';

export interface ParsedQuery {
  raw: string;
  normalized: string;
  genre?: BookGenre;
  longueur?: BookLengthFilter;
  pays?: string;
  themes: string[];
  maxPrixFcfa?: number;
  langueDemandee?: string;
  langueNonDisponible?: boolean;
  langueNonDisponibleMessage?: string;
  isUnderstood: boolean;
}

export interface MatchFilter {
  id: string;
  type: 'genre' | 'longueur' | 'pays' | 'theme' | 'prix';
  label: string;
  value: string;
}

export interface ScoredBook {
  book: Book;
  score: number;
  matchReasons: string[];
}

export interface RecordedVoice {
  bookId: string;
  audioBlob: Blob;
  mimeType: string;
  durationSeconds: number;
  createdAt: number;
}

export type ViewScreen =
  | { name: 'home' }
  | { name: 'results'; query: string; parsed?: ParsedQuery }
  | { name: 'book'; bookId: string }
  | { name: 'reader'; bookId: string }
  | { name: 'author'; bookId?: string }
  | { name: 'about' };

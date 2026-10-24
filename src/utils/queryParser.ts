import { Book, BookGenre, BookLengthFilter, MatchFilter, ParsedQuery, ScoredBook } from '../types';

/**
 * Normalise une chaîne de caractères :
 * - passage en minuscules
 * - suppression des accents / diacritiques
 * - remplacement des apostrophes et tirets par des espaces simples
 * - suppression de la ponctuation résiduelle
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`\-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dictionnaire de détection des genres
 */
const GENRE_PATTERNS: { genre: BookGenre; regex: RegExp }[] = [
  { genre: 'roman', regex: /\b(roman|romans|romanesque)\b/ },
  { genre: 'conte', regex: /\b(conte|contes|fable|fables|legende|legendes)\b/ },
  { genre: 'poésie', regex: /\b(poesie|poesies|poeme|poemes|poetique|poetiques|vers)\b/ },
  { genre: 'essai', regex: /\b(essai|essais|reflexion|reflexions|traite)\b/ },
  { genre: 'nouvelle', regex: /\b(nouvelle|nouvelles|recueil)\b/ },
  { genre: 'jeunesse', regex: /\b(jeunesse|enfant|enfants|petit|petits|jeune|jeunes)\b/ },
];

/**
 * Dictionnaire de détection des pays / nationalités africaines
 */
const COUNTRY_PATTERNS: { pays: string; regex: RegExp }[] = [
  { pays: 'Bénin', regex: /\b(benin|beninois|beninoise|beninoises|cotonou|porto novo|dassa|ganvie)\b/ },
  { pays: 'Togo', regex: /\b(togo|togolais|togolaise|togolaises|lome|kpalime)\b/ },
  { pays: "Côte d'Ivoire", regex: /\b(cote d ivoire|cote divoire|ivoirien|ivoirienne|ivoiriens|ivoiriennes|abidjan|treichville|yopougon)\b/ },
  { pays: 'Sénégal', regex: /\b(senegal|senegalais|senegalaise|senegalaises|dakar|saint louis|ndar)\b/ },
  { pays: 'Cameroun', regex: /\b(cameroun|camerounais|camerounaise|camerounaises|yaounde|douala)\b/ },
  { pays: 'Gabon', regex: /\b(gabon|gabonais|gabonaise|gabonaises|libreville)\b/ },
  { pays: 'Mali', regex: /\b(mali|malien|malienne|maliens|maliennes|bamako|djenne|tombouctou)\b/ },
  { pays: 'Congo', regex: /\b(congo|congolais|congolaise|congolaises|brazzaville|kinshasa)\b/ },
  { pays: 'Nigéria', regex: /\b(nigeria|nigerian|nigeriane|nigerians|nigerianes|lagos)\b/ },
  { pays: 'Guinée', regex: /\b(guinee|guineen|guineenne|guineens|guineennes|conakry)\b/ },
  { pays: 'Burkina Faso', regex: /\b(burkina|burkinabe|burkinabes|ouagadougou)\b/ },
];

/**
 * Détection des langues non supportées
 */
const UNSUPPORTED_LANGUAGES: { name: string; regex: RegExp }[] = [
  { name: 'Fon', regex: /\b(fon|en fon|langue fon)\b/ },
  { name: 'Yoruba', regex: /\b(yoruba|en yoruba|langue yoruba)\b/ },
  { name: 'Goun', regex: /\b(goun|en goun|gun|en gun|langue goun)\b/ },
  { name: 'Wolof', regex: /\b(wolof|en wolof)\b/ },
  { name: 'Bambara', regex: /\b(bambara|en bambara)\b/ },
  { name: 'Anglais', regex: /\b(anglais|en anglais|english)\b/ },
  { name: 'Ewe', regex: /\b(ewe|en ewe|mina|en mina)\b/ },
  { name: 'Baoulé', regex: /\b(baoule|en baoule)\b/ },
  { name: 'Haoussa', regex: /\b(haoussa|en haoussa|hausa)\b/ },
];

/**
 * Détection des thèmes
 */
const THEME_PATTERNS: { theme: string; regex: RegExp }[] = [
  { theme: 'amour', regex: /\b(amour|amours|amoureux|amoureuse|romance|sentimental|aimer)\b/ },
  { theme: 'famille', regex: /\b(famille|familles|familial|fratrie|frere|freres|soeur|soeurs|parent|parents|mere|peres)\b/ },
  { theme: 'mémoire', regex: /\b(memoire|memoires|souvenir|souvenirs|racines|ancetre|ancetres|passe)\b/ },
  { theme: 'ville', regex: /\b(ville|villes|urbain|urbaine|metropole|capitale|rues|quartier|quartiers)\b/ },
  { theme: 'enfance', regex: /\b(enfance|enfant|enfants|fillette|garcon|ecolier|ecoliers)\b/ },
  { theme: 'voyage', regex: /\b(voyage|voyages|voyager|traversee|aventure|aventures|depart|exil)\b/ },
  { theme: 'histoire', regex: /\b(histoire|histoires|historique|siecle|epoque|guerre|paix)\b/ },
  { theme: 'nature', regex: /\b(nature|baobab|baobabs|arbre|arbres|foret|forets|animaux|faune|terre)\b/ },
  { theme: 'philosophie', regex: /\b(philosophie|philosophe|sagesse|pensee|penser|reflexion)\b/ },
  { theme: 'société', regex: /\b(societe|societes|social|politique|communaute|solidarite|hospitalite)\b/ },
  { theme: 'exil', regex: /\b(exil|exile|exiles|migration|migrant|diaspora)\b/ },
];

/**
 * Analyse une requête textuelle ou vocale en français pur
 */
export function parseQuery(rawQuery: string): ParsedQuery {
  const raw = rawQuery || '';
  const normalized = normalizeText(raw);

  if (!normalized) {
    return {
      raw,
      normalized: '',
      themes: [],
      isUnderstood: false,
    };
  }

  // 1. Détection de langue
  let langueDemandee: string | undefined;
  let langueNonDisponible = false;
  let langueNonDisponibleMessage: string | undefined;

  for (const item of UNSUPPORTED_LANGUAGES) {
    if (item.regex.test(normalized)) {
      langueDemandee = item.name;
      langueNonDisponible = true;
      langueNonDisponibleMessage = `La langue ${item.name} n'est pas encore disponible pour la synthèse vocale ni pour le catalogue. L'interface et les extraits sont actuellement en français.`;
      break;
    }
  }

  // 2. Détection du genre
  let detectedGenre: BookGenre | undefined;
  for (const item of GENRE_PATTERNS) {
    // Si c'est "jeunesse" mais que c'est un "petit roman", on privilégie roman
    if (item.genre === 'jeunesse' && /\b(roman|conte|poesie|essai|nouvelle)\b/.test(normalized)) {
      continue;
    }
    if (item.regex.test(normalized)) {
      detectedGenre = item.genre;
      break;
    }
  }

  // 3. Détection de la longueur
  let detectedLength: BookLengthFilter | undefined;
  if (
    /\b(court|courte|courts|courtes|bref|breve|petit|petite|rapide a lire|moins de 150 pages|moins de cent cinquante pages)\b/.test(
      normalized
    )
  ) {
    detectedLength = 'court';
  } else if (
    /\b(long|longue|longs|longues|grand|grande|epais|epaisse|volumineux|plus de 200 pages)\b/.test(
      normalized
    )
  ) {
    detectedLength = 'long';
  }

  // 4. Détection du pays
  let detectedCountry: string | undefined;
  for (const item of COUNTRY_PATTERNS) {
    if (item.regex.test(normalized)) {
      detectedCountry = item.pays;
      break;
    }
  }

  // 5. Détection des thèmes
  const detectedThemes: string[] = [];
  for (const item of THEME_PATTERNS) {
    if (item.regex.test(normalized)) {
      if (!detectedThemes.includes(item.theme)) {
        detectedThemes.push(item.theme);
      }
    }
  }

  // 6. Détection du prix
  let detectedMaxPrice: number | undefined;
  // Match "moins de 2000 francs", "moins de 1500 fcfa", "maximum 2000", "sous 2000", "pas plus de 3000", "a moins de 1500"
  const priceRegex = /(?:moins de|maximum|sous|pas plus de|inferieur a|a moins de|jusqu a)\s*(\d{2,5})\s*(?:francs?|fcfa|f|cfa)?/i;
  const priceMatch = normalized.match(priceRegex);
  if (priceMatch && priceMatch[1]) {
    const parsed = parseInt(priceMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      detectedMaxPrice = parsed;
    }
  } else if (/\b(cinq mille francs?|5000 francs?|cinq mille fcfa)\b/.test(normalized)) {
    detectedMaxPrice = 5000;
  } else if (/\b(quatre mille francs?|4000 francs?|quatre mille fcfa)\b/.test(normalized)) {
    detectedMaxPrice = 4000;
  } else if (/\b(trois mille francs?|3000 francs?|trois mille fcfa)\b/.test(normalized)) {
    detectedMaxPrice = 3000;
  } else if (/\b(deux mille francs?|2000 francs?|deux mille fcfa)\b/.test(normalized)) {
    detectedMaxPrice = 2000;
  } else if (/\b(mille cinq cents? francs?|1500 francs?|mille cinq cents? fcfa)\b/.test(normalized)) {
    detectedMaxPrice = 1500;
  } else if (/\b(mille francs?|1000 francs?|mille fcfa)\b/.test(normalized)) {
    detectedMaxPrice = 1000;
  } else if (/\b(cinq cents? francs?|500 francs?|cinq cents? fcfa)\b/.test(normalized)) {
    detectedMaxPrice = 500;
  }

  // 7. Détection de pertinence / compréhension
  const STOPWORDS = new Set([
    'un', 'une', 'des', 'le', 'la', 'les', 'de', 'du', 'd', 'l',
    'au', 'aux', 'en', 'et', 'ou', 'a', 'par', 'pour', 'avec', 'sans',
    'sous', 'sur', 'dans', 'qui', 'que', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
    'me', 'te', 'se', 'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'mes', 'tes', 'ses',
    's', 'm', 't', 'c', 'n', 'j', 'y',
    'cherche', 'veux', 'voudrais', 'trouve', 'trouver', 'donne', 'montre', 'lire',
    'livre', 'livres', 'ouvrage', 'ouvrages', 'auteur', 'auteurs', 'autrice', 'autrices', 'ecrivain',
    'bonjour', 'salut', 'merci', 'svp', 'plait', 'plaît', 'sil', 'te', 'euh', 'hum', 'hein', 'ah', 'oh'
  ]);

  const meaningfulTokens = normalized
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const hasAnyFilter = Boolean(
    detectedGenre ||
      detectedLength ||
      detectedCountry ||
      detectedThemes.length > 0 ||
      detectedMaxPrice !== undefined ||
      langueDemandee !== undefined
  );

  const isUnderstood = hasAnyFilter || meaningfulTokens.length > 0;

  return {
    raw,
    normalized,
    genre: detectedGenre,
    longueur: detectedLength,
    pays: detectedCountry,
    themes: detectedThemes,
    maxPrixFcfa: detectedMaxPrice,
    langueDemandee,
    langueNonDisponible,
    langueNonDisponibleMessage,
    isUnderstood,
  };
}

/**
 * Transforme les critères reconnus en puces de filtres supprimables dans l'interface
 */
export function extractActiveFilters(parsed: ParsedQuery): MatchFilter[] {
  const filters: MatchFilter[] = [];

  if (parsed.genre) {
    const genreNames: Record<BookGenre, string> = {
      roman: 'Roman',
      conte: 'Conte',
      poésie: 'Poésie',
      essai: 'Essai',
      nouvelle: 'Nouvelle',
      jeunesse: 'Jeunesse',
    };
    filters.push({
      id: `genre-${parsed.genre}`,
      type: 'genre',
      label: genreNames[parsed.genre] || parsed.genre,
      value: parsed.genre,
    });
  }

  if (parsed.longueur) {
    filters.push({
      id: `longueur-${parsed.longueur}`,
      type: 'longueur',
      label: parsed.longueur === 'court' ? 'Court (< 150 p.)' : 'Long (≥ 150 p.)',
      value: parsed.longueur,
    });
  }

  if (parsed.pays) {
    filters.push({
      id: `pays-${parsed.pays}`,
      type: 'pays',
      label: parsed.pays,
      value: parsed.pays,
    });
  }

  for (const theme of parsed.themes) {
    filters.push({
      id: `theme-${theme}`,
      type: 'theme',
      label: `Thème : ${theme}`,
      value: theme,
    });
  }

  if (parsed.maxPrixFcfa !== undefined) {
    filters.push({
      id: `prix-${parsed.maxPrixFcfa}`,
      type: 'prix',
      label: `≤ ${parsed.maxPrixFcfa.toLocaleString('fr-FR')} FCFA`,
      value: String(parsed.maxPrixFcfa),
    });
  }

  return filters;
}

/**
 * Score et classe les livres selon les critères satisfaits
 */
export function scoreBooks(
  books: Book[],
  parsed: ParsedQuery,
  activeFilters?: MatchFilter[]
): ScoredBook[] {
  // Si des filtres manuels sont fournis, nous appliquons ceux-là
  const currentGenre = activeFilters
    ? (activeFilters.find((f) => f.type === 'genre')?.value as BookGenre | undefined)
    : parsed.genre;
  const currentLength = activeFilters
    ? (activeFilters.find((f) => f.type === 'longueur')?.value as BookLengthFilter | undefined)
    : parsed.longueur;
  const currentCountry = activeFilters
    ? activeFilters.find((f) => f.type === 'pays')?.value
    : parsed.pays;
  const currentThemes = activeFilters
    ? activeFilters.filter((f) => f.type === 'theme').map((f) => f.value)
    : parsed.themes;
  const currentMaxPrice = activeFilters
    ? (() => {
        const p = activeFilters.find((f) => f.type === 'prix')?.value;
        return p ? parseInt(p, 10) : undefined;
      })()
    : parsed.maxPrixFcfa;

  const hasAnyActiveFilter = Boolean(
    currentGenre ||
      currentLength ||
      currentCountry ||
      currentThemes.length > 0 ||
      currentMaxPrice !== undefined
  );

  const normalizedQuery = parsed.normalized;

  const results: ScoredBook[] = [];

  for (const book of books) {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Genre (poids 3)
    if (currentGenre) {
      if (book.genre === currentGenre) {
        score += 3;
        matchReasons.push(`Genre : ${book.genre}`);
      }
    }

    // 2. Pays (poids 3)
    if (currentCountry) {
      if (normalizeText(book.pays) === normalizeText(currentCountry)) {
        score += 3;
        matchReasons.push(`Auteur de ${book.pays}`);
      }
    }

    // 3. Longueur (poids 2)
    if (currentLength) {
      if (currentLength === 'court' && book.pages < 150) {
        score += 2;
        matchReasons.push(`Livre court (${book.pages} pages)`);
      } else if (currentLength === 'long' && book.pages >= 150) {
        score += 2;
        matchReasons.push(`Livre long (${book.pages} pages)`);
      }
    }

    // 4. Thèmes (poids 2 chacun)
    for (const theme of currentThemes) {
      const normTheme = normalizeText(theme);
      const hasTheme = book.themes.some((t) => normalizeText(t) === normTheme);
      if (hasTheme) {
        score += 2;
        matchReasons.push(`Thème : ${theme}`);
      }
    }

    // 5. Prix (poids 2)
    if (currentMaxPrice !== undefined) {
      if (book.prixFcfa <= currentMaxPrice) {
        score += 2;
        matchReasons.push(`Prix ${book.prixFcfa.toLocaleString('fr-FR')} FCFA (≤ ${currentMaxPrice} FCFA)`);
      }
    }

    // 6. Si aucun filtre spécifique n'est actif, mais du texte libre : recherche plein texte sur titre / auteur / résumé
    if (!hasAnyActiveFilter && normalizedQuery) {
      const normTitle = normalizeText(book.titre);
      const normAuthor = normalizeText(book.auteur);
      const normResume = normalizeText(book.resume);

      const words = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);
      let textMatchCount = 0;

      for (const w of words) {
        if (normTitle.includes(w)) {
          textMatchCount += 4;
          matchReasons.push(`Titre correspond à « ${w} »`);
        } else if (normAuthor.includes(w)) {
          textMatchCount += 3;
          matchReasons.push(`Auteur correspond à « ${w} »`);
        } else if (normResume.includes(w)) {
          textMatchCount += 1;
        }
      }

      if (textMatchCount > 0) {
        score += textMatchCount;
        if (!matchReasons.length) {
          matchReasons.push('Correspondance dans le résumé');
        }
      }
    }

    // Si on a des critères satisfaits, on conserve le livre
    if (score > 0) {
      results.push({
        book,
        score,
        matchReasons,
      });
    }
  }

  // Tri par score décroissant, puis par titre alphabétique
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.book.titre.localeCompare(b.book.titre, 'fr');
  });

  return results;
}

import { describe, it, expect } from 'vitest';
import { normalizeText, parseQuery, extractActiveFilters, scoreBooks } from './queryParser';
import booksData from '../data/books.json';
import { Book } from '../types';

const books: Book[] = booksData as Book[];

describe('queryParser — Normalisation', () => {
  it('1. normalise les minuscules et les espaces superflus', () => {
    expect(normalizeText('  ROMAN   Court  ')).toBe('roman court');
  });

  it('2. supprime tous les accents français (é, è, ê, à, â, ç, ï, etc.)', () => {
    expect(normalizeText('Béninois À côté d’un été poétique')).toBe('beninois a cote d un ete poetique');
  });

  it('3. traite les apostrophes typographiques et les tirets', () => {
    expect(normalizeText("d’un auteur franco-béninois")).toBe('d un auteur franco beninois');
  });
});

describe('queryParser — Détection des genres', () => {
  it('4. détecte le genre « roman »', () => {
    const res = parseQuery('Je cherche un bon roman');
    expect(res.genre).toBe('roman');
  });

  it('5. détecte le genre « conte » et pluriel « contes »', () => {
    const res = parseQuery('Raconte-moi des contes traditionnels');
    expect(res.genre).toBe('conte');
  });

  it('6. détecte le genre « poésie » avec accent', () => {
    const res = parseQuery('Un recueil de poésie');
    expect(res.genre).toBe('poésie');
  });

  it('7. détecte le genre « essai »', () => {
    const res = parseQuery('Un essai sur la société');
    expect(res.genre).toBe('essai');
  });

  it('8. détecte le genre « nouvelle »', () => {
    const res = parseQuery('Une nouvelle urbaine');
    expect(res.genre).toBe('nouvelle');
  });

  it('9. détecte le genre « jeunesse »', () => {
    const res = parseQuery('Un livre pour la jeunesse');
    expect(res.genre).toBe('jeunesse');
  });
});

describe('queryParser — Détection de longueur', () => {
  it('10. détecte « court »', () => {
    const res = parseQuery('Un livre court');
    expect(res.longueur).toBe('court');
  });

  it('11. détecte « petit » comme longueur courte', () => {
    const res = parseQuery('Un petit livre');
    expect(res.longueur).toBe('court');
  });

  it('12. détecte « moins de 150 pages » comme longueur courte', () => {
    const res = parseQuery('Un roman de moins de 150 pages');
    expect(res.longueur).toBe('court');
  });

  it('13. détecte « long »', () => {
    const res = parseQuery('Un long récit historique');
    expect(res.longueur).toBe('long');
  });
});

describe('queryParser — Détection des pays et nationalités', () => {
  it('14. détecte « béninois » avec accent', () => {
    const res = parseQuery('Un auteur béninois');
    expect(res.pays).toBe('Bénin');
  });

  it('15. détecte « togolais »', () => {
    const res = parseQuery('Une autrice togolaise');
    expect(res.pays).toBe('Togo');
  });

  it('16. détecte « ivoirien » et « Côte d’Ivoire »', () => {
    const res1 = parseQuery('Un écrivain ivoirien');
    const res2 = parseQuery("Une histoire en Côte d'Ivoire");
    expect(res1.pays).toBe("Côte d'Ivoire");
    expect(res2.pays).toBe("Côte d'Ivoire");
  });

  it('17. détecte « sénégalais » et « malien »', () => {
    expect(parseQuery('Auteur sénégalais').pays).toBe('Sénégal');
    expect(parseQuery('Une voix malienne').pays).toBe('Mali');
  });

  it('18. détecte « camerounais » et « gabonais »', () => {
    expect(parseQuery('Écrivaine camerounaise').pays).toBe('Cameroun');
    expect(parseQuery('Auteur gabonais').pays).toBe('Gabon');
  });
});

describe('queryParser — Détection des prix', () => {
  it('19. détecte « moins de 2000 francs »', () => {
    const res = parseQuery('Un livre à moins de 2000 francs');
    expect(res.maxPrixFcfa).toBe(2000);
  });

  it('20. détecte « moins de 1500 fcfa »', () => {
    const res = parseQuery('Quelque chose à moins de 1500 fcfa');
    expect(res.maxPrixFcfa).toBe(1500);
  });

  it('21. détecte les chiffres en lettres comme « deux mille francs »', () => {
    const res = parseQuery('Moins de deux mille francs');
    expect(res.maxPrixFcfa).toBe(2000);
  });
});

describe('queryParser — Détection des langues non supportées', () => {
  it('22. détecte « en fon » et signale la non-disponibilité', () => {
    const res = parseQuery('Je voudrais un conte en fon');
    expect(res.langueDemandee).toBe('Fon');
    expect(res.langueNonDisponible).toBe(true);
    expect(res.langueNonDisponibleMessage).toContain('Fon');
  });

  it('23. détecte « en yoruba » et « en goun »', () => {
    const resYoruba = parseQuery('Un livre en yoruba');
    expect(resYoruba.langueDemandee).toBe('Yoruba');
    expect(resYoruba.langueNonDisponible).toBe(true);

    const resGoun = parseQuery('Histoire en goun');
    expect(resGoun.langueDemandee).toBe('Goun');
    expect(resGoun.langueNonDisponible).toBe(true);
  });
});

describe('queryParser — Requête vide et bruit vocal', () => {
  it('24. gère une requête vide', () => {
    const res = parseQuery('');
    expect(res.isUnderstood).toBe(false);
    expect(res.genre).toBeUndefined();
  });

  it('25. gère le bruit pur (« euh hum s’il vous plaît un livre »)', () => {
    const res = parseQuery('euh hum s il vous plait un livre je voudrais');
    expect(res.isUnderstood).toBe(false);
  });
});

describe('queryParser — Requête clé utilisateur & scoring', () => {
  it('26. analyse parfaitement « Un roman d’amour, court, d’un auteur béninois »', () => {
    const query = "Un roman d'amour, court, d'un auteur béninois";
    const res = parseQuery(query);

    expect(res.genre).toBe('roman');
    expect(res.longueur).toBe('court');
    expect(res.pays).toBe('Bénin');
    expect(res.themes).toContain('amour');
    expect(res.isUnderstood).toBe(true);

    const filters = extractActiveFilters(res);
    expect(filters.length).toBeGreaterThanOrEqual(4);

    const scored = scoreBooks(books, res);
    expect(scored.length).toBeGreaterThan(0);
    // Le livre "La Lagune des amours silencieuses" doit arriver en première position
    const top = scored[0];
    expect(top.book.id).toBe('lagune-des-amours');
    expect(top.book.pays).toBe('Bénin');
    expect(top.book.genre).toBe('roman');
    expect(top.book.pages).toBeLessThan(150);
    expect(top.matchReasons).toContain('Genre : roman');
    expect(top.matchReasons).toContain('Auteur de Bénin');
    expect(top.matchReasons).toContain('Livre court (128 pages)');
    expect(top.matchReasons).toContain('Thème : amour');
  });

  it('27. extrait des filtres actifs et permet la suppression dynamique', () => {
    const parsed = parseQuery("Un roman d'amour béninois");
    const filters = extractActiveFilters(parsed);
    expect(filters.some((f) => f.type === 'genre')).toBe(true);
    expect(filters.some((f) => f.type === 'pays')).toBe(true);

    // Supprimer le filtre pays
    const filteredOutCountry = filters.filter((f) => f.type !== 'pays');
    const scoredWithoutCountry = scoreBooks(books, parsed, filteredOutCountry);
    // Doit maintenant inclure d'autres romans d'amour (ex: ivoirien ou camerounais)
    expect(scoredWithoutCountry.length).toBeGreaterThan(1);
  });
});

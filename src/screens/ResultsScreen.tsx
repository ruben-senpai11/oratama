import React, { useState, useEffect } from 'react';
import { Book, MatchFilter, ParsedQuery, ScoredBook, ViewScreen } from '../types';
import booksData from '../data/books.json';
import { extractActiveFilters, parseQuery, scoreBooks } from '../utils/queryParser';
import { BookCover } from '../components/BookCover';
import { listRecordedVoices } from '../utils/audioStorage';

const allBooks: Book[] = booksData as Book[];

interface ResultsScreenProps {
  rawQuery: string;
  initialParsed?: ParsedQuery;
  onNavigate: (screen: ViewScreen) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  rawQuery,
  initialParsed,
  onNavigate,
}) => {
  const parsed = initialParsed || parseQuery(rawQuery);
  const [activeFilters, setActiveFilters] = useState<MatchFilter[]>(() =>
    extractActiveFilters(parsed)
  );
  const [recordedBookIds, setRecordedBookIds] = useState<Set<string>>(new Set());

  // Vérifier quels livres ont un enregistrement d'auteur réel dans IndexedDB
  useEffect(() => {
    let isMounted = true;
    listRecordedVoices().then((voices) => {
      if (isMounted) {
        setRecordedBookIds(new Set(voices.map((v) => v.bookId)));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Recalculer le scoring à chaque changement des filtres actifs
  const scoredResults: ScoredBook[] = scoreBooks(allBooks, parsed, activeFilters);

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  const handleResetFilters = () => {
    setActiveFilters([]);
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-4">
      {/* Alerte si langue non disponible demandée */}
      {parsed.langueNonDisponible && (
        <div
          role="status"
          className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs leading-relaxed space-y-1 shadow-sm"
        >
          <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
            <span>ℹ️</span> Langue {parsed.langueDemandee} non prise en charge
          </p>
          <p>{parsed.langueNonDisponibleMessage}</p>
        </div>
      )}

      {/* Requête et filtres actifs */}
      <div className="bg-white rounded-xl p-3.5 border border-[#E5DCD3] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#5C5454]">Demande analysée :</span>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home' })}
            className="text-[#933B40] hover:underline font-semibold"
          >
            Modifier
          </button>
        </div>
        <p className="text-sm font-bold text-[#1F1A1A] italic">
          « {rawQuery || 'Recherche'} »
        </p>

        {/* Puces des critères reconnus */}
        {activeFilters.length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold text-[#5C5454] uppercase tracking-wider mb-1.5">
              Filtres compris (touchez pour retirer) :
            </p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Filtres actifs">
              {activeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleRemoveFilter(filter.id)}
                  aria-label={`Supprimer le filtre ${filter.label}`}
                  className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F6EAEB] text-[#933B40] border border-[#933B40]/30 hover:bg-[#933B40] hover:text-white transition-colors"
                >
                  <span>{filter.label}</span>
                  <span className="font-bold text-xs" aria-hidden="true">✕</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#5C5454] hover:text-[#1F1A1A] underline px-2 py-1"
              >
                Tout effacer
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#5C5454] italic">
            Aucun filtre spécifique actif (tous les livres sont affichés).
          </p>
        )}
      </div>

      {/* Nombre de résultats trouvés */}
      <div className="flex items-center justify-between text-xs text-[#5C5454] px-1">
        <span className="font-semibold">
          {scoredResults.length} {scoredResults.length > 1 ? 'livres trouvés' : 'livre trouvé'}
        </span>
        <span className="text-[11px] text-[#5C5454]">Classés par pertinence</span>
      </div>

      {/* Liste des cartes ou état vide */}
      {scoredResults.length > 0 ? (
        <div className="space-y-3" role="feed" aria-label="Résultats de recherche">
          {scoredResults.map(({ book, matchReasons }) => {
            const hasAuthorRecording = recordedBookIds.has(book.id);

            return (
              <article
                key={book.id}
                onClick={() => onNavigate({ name: 'book', bookId: book.id })}
                className="bg-white rounded-2xl p-3.5 border border-[#E5DCD3] shadow-sm hover:border-[#933B40]/40 transition-all cursor-pointer flex gap-3.5 group focus-within:ring-2 focus-within:ring-[#933B40]"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate({ name: 'book', bookId: book.id });
                  }
                }}
                aria-label={`${book.titre} par ${book.auteur}`}
              >
                {/* Couverture CSS */}
                <div className="shrink-0">
                  <BookCover book={book} size="sm" />
                </div>

                {/* Métadonnées du livre */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#933B40] bg-[#F6EAEB] px-1.5 py-0.5 rounded">
                        {book.genre}
                      </span>
                      <span className="text-xs font-bold text-[#1F1A1A]">
                        {book.prixFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-[#1F1A1A] leading-tight line-clamp-1 group-hover:text-[#933B40] transition-colors">
                      {book.titre}
                    </h2>
                    <p className="text-xs text-[#5C5454] truncate mt-0.5">
                      {book.auteur} · <span className="font-medium text-[#1F1A1A]">{book.pays}</span>
                    </p>

                    <p className="text-[11px] text-[#8C8282] mt-0.5">
                      {book.pages} pages · {book.themes.slice(0, 3).join(', ')}
                    </p>
                  </div>

                  {/* Badges voix et pourquoi ce résultat */}
                  <div className="mt-2 pt-2 border-t border-[#E5DCD3]/60 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasAuthorRecording
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        <span aria-hidden="true">🎙️</span>
                        {hasAuthorRecording ? 'Voix de l’auteur (enregistrée)' : 'Voix de l’auteur'}
                      </span>
                    </div>

                    {/* Ligne "Pourquoi ce résultat" */}
                    <p className="text-[11px] text-[#5C5454] leading-snug line-clamp-2">
                      <strong className="text-[#933B40] font-semibold">Pourquoi ce résultat : </strong>
                      {matchReasons.length > 0 ? matchReasons.join(' · ') : 'Titre disponible au catalogue'}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Cas sans résultat avec suggestions utiles */
        <div className="bg-white rounded-2xl p-6 border border-[#E5DCD3] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h2 className="text-base font-bold text-[#1F1A1A]">
            Aucun livre ne correspond exactement à tous vos critères combinés
          </h2>
          <p className="text-xs text-[#5C5454] leading-relaxed">
            Nous avons cherché parmi les 12 ouvrages fictifs. Essayez de retirer certains filtres (comme la longueur ou le prix) ou découvrez nos suggestions ci-dessous.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-4 py-2 bg-[#933B40] text-white text-xs font-semibold rounded-xl hover:bg-[#752A2E] transition-colors"
            >
              Afficher tous les 12 livres disponibles
            </button>
          </div>

          <div className="text-left pt-4 border-t border-[#E5DCD3]">
            <p className="text-xs font-bold text-[#1F1A1A] mb-2">
              Suggestions populaires :
            </p>
            <div className="space-y-2">
              {allBooks.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onNavigate({ name: 'book', bookId: b.id })}
                  className="w-full text-left p-2.5 rounded-lg bg-[#FAF6F1] hover:bg-[#EFE8DE] text-xs transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold truncate">{b.titre} — {b.auteur} ({b.pays})</span>
                  <span className="text-[#933B40] shrink-0 font-bold ml-2">Voir →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

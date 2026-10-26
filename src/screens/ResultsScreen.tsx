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
  const [visibleCount, setVisibleCount] = useState<number>(20);

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
    setVisibleCount(20);
  };

  const handleResetFilters = () => {
    setActiveFilters([]);
    setVisibleCount(20);
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-4">
      {/* Alerte si langue non disponible demandée */}
      {parsed.langueNonDisponible && (
        <div
          role="status"
          className="p-4 rounded-xl bg-[#FDF4E7] border border-[#E09228] text-[#181826] text-xs leading-relaxed space-y-1 shadow-sm"
        >
          <p className="font-bold text-sm text-[#181826] flex items-center gap-1.5">
            <span>ℹ️</span> Langue {parsed.langueDemandee} non prise en charge
          </p>
          <p className="text-[#656575]">{parsed.langueNonDisponibleMessage}</p>
        </div>
      )}

      {/* Requête et filtres actifs */}
      <div className="bg-white rounded-xl p-3.5 border border-[#E6E0D6] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#656575]">Demande analysée :</span>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home' })}
            className="text-[#1E2958] hover:underline font-semibold"
          >
            Modifier
          </button>
        </div>
        <p className="text-sm font-bold text-[#181826] italic">
          « {rawQuery || 'Recherche'} »
        </p>

        {/* Puces des critères reconnus */}
        {activeFilters.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#656575] uppercase tracking-wider mb-1.5">
              Filtres compris (touchez pour retirer) :
            </p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Filtres actifs">
              {activeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleRemoveFilter(filter.id)}
                  aria-label={`Supprimer le filtre ${filter.label}`}
                  className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E9EDF9] text-[#1E2958] border border-[#1E2958]/30 hover:bg-[#1E2958] hover:text-white transition-colors"
                >
                  <span>{filter.label}</span>
                  <span className="font-bold text-xs" aria-hidden="true">✕</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#656575] hover:text-[#181826] underline px-2 py-1"
              >
                Tout effacer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nombre de résultats trouvés */}
      <div className="flex items-center justify-between text-xs text-[#656575] px-1">
        <span className="font-semibold text-[#181826]">
          {scoredResults.length} {scoredResults.length > 1 ? 'livres trouvés' : 'livre trouvé'}
        </span>
        <span className="text-[11px] text-[#656575]">Classés par pertinence</span>
      </div>

      {/* Liste des cartes ou état vide */}
      {scoredResults.length > 0 ? (
        <div className="space-y-3" role="feed" aria-label="Résultats de recherche">
          {scoredResults.slice(0, visibleCount).map(({ book }) => {
            const hasAuthorRecording = recordedBookIds.has(book.id);

            return (
              <article
                key={book.id}
                onClick={() => onNavigate({ name: 'book', bookId: book.id })}
                className="bg-white rounded-2xl p-3.5 border border-[#E6E0D6] shadow-sm hover:border-[#1E2958]/40 transition-all cursor-pointer flex gap-3 group focus-within:ring-2 focus-within:ring-[#1E2958]"
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2958] bg-[#E9EDF9] px-1.5 py-0.5 rounded">
                        {book.genre}
                      </span>
                      <span className="text-xs font-bold text-[#181826]">
                        {book.prixFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-[#181826] leading-tight line-clamp-1 group-hover:text-[#1E2958] transition-colors">
                      {book.titre}
                    </h2>
                    <p className="text-xs text-[#656575] truncate mt-0.5">
                      {book.auteur} · <span className="font-medium text-[#181826]">{book.pays}</span>
                    </p>

                    {book.categorie && (
                      <p className="text-[11px] font-medium text-[#1E2958] line-clamp-1 mt-0.5">
                        {book.categorie}
                      </p>
                    )}

                    <p className="text-[11px] text-[#656575] mt-0.5">
                      {book.pages} pages · {book.themes.slice(0, 3).join(', ')}
                    </p>
                  </div>

                  {/* Badge voix */}
                  <div className="mt-2 pt-2 border-t border-[#E6E0D6] flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasAuthorRecording
                          ? 'bg-[#E09228] text-[#181826] border border-[#C27B1A]'
                          : 'bg-[#E9EDF9] text-[#1E2958] border border-[#1E2958]/20'
                      }`}
                    >
                      <span aria-hidden="true">🎙️</span>
                      {hasAuthorRecording ? 'Voix de l’auteur (enregistrée)' : 'Voix de l’auteur'}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Bouton pour charger plus de résultats */}
          {scoredResults.length > visibleCount && (
            <div className="text-center pt-2 pb-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 25)}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-white border-2 border-[#1E2958] text-[#1E2958] text-xs font-bold hover:bg-[#1E2958] hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E2958]"
              >
                Afficher plus de livres ({scoredResults.length - visibleCount} restants)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Cas sans résultat avec suggestions utiles */
        <div className="bg-white rounded-2xl p-6 border border-[#E6E0D6] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#E9EDF9] text-[#1E2958] mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h2 className="text-base font-bold text-[#181826]">
            Aucun livre ne correspond exactement à tous vos critères combinés
          </h2>
          <p className="text-xs text-[#656575] leading-relaxed">
            Nous avons cherché dans l'ensemble du catalogue OraTama. Essayez de retirer certains filtres (comme la longueur ou le prix) ou découvrez nos suggestions ci-dessous.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-4 py-2 bg-[#1E2958] text-white text-xs font-semibold rounded-xl hover:bg-[#141C3E] transition-colors"
            >
              Afficher tous les livres disponibles
            </button>
          </div>

          <div className="text-left pt-4 border-t border-[#E6E0D6]">
            <p className="text-xs font-bold text-[#181826] mb-2">
              Suggestions populaires :
            </p>
            <div className="space-y-2">
              {allBooks.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onNavigate({ name: 'book', bookId: b.id })}
                  className="w-full text-left p-2.5 rounded-lg bg-[#FBF8F3] hover:bg-[#EFEAE1] text-xs transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-[#181826] truncate">{b.titre} — {b.auteur} ({b.pays})</span>
                  <span className="text-[#1E2958] shrink-0 font-bold ml-2">Voir →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

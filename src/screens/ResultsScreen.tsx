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
          className="p-4 rounded-xl bg-[#FDF3E3] border border-[#E9A23B] text-[#1B1B2A] text-xs leading-relaxed space-y-1 shadow-sm"
        >
          <p className="font-bold text-sm text-[#1B1B2A] flex items-center gap-1.5">
            <span>ℹ️</span> Langue {parsed.langueDemandee} non prise en charge
          </p>
          <p className="text-[#6B6B7A]">{parsed.langueNonDisponibleMessage}</p>
        </div>
      )}

      {/* Requête et filtres actifs */}
      <div className="bg-white rounded-xl p-3.5 border border-[#E8E3DA] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#6B6B7A]">Demande analysée :</span>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home' })}
            className="text-[#1F2A5C] hover:underline font-semibold"
          >
            Modifier
          </button>
        </div>
        <p className="text-sm font-bold text-[#1B1B2A] italic">
          « {rawQuery || 'Recherche'} »
        </p>

        {/* Puces des critères reconnus */}
        {activeFilters.length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold text-[#6B6B7A] uppercase tracking-wider mb-1.5">
              Filtres compris (touchez pour retirer) :
            </p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Filtres actifs">
              {activeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleRemoveFilter(filter.id)}
                  aria-label={`Supprimer le filtre ${filter.label}`}
                  className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8ECFA] text-[#1F2A5C] border border-[#1F2A5C]/30 hover:bg-[#1F2A5C] hover:text-white transition-colors"
                >
                  <span>{filter.label}</span>
                  <span className="font-bold text-xs" aria-hidden="true">✕</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#6B6B7A] hover:text-[#1B1B2A] underline px-2 py-1"
              >
                Tout effacer
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#6B6B7A] italic">
            Aucun filtre spécifique actif (tous les livres sont affichés).
          </p>
        )}
      </div>

      {/* Nombre de résultats trouvés */}
      <div className="flex items-center justify-between text-xs text-[#6B6B7A] px-1">
        <span className="font-semibold text-[#1B1B2A]">
          {scoredResults.length} {scoredResults.length > 1 ? 'livres trouvés' : 'livre trouvé'}
        </span>
        <span className="text-[11px] text-[#6B6B7A]">Classés par pertinence</span>
      </div>

      {/* Liste des cartes ou état vide */}
      {scoredResults.length > 0 ? (
        <div className="space-y-3" role="feed" aria-label="Résultats de recherche">
          {scoredResults.slice(0, visibleCount).map(({ book, matchReasons }) => {
            const hasAuthorRecording = recordedBookIds.has(book.id);

            return (
              <article
                key={book.id}
                onClick={() => onNavigate({ name: 'book', bookId: book.id })}
                className="bg-white rounded-2xl p-3.5 border border-[#E8E3DA] shadow-sm hover:border-[#1F2A5C]/40 transition-all cursor-pointer flex gap-3 group focus-within:ring-2 focus-within:ring-[#1F2A5C]"
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F2A5C] bg-[#E8ECFA] px-1.5 py-0.5 rounded">
                        {book.genre}
                      </span>
                      <span className="text-xs font-bold text-[#1B1B2A]">
                        {book.prixFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-[#1B1B2A] leading-tight line-clamp-1 group-hover:text-[#1F2A5C] transition-colors">
                      {book.titre}
                    </h2>
                    <p className="text-xs text-[#6B6B7A] truncate mt-0.5">
                      {book.auteur} · <span className="font-medium text-[#1B1B2A]">{book.pays}</span>
                    </p>

                    <p className="text-[11px] text-[#6B6B7A] mt-0.5">
                      {book.pages} pages · {book.themes.slice(0, 3).join(', ')}
                    </p>
                  </div>

                  {/* Badges voix et pourquoi ce résultat */}
                  <div className="mt-2 pt-2 border-t border-[#E8E3DA] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasAuthorRecording
                            ? 'bg-[#E9A23B] text-[#1B1B2A] border border-[#C9821F]'
                            : 'bg-[#E8ECFA] text-[#1F2A5C] border border-[#1F2A5C]/20'
                        }`}
                      >
                        <span aria-hidden="true">🎙️</span>
                        {hasAuthorRecording ? 'Voix de l’auteur (enregistrée)' : 'Voix de l’auteur'}
                      </span>
                    </div>

                    {/* Ligne "Pourquoi ce résultat" */}
                    <p className="text-[11px] text-[#6B6B7A] leading-snug line-clamp-2">
                      <strong className="text-[#1F2A5C] font-semibold">Pourquoi ce résultat : </strong>
                      {matchReasons.length > 0 ? matchReasons.join(' · ') : 'Titre disponible au catalogue'}
                    </p>
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
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-white border-2 border-[#1F2A5C] text-[#1F2A5C] text-xs font-bold hover:bg-[#1F2A5C] hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A5C]"
              >
                Afficher plus de livres ({scoredResults.length - visibleCount} restants)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Cas sans résultat avec suggestions utiles */
        <div className="bg-white rounded-2xl p-6 border border-[#E8E3DA] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#E8ECFA] text-[#1F2A5C] mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h2 className="text-base font-bold text-[#1B1B2A]">
            Aucun livre ne correspond exactement à tous vos critères combinés
          </h2>
          <p className="text-xs text-[#6B6B7A] leading-relaxed">
            Nous avons cherché parmi les 1 000 ouvrages fictifs. Essayez de retirer certains filtres (comme la longueur ou le prix) ou découvrez nos suggestions ci-dessous.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-4 py-2 bg-[#1F2A5C] text-white text-xs font-semibold rounded-xl hover:bg-[#161E42] transition-colors"
            >
              Afficher tous les livres disponibles
            </button>
          </div>

          <div className="text-left pt-4 border-t border-[#E8E3DA]">
            <p className="text-xs font-bold text-[#1B1B2A] mb-2">
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
                  <span className="font-semibold text-[#1B1B2A] truncate">{b.titre} — {b.auteur} ({b.pays})</span>
                  <span className="text-[#1F2A5C] shrink-0 font-bold ml-2">Voir →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

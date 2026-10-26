import React, { useState, useEffect, useRef } from 'react';
import { Book, ViewScreen } from '../types';
import booksData from '../data/books.json';
import { SentenceSpeechPlayer, splitIntoSentences } from '../utils/speechSynthesis';

const allBooks: Book[] = booksData as Book[];

interface ReaderScreenProps {
  bookId: string;
  onNavigate: (screen: ViewScreen) => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ bookId, onNavigate }) => {
  const book = allBooks.find((b) => b.id === bookId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0 = petit, 1 = normal, 2 = grand, 3 = très grand
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const playerRef = useRef<SentenceSpeechPlayer | null>(null);
  const sentences = useRef<string[]>(book ? splitIntoSentences(book.extrait) : []);

  useEffect(() => {
    if (!book) return;

    sentences.current = splitIntoSentences(book.extrait);

    const player = new SentenceSpeechPlayer({
      onSentenceChange: (idx) => {
        setCurrentSentenceIndex(idx);
      },
      onPlayStateChange: (playing, paused) => {
        setIsPlaying(playing);
        setIsPaused(paused);
      },
      onFinished: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentenceIndex(0);
      },
      onError: (msg) => {
        setErrorMessage(msg);
      },
    });

    player.setSentences(sentences.current);
    playerRef.current = player;

    return () => {
      // Arrêt automatique impératif à la sortie de l'écran
      player.stop();
    };
  }, [book]);

  if (!book) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-8 text-center space-y-4">
        <p className="text-sm font-bold text-[#181826]">Livre non trouvé</p>
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="min-h-[44px] px-4 py-2 bg-[#1E2958] text-white text-xs font-semibold rounded-xl"
        >
          Retourner à l’accueil
        </button>
      </div>
    );
  }

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    setErrorMessage(null);

    if (isPlaying && !isPaused) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handlePrevious = () => {
    playerRef.current?.previousSentence();
  };

  const handleNext = () => {
    playerRef.current?.nextSentence();
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    playerRef.current?.setRate(rate);
  };

  const handleSentenceClick = (idx: number) => {
    setCurrentSentenceIndex(idx);
    playerRef.current?.jumpToSentence(idx);
  };

  const fontSizes = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
  const lineHeightClasses = ['leading-relaxed', 'leading-relaxed', 'leading-loose', 'leading-loose'];

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-4 pb-12 flex flex-col">
      {/* En-tête titre livre */}
      <div className="flex items-center justify-between border-b border-[#E6E0D6] pb-3">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2958]">
            Lecture à voix haute
          </span>
          <h1 className="text-sm sm:text-base font-bold text-[#181826] truncate">
            {book.titre}
          </h1>
          <p className="text-xs text-[#656575] truncate">
            {book.auteur} ({book.pays})
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate({ name: 'book', bookId: book.id })}
          className="text-xs text-[#1E2958] hover:underline font-semibold shrink-0 min-h-[44px] flex items-center px-2"
        >
          Fiche →
        </button>
      </div>

      {/* Sélecteur de langue avec mentions explicites */}
      <section aria-labelledby="lang-heading" className="bg-white rounded-xl p-3 border border-[#E6E0D6] shadow-sm space-y-2">
        <h2 id="lang-heading" className="text-xs font-bold uppercase tracking-wider text-[#656575]">
          Langue de lecture
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="radiogroup" aria-label="Langues disponibles">
          {/* Français actif */}
          <div
            role="radio"
            aria-checked="true"
            className="flex items-center justify-center p-2 rounded-lg bg-[#1E2958] text-white text-xs font-bold shadow-sm"
          >
            <span>Français</span>
            <span className="ml-1 text-[10px] bg-white/20 px-1 py-0.5 rounded">Actif</span>
          </div>

          {/* Fon grisé */}
          <div
            role="radio"
            aria-checked="false"
            aria-disabled="true"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 text-xs cursor-not-allowed select-none opacity-80"
          >
            <span className="font-semibold">Fon</span>
            <span className="text-[9px] uppercase tracking-wide text-gray-500 font-medium">Bientôt</span>
          </div>

          {/* Yoruba grisé */}
          <div
            role="radio"
            aria-checked="false"
            aria-disabled="true"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 text-xs cursor-not-allowed select-none opacity-80"
          >
            <span className="font-semibold">Yoruba</span>
            <span className="text-[9px] uppercase tracking-wide text-gray-500 font-medium">Bientôt</span>
          </div>

          {/* Goun grisé */}
          <div
            role="radio"
            aria-checked="false"
            aria-disabled="true"
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 text-xs cursor-not-allowed select-none opacity-80"
          >
            <span className="font-semibold">Goun</span>
            <span className="text-[9px] uppercase tracking-wide text-gray-500 font-medium">Bientôt</span>
          </div>
        </div>

        {/* Phrase obligatoire d'explication honnête */}
        <p className="text-[11px] text-[#656575] italic leading-normal pt-1">
          Les voix de synthèse pour le fon, le yoruba et le goun ne sont pas encore prises en charge ici par les synthétiseurs navigateurs.
        </p>
      </section>

      {/* Barre d'outils audio & typographie */}
      <div className="bg-white rounded-2xl p-3 border border-[#E6E0D6] shadow-sm space-y-3">
        {/* Ligne 1 : Contrôles de lecture */}
        <div className="flex items-center justify-between">
          {/* Vitesse : 0.8, 1, 1.2 */}
          <div className="flex items-center gap-1" role="group" aria-label="Vitesse de lecture">
            <span className="text-[11px] font-bold text-[#656575] mr-1">Vitesse :</span>
            {[0.8, 1.0, 1.2].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRateChange(r)}
                aria-pressed={playbackRate === r}
                className={`min-h-[36px] px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  playbackRate === r
                    ? 'bg-[#1E2958] text-white'
                    : 'bg-[#FBF8F3] text-[#656575] hover:bg-[#EFEAE1]'
                }`}
              >
                {r === 1 ? '1×' : `${r}×`}
              </button>
            ))}
          </div>

          {/* Taille du texte : A- / A+ */}
          <div className="flex items-center gap-1" role="group" aria-label="Taille du texte">
            <button
              type="button"
              onClick={() => setFontSizeLevel((prev) => Math.max(0, prev - 1))}
              disabled={fontSizeLevel === 0}
              aria-label="Diminuer la taille du texte"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-[#FBF8F3] hover:bg-[#EFEAE1] disabled:opacity-40 text-xs font-black text-[#181826] transition-colors"
            >
              A−
            </button>
            <span className="text-xs font-bold text-[#656575] px-1 select-none">
              A
            </span>
            <button
              type="button"
              onClick={() => setFontSizeLevel((prev) => Math.min(fontSizes.length - 1, prev + 1))}
              disabled={fontSizeLevel === fontSizes.length - 1}
              aria-label="Augmenter la taille du texte"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-[#FBF8F3] hover:bg-[#EFEAE1] disabled:opacity-40 text-sm font-black text-[#181826] transition-colors"
            >
              A+
            </button>
          </div>
        </div>

        {/* Ligne 2 : Boutons Précédent / Play-Pause / Suivant */}
        <div className="flex items-center justify-center gap-3 pt-1 border-t border-[#E6E0D6]">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentSentenceIndex <= 0}
            aria-label="Phrase précédente"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#FBF8F3] hover:bg-[#EFEAE1] disabled:opacity-30 text-[#181826] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying && !isPaused ? 'Mettre en pause' : 'Démarrer la lecture à voix haute'}
            className="min-h-[48px] px-6 rounded-2xl bg-[#1E2958] hover:bg-[#141C3E] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            {isPlaying && !isPaused ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>{isPaused ? 'Reprendre' : 'Lire à voix haute'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentSentenceIndex >= sentences.current.length - 1}
            aria-label="Phrase suivante"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#FBF8F3] hover:bg-[#EFEAE1] disabled:opacity-30 text-[#181826] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicateur de phrase en cours */}
        <p className="text-[11px] text-center text-[#656575] font-medium">
          Phrase {currentSentenceIndex + 1} sur {sentences.current.length}
        </p>

        {errorMessage && (
          <p className="text-xs text-[#B3261E] bg-[#FDF0ED] p-2.5 rounded-xl border border-[#B3261E]/30">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Zone de lecture du texte avec phrases et surlignage exact #FCE9C4 */}
      <section
        aria-label="Texte de l'extrait avec surlignage en cours"
        className="flex-1 bg-white rounded-2xl p-5 border border-[#E6E0D6] shadow-sm overflow-y-auto"
      >
        <div className={`${fontSizes[fontSizeLevel]} ${lineHeightClasses[fontSizeLevel]} text-[#181826] space-y-2`}>
          {sentences.current.map((sentence, index) => {
            const isCurrent = index === currentSentenceIndex && (isPlaying || isPaused);

            return (
              <span
                key={index}
                onClick={() => handleSentenceClick(index)}
                className={`cursor-pointer transition-colors duration-200 rounded px-1.5 py-0.5 inline ${
                  isCurrent
                    ? 'bg-[#FCE9C4] text-[#181826] font-semibold border-b-2 border-[#E09228] shadow-sm'
                    : 'hover:bg-[#FBF8F3]'
                }`}
                title="Touchez pour lire cette phrase"
              >
                {sentence}{' '}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
};

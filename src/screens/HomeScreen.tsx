import React, { useState, useRef, useEffect } from 'react';
import { Book, ParsedQuery, ViewScreen } from '../types';
import booksData from '../data/books.json';
import { BookCover } from '../components/BookCover';
import {
  isSpeechRecognitionSupported,
  SpeechRecognitionService,
  requestMicrophonePermission,
} from '../utils/speechRecognition';
import {
  FreeAudioRecorder,
  processAudioWithBackend,
} from '../utils/geminiAudioService';
import { normalizeText } from '../utils/queryParser';
import { ConsentModal } from '../components/ConsentModal';

interface HomeScreenProps {
  onNavigate: (screen: ViewScreen) => void;
  onSearch: (query: string, parsedOverride?: ParsedQuery) => void;
}

const EXAMPLE_QUERIES = [
  "Un roman d'amour, court, d'un auteur béninois",
  "Des contes pour enfants à moins de 1500 francs",
  "Un essai philosophique sur la mémoire",
  "Un polar palpitant à Abidjan",
];

const allBooks: Book[] = booksData as Book[];
// Sélection variée de 3 livres découverte pour l'accueil
const CURATED_BOOKS: Book[] = [
  allBooks.find((b) => b.id === 'lagune-des-amours') || allBooks[0],
  allBooks.find((b) => b.id === 'les-gardiennes-du-fleuve') || allBooks[1],
  allBooks.find((b) => b.id === 'cotonou-les-ombres-du-marche') || allBooks[2],
].filter(Boolean);

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onSearch }) => {
  const [textInput, setTextInput] = useState('');
  const [micState, setMicState] = useState<'inactif' | 'ecoute' | 'analyse' | 'erreur'>('inactif');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Services vocaux
  const recognitionServiceRef = useRef<SpeechRecognitionService | null>(null);
  const audioRecorderRef = useRef<FreeAudioRecorder | null>(null);

  useEffect(() => {
    recognitionServiceRef.current = new SpeechRecognitionService();
    audioRecorderRef.current = new FreeAudioRecorder();

    return () => {
      recognitionServiceRef.current?.stop();
      audioRecorderRef.current?.cancel();
    };
  }, []);

  // Formatage du compteur de temps d'enregistrement mm:ss
  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  const handleStartListening = () => {
    setErrorMessage(null);
    setStatusMessage(null);

    // Vérifier consentement micro préalable
    const hasConsented = localStorage.getItem('oratama_mic_consent') === 'true';
    if (!hasConsented) {
      setShowConsentModal(true);
      return;
    }

    void startActiveListening();
  };

  const startActiveListening = async () => {
    setLiveTranscript('');
    setErrorMessage(null);
    setElapsedSeconds(0);

    // Priorité 1 : Enregistreur continu haute fidélité MediaRecorder
    if (audioRecorderRef.current && typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function') {
      setMicState('ecoute');
      setStatusMessage('Je vous écoute… Décrivez votre livre sans limite de temps.');

      const started = await audioRecorderRef.current.start((sec) => {
        setElapsedSeconds(sec);
      });

      if (started) {
        return;
      }
    }

    // Priorité 2 : Repli sur Web Speech API du navigateur
    await startBrowserSpeech();
  };

  const startBrowserSpeech = async () => {
    if (!isSpeechRecognitionSupported()) {
      setMicState('erreur');
      setErrorMessage(
        'La reconnaissance vocale n’est pas accessible sur ce navigateur. Veuillez autoriser le microphone ou taper votre demande.'
      );
      return;
    }

    if (!recognitionServiceRef.current) return;

    setMicState('ecoute');
    setStatusMessage('Connexion au micro… Parlez à voix haute.');

    const started = await recognitionServiceRef.current.start({
      onStart: () => {
        setMicState('ecoute');
        setStatusMessage('Je vous écoute… Décrivez votre recherche.');
      },
      onInterimResult: (transcript) => {
        setLiveTranscript(transcript);
        setStatusMessage('Transcription en direct…');
      },
      onFinalResult: (transcript) => {
        setLiveTranscript(transcript);
        setTextInput(transcript);
        setMicState('inactif');
        setStatusMessage('Recherche en cours…');
        onSearch(transcript);
      },
      onError: (type, message) => {
        if (type === 'no-speech') {
          setMicState('inactif');
          setStatusMessage('Aucune voix entendue. Touchez à nouveau le micro ou écrivez.');
          setErrorMessage(null);
        } else {
          setMicState('erreur');
          setErrorMessage(message);
          setStatusMessage(null);
        }
      },
      onEnd: () => {
        setMicState((prev) => (prev === 'ecoute' ? 'inactif' : prev));
      },
    });

    if (!started && micState !== 'erreur') {
      setMicState('inactif');
    }
  };

  // Arrêt volontaire de l'enregistrement par l'utilisateur
  const handleStopListening = async () => {
    // Si enregistrement continu avec MediaRecorder
    if (audioRecorderRef.current?.isRecording) {
      setMicState('analyse');
      setStatusMessage('Analyse et compréhension de votre demande vocale…');

      try {
        const audioBlob = await audioRecorderRef.current.stop();
        if (!audioBlob || audioBlob.size < 1000) {
          setMicState('inactif');
          setStatusMessage('Enregistrement trop court. Touchez le micro et formulez votre demande.');
          return;
        }

        // Appel au backend intelligent sécurisé
        const result = await processAudioWithBackend(audioBlob);

        if (result.transcript) {
          setLiveTranscript(result.transcript);
          setTextInput(result.transcript);
          setMicState('inactif');
          setStatusMessage(`Compris : « ${result.transcript} »`);

          const parsedOverride: ParsedQuery = {
            raw: result.transcript,
            normalized: normalizeText(result.transcript),
            genre: (result.genre as any) || undefined,
            longueur: (result.longueur as any) || undefined,
            pays: result.pays || undefined,
            themes: result.themes || [],
            maxPrixFcfa: result.maxPrixFcfa || undefined,
            isUnderstood: true,
          };

          onSearch(result.transcript, parsedOverride);
        } else {
          setMicState('inactif');
          setStatusMessage('Aucune parole claire détectée. Veuillez réessayer.');
        }
      } catch (error) {
        console.error('Erreur lors du traitement vocal:', error);
        setMicState('erreur');
        setErrorMessage(
          'Le service de reconnaissance vocale est momentanément indisponible. Vous pouvez réessayer ou saisir votre recherche au clavier.'
        );
        setStatusMessage(null);
      }
      return;
    }

    // Sinon arrêt du Web Speech standard
    recognitionServiceRef.current?.stop();
    setMicState('inactif');
    setStatusMessage(null);
  };

  const handleConsentAccepted = () => {
    localStorage.setItem('oratama_mic_consent', 'true');
    setShowConsentModal(false);
    void startActiveListening();
  };

  const handleConsentCancelled = () => {
    setShowConsentModal(false);
    setMicState('inactif');
    setStatusMessage('Vous pouvez taper votre demande directement dans le champ texte ci-dessous.');
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = textInput.trim();
    if (!query) {
      setErrorMessage('Veuillez formuler ou écrire votre demande.');
      return;
    }
    setErrorMessage(null);
    onSearch(query);
  };

  const handleExampleClick = (example: string) => {
    setTextInput(example);
    onSearch(example);
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-4 py-6">
      {/* En-tête de page */}
      <div className="text-center mt-1 mb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B2A] tracking-tight">
          Demandez un livre à voix haute
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B7A] mt-2 leading-relaxed">
          Décrivez librement ce que vous cherchez : genre, pays, thème ou budget. OraTama sélectionne les titres adaptés.
        </p>
      </div>

      {/* Zone centrale du Micro */}
      <div className="flex flex-col items-center justify-center my-3 space-y-4">
        {/* Badge d'état du micro : Mot ET icône */}
        <div
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            micState === 'ecoute'
              ? 'bg-[#FDF3E3] text-[#1B1B2A] border-[#E9A23B]'
              : micState === 'analyse'
              ? 'bg-[#EEF2FF] text-[#1F2A5C] border-[#1F2A5C]/40'
              : micState === 'erreur'
              ? 'bg-[#FDF0ED] text-[#B3261E] border-[#B3261E]'
              : 'bg-white text-[#6B6B7A] border-[#E8E3DA]'
          }`}
        >
          {micState === 'ecoute' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-ping" aria-hidden="true" />
              <span>Micro actif · Durée : {formatSeconds(elapsedSeconds)}</span>
            </>
          )}
          {micState === 'analyse' && (
            <>
              <span className="w-3 h-3 border-2 border-[#1F2A5C] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <span>Compréhension de votre demande…</span>
            </>
          )}
          {micState === 'inactif' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F2A5C]" aria-hidden="true" />
              <span>Micro prêt · Touchez pour parler</span>
            </>
          )}
          {micState === 'erreur' && (
            <>
              <span aria-hidden="true">⚠️</span>
              <span>Micro : Action requise</span>
            </>
          )}
        </div>

        {/* Bouton Micro grand format (au moins 80px) */}
        <div className="relative flex items-center justify-center">
          {micState === 'ecoute' && (
            <div
              className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#E9A23B]/30 animate-ping pointer-events-none"
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            onClick={micState === 'ecoute' ? handleStopListening : handleStartListening}
            disabled={micState === 'analyse'}
            aria-label={
              micState === 'ecoute'
                ? 'Arrêter et lancer la recherche'
                : 'Démarrer la recherche vocale'
            }
            aria-pressed={micState === 'ecoute'}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 focus-visible:ring-4 focus-visible:ring-[#1F2A5C]/40 ${
              micState === 'ecoute'
                ? 'bg-[#E9A23B] text-[#1B1B2A] ring-4 ring-[#E9A23B]/50 animate-mic-pulse border-2 border-[#1F2A5C]'
                : micState === 'analyse'
                ? 'bg-[#1F2A5C]/80 text-white cursor-wait'
                : micState === 'erreur'
                ? 'bg-[#B3261E] text-white hover:bg-[#8F1E18]'
                : 'bg-[#1F2A5C] hover:bg-[#161E42] text-white'
            }`}
          >
            {micState === 'ecoute' ? (
              <>
                <svg
                  className="w-8 h-8 mb-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-wider">Terminer</span>
              </>
            ) : micState === 'analyse' ? (
              <>
                <span className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin mb-1" />
                <span className="text-[9px] font-black uppercase tracking-wider">Analyse</span>
              </>
            ) : micState === 'erreur' ? (
              <>
                <svg
                  className="w-7 h-7 mb-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-wider">Réessayer</span>
              </>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mb-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-wider">Parler</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs font-semibold text-[#6B6B7A]">
          {micState === 'ecoute'
            ? 'Prenez tout votre temps · Touchez « Terminer » quand vous avez fini'
            : micState === 'analyse'
            ? 'Extraction sémantique des critères en cours…'
            : micState === 'erreur'
            ? 'Touchez le bouton pour réessayer ou écrivez ci-dessous'
            : 'Touchez le micro pour parler ou écrivez votre demande'}
        </p>

        {/* Zone de transcription en direct (aria-live) */}
        <div
          role="region"
          aria-live="polite"
          aria-atomic="true"
          className="w-full min-h-[52px] p-3 rounded-xl bg-white border border-[#E8E3DA] text-center flex flex-col justify-center shadow-sm"
        >
          {liveTranscript ? (
            <p className="text-sm font-semibold text-[#1B1B2A] italic">
              « {liveTranscript} »
            </p>
          ) : statusMessage ? (
            <p className="text-xs font-medium text-[#1F2A5C] animate-pulse">
              {statusMessage}
            </p>
          ) : (
            <p className="text-xs text-[#6B6B7A]">
              Votre voix sera transcrite ici dès que vous parlez…
            </p>
          )}
        </div>

        {/* Message d'erreur vocal avec bouton d'autorisation */}
        {errorMessage && (
          <div
            role="alert"
            className="w-full p-3.5 rounded-xl bg-[#FDF0ED] border border-[#B3261E]/40 text-[#B3261E] text-xs leading-relaxed space-y-2"
          >
            <p className="font-bold flex items-center gap-1.5 mb-0.5">
              <span>⚠️</span>
              <span>Accès microphone :</span>
            </p>
            <p className="text-[#1B1B2A]">{errorMessage}</p>

            <div className="pt-2 border-t border-[#B3261E]/20 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setStatusMessage('Demande d’autorisation micro en cours…');
                  const res = await requestMicrophonePermission();
                  if (res.granted) {
                    setErrorMessage(null);
                    setStatusMessage('Permission accordée ! Démarrage du micro…');
                    void startActiveListening();
                  } else {
                    setStatusMessage(null);
                    setErrorMessage(res.error || 'Permission micro refusée par le navigateur.');
                  }
                }}
                className="min-h-[38px] px-3.5 py-1.5 bg-[#1F2A5C] text-white text-[11px] font-bold rounded-lg hover:bg-[#161E42] transition-colors shadow-sm"
              >
                Autoriser le micro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alternative : Saisie textuelle toujours accessible */}
      <div className="mt-2 mb-4">
        <form onSubmit={handleTextSubmit} className="space-y-2">
          <label htmlFor="search-input" className="block text-xs font-semibold text-[#6B6B7A]">
            Ou tapez votre recherche au clavier :
          </label>
          <div className="flex gap-2">
            <input
              id="search-input"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ex: Un roman d'amour béninois…"
              className="flex-1 min-h-[44px] px-3.5 py-2 text-sm bg-white border border-[#E8E3DA] rounded-xl text-[#1B1B2A] placeholder-[#6B6B7A] focus:border-[#1F2A5C] focus:ring-1 focus:ring-[#1F2A5C]"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 bg-[#1F2A5C] hover:bg-[#161E42] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Trouver
            </button>
          </div>
        </form>
      </div>

      {/* 4 Exemples cliquables */}
      <div className="pt-3 border-t border-[#E8E3DA]">
        <p className="text-xs font-semibold text-[#6B6B7A] mb-2">
          Exemples de demandes vocales à tester :
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_QUERIES.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="w-full min-h-[44px] text-left text-xs sm:text-sm p-3 rounded-xl bg-white hover:bg-[#E8ECFA]/50 border border-[#E8E3DA] text-[#1B1B2A] font-medium transition-colors flex items-center justify-between group shadow-sm"
            >
              <span className="line-clamp-1">« {example} »</span>
              <span className="text-[#1F2A5C] text-xs font-bold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sélection découverte du catalogue (évite l'écran vide pour le curieux) */}
      <div className="mt-6 pt-5 border-t border-[#E8E3DA] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6B7A]">
            Ou découvrez une sélection du catalogue
          </h2>
          <button
            type="button"
            onClick={() => onSearch('')}
            className="text-xs text-[#1F2A5C] hover:underline font-semibold"
          >
            Tout voir →
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {CURATED_BOOKS.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => onNavigate({ name: 'book', bookId: book.id })}
              className="w-full min-h-[48px] p-2.5 rounded-xl bg-white hover:bg-[#E8ECFA]/40 border border-[#E8E3DA] text-left transition-all flex items-center gap-3 shadow-sm group"
            >
              <BookCover book={book} size="sm" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F2A5C] bg-[#E8ECFA] px-1.5 py-0.5 rounded">
                    {book.genre}
                  </span>
                  <span className="text-[11px] text-[#6B6B7A] truncate">{book.pays}</span>
                </div>
                <p className="font-bold text-xs text-[#1B1B2A] truncate mt-0.5 group-hover:text-[#1F2A5C]">
                  {book.titre}
                </p>
                <p className="text-[11px] text-[#6B6B7A] truncate">
                  {book.auteur} · {book.prixFcfa.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <span className="text-[#1F2A5C] text-sm font-bold group-hover:translate-x-1 transition-transform pr-1" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal de consentement au micro */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccepted}
        onCancel={handleConsentCancelled}
      />
    </div>
  );
};

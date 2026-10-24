import React, { useState, useRef, useEffect } from 'react';
import { ViewScreen } from '../types';
import { isSpeechRecognitionSupported, SpeechRecognitionService } from '../utils/speechRecognition';
import { ConsentModal } from '../components/ConsentModal';

interface HomeScreenProps {
  onNavigate: (screen: ViewScreen) => void;
  onSearch: (query: string) => void;
}

const EXAMPLE_QUERIES = [
  "Un roman d'amour, court, d'un auteur béninois",
  "Des contes pour enfants à moins de 1500 francs",
  "Un essai philosophique sur la mémoire",
  "Un conte en fon",
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSearch }) => {
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const recognitionServiceRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    recognitionServiceRef.current = new SpeechRecognitionService();
    return () => {
      recognitionServiceRef.current?.stop();
    };
  }, []);

  const handleStartListening = () => {
    setErrorMessage(null);
    setStatusMessage(null);

    // Vérifier support navigateur
    if (!isSpeechRecognitionSupported()) {
      setErrorMessage(
        'La reconnaissance vocale n’est pas supportée par ce navigateur. Utilisez le champ texte ci-dessous pour formuler votre demande.'
      );
      return;
    }

    // Vérifier hors-ligne
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage(
        'Vous êtes hors ligne. La reconnaissance vocale nécessite une connexion sur certains navigateurs. Vous pouvez saisir votre demande par écrit.'
      );
    }

    // Vérifier consentement préalable
    const hasConsented = localStorage.getItem('oratama_mic_consent') === 'true';
    if (!hasConsented) {
      setShowConsentModal(true);
      return;
    }

    startRecognition();
  };

  const startRecognition = () => {
    if (!recognitionServiceRef.current) return;

    setLiveTranscript('');
    setStatusMessage('Écoute en cours… Parlez à voix haute.');

    const started = recognitionServiceRef.current.start({
      onStart: () => {
        setIsListening(true);
        setStatusMessage('Je vous écoute… Demandez un livre.');
      },
      onInterimResult: (transcript) => {
        setLiveTranscript(transcript);
        setStatusMessage('Transcription en cours…');
      },
      onFinalResult: (transcript) => {
        setLiveTranscript(transcript);
        setTextInput(transcript);
        setIsListening(false);
        setStatusMessage('Recherche en cours…');
        // Déclencher directement la recherche
        onSearch(transcript);
      },
      onError: (_type, message) => {
        setIsListening(false);
        setErrorMessage(message);
        setStatusMessage(null);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    recognitionServiceRef.current?.stop();
    setIsListening(false);
    setStatusMessage(null);
  };

  const handleConsentAccepted = () => {
    localStorage.setItem('oratama_mic_consent', 'true');
    setShowConsentModal(false);
    startRecognition();
  };

  const handleConsentCancelled = () => {
    setShowConsentModal(false);
    setStatusMessage('Vous pouvez taper votre demande directement dans le champ texte.');
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
      <div className="text-center mt-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1F1A1A] tracking-tight">
          Demandez un livre à voix haute
        </h1>
        <p className="text-sm text-[#5C5454] mt-2 leading-relaxed">
          Dites un genre, un pays, un thème, une longueur ou un prix en FCFA. OraTama sélectionne les titres adaptés.
        </p>
      </div>

      {/* Zone centrale du Micro */}
      <div className="flex flex-col items-center justify-center my-4 space-y-4">
        <div className="relative flex items-center justify-center">
          {/* Cercle d'onde sonore si écoute active */}
          {isListening && (
            <div
              className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#933B40]/20 animate-ping pointer-events-none"
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            onClick={isListening ? handleStopListening : handleStartListening}
            aria-label={isListening ? 'Arrêter l’enregistrement vocal' : 'Démarrer la recherche vocale'}
            aria-pressed={isListening}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 focus-visible:ring-4 focus-visible:ring-[#933B40]/50 ${
              isListening
                ? 'bg-red-700 animate-mic-pulse ring-4 ring-red-400'
                : 'bg-[#933B40] hover:bg-[#752A2E]'
            }`}
          >
            {isListening ? (
              <svg
                className="w-10 h-10 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                className="w-10 h-10"
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
            )}
          </button>
        </div>

        <p className="text-xs font-semibold text-[#5C5454] uppercase tracking-wider">
          {isListening ? 'Touchez pour arrêter' : 'Touchez le micro pour parler'}
        </p>

        {/* Zone de transcription en direct (aria-live) */}
        <div
          role="region"
          aria-live="polite"
          aria-atomic="true"
          className="w-full min-h-[48px] p-3 rounded-xl bg-white border border-[#E5DCD3] text-center flex flex-col justify-center shadow-sm"
        >
          {liveTranscript ? (
            <p className="text-sm font-semibold text-[#1F1A1A] italic">
              « {liveTranscript} »
            </p>
          ) : statusMessage ? (
            <p className="text-xs font-medium text-[#933B40] animate-pulse">
              {statusMessage}
            </p>
          ) : (
            <p className="text-xs text-[#5C5454]">
              La transcription apparaîtra ici en temps réel…
            </p>
          )}
        </div>

        {/* Message d'erreur vocal ou repli */}
        {errorMessage && (
          <div
            role="alert"
            className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed"
          >
            <p className="font-semibold mb-1">Notice vocale :</p>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Alternative : Saisie textuelle toujours visible */}
      <div className="mt-2 mb-6">
        <form onSubmit={handleTextSubmit} className="space-y-2">
          <label htmlFor="search-input" className="block text-xs font-semibold text-[#5C5454]">
            Ou tapez votre recherche au clavier :
          </label>
          <div className="flex gap-2">
            <input
              id="search-input"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ex: Un roman d'amour béninois…"
              className="flex-1 min-h-[44px] px-3.5 py-2 text-sm bg-white border border-[#E5DCD3] rounded-xl text-[#1F1A1A] placeholder-[#8C8282] focus:border-[#933B40] focus:ring-1 focus:ring-[#933B40]"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 bg-[#933B40] hover:bg-[#752A2E] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Trouver
            </button>
          </div>
        </form>
      </div>

      {/* 4 Exemples cliquables */}
      <div className="mt-auto pt-2 border-t border-[#E5DCD3]/60">
        <p className="text-xs font-semibold text-[#5C5454] mb-2.5">
          Exemples de demandes vocales à tester :
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_QUERIES.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="w-full min-h-[44px] text-left text-xs sm:text-sm p-3 rounded-xl bg-[#F6EAEB]/60 hover:bg-[#F6EAEB] border border-[#933B40]/20 text-[#1F1A1A] font-medium transition-colors flex items-center justify-between group"
            >
              <span className="line-clamp-1">« {example} »</span>
              <span className="text-[#933B40] text-xs font-bold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
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

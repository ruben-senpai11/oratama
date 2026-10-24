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
  const [micState, setMicState] = useState<'inactif' | 'ecoute' | 'erreur'>('inactif');
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
      setMicState('erreur');
      setErrorMessage(
        'La reconnaissance vocale n’est pas supportée par ce navigateur. Utilisez le champ texte ci-dessous pour formuler votre demande.'
      );
      return;
    }

    // Vérifier consentement préalable
    const hasConsented = localStorage.getItem('oratama_mic_consent') === 'true';
    if (!hasConsented) {
      setShowConsentModal(true);
      return;
    }

    void startRecognition();
  };

  const startRecognition = async () => {
    if (!recognitionServiceRef.current) return;

    setLiveTranscript('');
    setErrorMessage(null);
    setMicState('ecoute');
    setStatusMessage('Connexion au micro… Parlez à voix haute.');

    const started = await recognitionServiceRef.current.start({
      onStart: () => {
        setMicState('ecoute');
        setStatusMessage('Je vous écoute… Demandez un livre.');
      },
      onInterimResult: (transcript) => {
        setLiveTranscript(transcript);
        setStatusMessage('Transcription en cours…');
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
          // Simple silence : le micro fonctionne, ne pas bloquer l'interface en rouge
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

  const handleStopListening = () => {
    recognitionServiceRef.current?.stop();
    setMicState('inactif');
    setStatusMessage(null);
  };

  const handleConsentAccepted = () => {
    localStorage.setItem('oratama_mic_consent', 'true');
    setShowConsentModal(false);
    void startRecognition();
  };

  const handleConsentCancelled = () => {
    setShowConsentModal(false);
    setMicState('inactif');
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
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B2A] tracking-tight">
          Demandez un livre à voix haute
        </h1>
        <p className="text-sm text-[#6B6B7A] mt-2 leading-relaxed">
          Dites un genre, un pays, un thème, une longueur ou un prix en FCFA. OraTama sélectionne les titres adaptés.
        </p>
      </div>

      {/* Zone centrale du Micro */}
      <div className="flex flex-col items-center justify-center my-4 space-y-4">
        {/* Badge d'état du micro : Mot ET icône, jamais la couleur seule */}
        <div
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            micState === 'ecoute'
              ? 'bg-[#FDF3E3] text-[#1B1B2A] border-[#E9A23B]'
              : micState === 'erreur'
              ? 'bg-[#FDF0ED] text-[#B3261E] border-[#B3261E]'
              : 'bg-white text-[#6B6B7A] border-[#E8E3DA]'
          }`}
        >
          {micState === 'ecoute' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-ping" aria-hidden="true" />
              <span>Micro : En écoute active</span>
            </>
          )}
          {micState === 'inactif' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F2A5C]" aria-hidden="true" />
              <span>Micro : Inactif (prêt à écouter)</span>
            </>
          )}
          {micState === 'erreur' && (
            <>
              <span aria-hidden="true">⚠️</span>
              <span>Micro : Problème d’accès détecté</span>
            </>
          )}
        </div>

        {/* Bouton Micro d'au moins 72px (ici 80-96px) */}
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
            aria-label={
              micState === 'ecoute'
                ? 'Arrêter l’enregistrement vocal'
                : 'Démarrer la recherche vocale'
            }
            aria-pressed={micState === 'ecoute'}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 focus-visible:ring-4 focus-visible:ring-[#1F2A5C]/40 ${
              micState === 'ecoute'
                ? 'bg-[#E9A23B] text-[#1B1B2A] ring-4 ring-[#E9A23B]/50 animate-mic-pulse border-2 border-[#1F2A5C]'
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
                <span className="text-[10px] font-black uppercase tracking-wider">Arrêter</span>
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
            ? 'Écoute en direct · Touchez pour terminer'
            : micState === 'erreur'
            ? 'Touchez le bouton rouge pour réessayer ou écrivez ci-dessous'
            : 'Touchez le micro ou écrivez votre demande'}
        </p>

        {/* Zone de transcription en direct (aria-live) */}
        <div
          role="region"
          aria-live="polite"
          aria-atomic="true"
          className="w-full min-h-[48px] p-3 rounded-xl bg-white border border-[#E8E3DA] text-center flex flex-col justify-center shadow-sm"
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
              La transcription apparaîtra ici en temps réel…
            </p>
          )}
        </div>

        {/* Message d'erreur vocal ou repli avec mot et icône */}
        {errorMessage && (
          <div
            role="alert"
            className="w-full p-3.5 rounded-xl bg-[#FDF0ED] border border-[#B3261E]/40 text-[#B3261E] text-xs leading-relaxed"
          >
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <span>⚠️</span>
              <span>Information vocale :</span>
            </p>
            <p className="text-[#1B1B2A]">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Alternative : Saisie textuelle toujours visible */}
      <div className="mt-2 mb-6">
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
      <div className="mt-auto pt-2 border-t border-[#E8E3DA]">
        <p className="text-xs font-semibold text-[#6B6B7A] mb-2.5">
          Exemples de demandes vocales à tester :
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_QUERIES.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="w-full min-h-[44px] text-left text-xs sm:text-sm p-3 rounded-xl bg-white hover:bg-[#E8ECFA]/50 border border-[#E8E3DA] text-[#1B1B2A] font-medium transition-colors flex items-center justify-between group"
            >
              <span className="line-clamp-1">« {example} »</span>
              <span className="text-[#1F2A5C] text-xs font-bold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
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

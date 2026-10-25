import React, { useState, useRef, useEffect } from 'react';
import { ViewScreen } from '../types';
import {
  isSpeechRecognitionSupported,
  SpeechRecognitionService,
  requestMicrophonePermission
} from '../utils/speechRecognition';
import {
  getGeminiApiKey,
  isGeminiConfigured,
  FreeAudioRecorder,
  processAudioWithGemini
} from '../utils/geminiAudioService';
import { ConsentModal } from '../components/ConsentModal';
import { GeminiKeyModal } from '../components/GeminiKeyModal';

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
  const [micState, setMicState] = useState<'inactif' | 'ecoute' | 'analyse' | 'erreur'>('inactif');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  // Services
  const recognitionServiceRef = useRef<SpeechRecognitionService | null>(null);
  const audioRecorderRef = useRef<FreeAudioRecorder | null>(null);

  // Synchroniser l'état de la clé Gemini
  useEffect(() => {
    setHasGeminiKey(isGeminiConfigured());
  }, []);

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

    const geminiKey = getGeminiApiKey();

    // MODE 1 : Si la clé Gemini 2.0 Flash est configurée -> Enregistrement MediaRecorder sans limite
    if (geminiKey) {
      if (!audioRecorderRef.current) return;

      setMicState('ecoute');
      setStatusMessage('Enregistrement en direct avec Gemini 2.0 Flash… Parlez librement sans limite de temps.');

      const started = await audioRecorderRef.current.start((sec) => {
        setElapsedSeconds(sec);
      });

      if (!started) {
        setMicState('erreur');
        setErrorMessage('Impossible d’accéder au microphone physique. Veuillez vérifier les autorisations de votre navigateur.');
      }
      return;
    }

    // MODE 2 : Si pas de clé Gemini configurée
    // Proposer d'abord d'ajouter la clé pour l'expérience sans limite, ou continuer avec le micro navigateur
    const userPrefersBrowser = localStorage.getItem('oratama_prefer_browser_speech') === 'true';
    if (!userPrefersBrowser) {
      setShowGeminiModal(true);
      return;
    }

    // Lancer la reconnaissance standard navigateur (Web Speech)
    await startBrowserSpeech();
  };

  const startBrowserSpeech = async () => {
    if (!isSpeechRecognitionSupported()) {
      setMicState('erreur');
      setErrorMessage(
        'La reconnaissance vocale de ce navigateur n’est pas supportée. Activez Gemini 2.0 Flash avec votre clé gratuite ou utilisez le champ texte.'
      );
      return;
    }

    if (!recognitionServiceRef.current) return;

    setMicState('ecoute');
    setStatusMessage('Connexion au micro navigateur… Parlez à voix haute.');

    const started = await recognitionServiceRef.current.start({
      onStart: () => {
        setMicState('ecoute');
        setStatusMessage('Je vous écoute… Décrivez votre livre sans limitation de temps.');
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
    const geminiKey = getGeminiApiKey();

    // Si on enregistre avec Gemini
    if (geminiKey && audioRecorderRef.current?.isRecording) {
      setMicState('analyse');
      setStatusMessage('Analyse vocale et compréhension par Gemini 2.0 Flash en cours…');

      try {
        const audioBlob = await audioRecorderRef.current.stop();
        if (!audioBlob || audioBlob.size < 1000) {
          setMicState('inactif');
          setStatusMessage('Enregistrement trop court. Maintenez le micro et parlez à voix haute.');
          return;
        }

        // Appel multimodal à Gemini 2.0 Flash
        const result = await processAudioWithGemini(audioBlob, geminiKey);

        if (result.transcript) {
          setLiveTranscript(result.transcript);
          setTextInput(result.transcript);
          setMicState('inactif');
          setStatusMessage(`Compris : « ${result.transcript} »`);
          onSearch(result.transcript);
        } else {
          setMicState('inactif');
          setStatusMessage('Aucune parole claire détectée par Gemini. Veuillez réessayer.');
        }
      } catch (error) {
        console.error('Erreur lors du traitement Gemini:', error);
        setMicState('erreur');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Erreur lors de la communication avec Gemini 2.0 Flash. Vérifiez votre clé API.'
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
      {/* Sélecteur / Badge d'état du moteur vocal */}
      <div className="flex items-center justify-center mb-3">
        {hasGeminiKey ? (
          <button
            type="button"
            onClick={() => setShowGeminiModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EBF7EE] text-[#137333] border border-[#137333]/30 hover:bg-[#D9F2DE] transition-colors"
          >
            <span>✨</span>
            <span>Moteur : Gemini 2.0 Flash (Écoute libre)</span>
            <span className="text-[#137333]/70 font-normal underline ml-1">Modifier</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowGeminiModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FDF3E3] text-[#B06000] border border-[#E9A23B]/50 hover:bg-[#FBEBD0] transition-colors shadow-sm"
          >
            <span>✨</span>
            <span>Activer Gemini 2.0 Flash (Recommandé · Sans limite)</span>
            <span className="font-extrabold ml-0.5">→</span>
          </button>
        )}
      </div>

      {/* En-tête de page */}
      <div className="text-center mt-1 mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B2A] tracking-tight">
          Demandez un livre à voix haute
        </h1>
        <p className="text-sm text-[#6B6B7A] mt-2 leading-relaxed">
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
              <span>Micro actif · Durée : {formatSeconds(elapsedSeconds)} (Sans limite)</span>
            </>
          )}
          {micState === 'analyse' && (
            <>
              <span className="w-3 h-3 border-2 border-[#1F2A5C] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <span>Analyse Gemini 2.0 Flash en cours…</span>
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
              <span>Micro : Problème d’accès détecté</span>
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
            ? 'Gemini 2.0 Flash extrait les critères de votre recherche…'
            : micState === 'erreur'
            ? 'Touchez le bouton rouge pour réessayer ou écrivez ci-dessous'
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

        {/* Message d'erreur vocal avec options de résolution */}
        {errorMessage && (
          <div
            role="alert"
            className="w-full p-3.5 rounded-xl bg-[#FDF0ED] border border-[#B3261E]/40 text-[#B3261E] text-xs leading-relaxed space-y-2"
          >
            <p className="font-bold flex items-center gap-1.5 mb-0.5">
              <span>⚠️</span>
              <span>Information vocale :</span>
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

              <button
                type="button"
                onClick={() => setShowGeminiModal(true)}
                className="min-h-[38px] px-3.5 py-1.5 bg-white border border-[#1F2A5C] text-[#1F2A5C] text-[11px] font-bold rounded-lg hover:bg-[#F2EFE9] transition-colors"
              >
                Vérifier ma clé Gemini
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alternative : Saisie textuelle toujours accessible */}
      <div className="mt-2 mb-5">
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

      {/* Modal de configuration de la clé Gemini */}
      <GeminiKeyModal
        isOpen={showGeminiModal}
        onClose={() => setShowGeminiModal(false)}
        onKeySaved={() => {
          setHasGeminiKey(isGeminiConfigured());
          setStatusMessage('Gemini 2.0 Flash activé ! Vous pouvez maintenant parler sans limite de temps.');
        }}
        onFallbackToBrowser={() => {
          localStorage.setItem('oratama_prefer_browser_speech', 'true');
          setHasGeminiKey(false);
          void startBrowserSpeech();
        }}
      />
    </div>
  );
};

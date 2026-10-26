import React, { useState, useRef, useEffect } from 'react';
import { Book, ParsedQuery, ViewScreen } from '../types';
import booksData from '../data/books.json';
import { BookCover } from '../components/BookCover';
import { AudioRecorderService } from '../utils/audioRecorder';
import { processAudioWithBackend } from '../utils/geminiAudioService';
import { SpeechRecognitionService, requestMicrophonePermission } from '../utils/speechRecognition';
import { normalizeText, parseQuery } from '../utils/queryParser';
import { ConsentModal } from '../components/ConsentModal';

interface HomeScreenProps {
  onNavigate: (screen: ViewScreen) => void;
  onSearch: (query: string, parsedOverride?: ParsedQuery) => void;
}

const EXAMPLE_QUERIES = [
  "Un roman d'amour, court, d'un auteur béninois",
  "Un livre sur les plantes, les herbes médicinales",
  "Des contes pour enfants à moins de 1500 francs",
  "Un polar palpitant à Abidjan",
];

const allBooks: Book[] = booksData as Book[];
// Sélection variée de 3 livres découverte pour l'accueil
const CURATED_BOOKS: Book[] = [
  allBooks.find((b) => b.id === 'lagune-des-amours') || allBooks[0],
  allBooks.find((b) => b.id === 'batouala-rene-maran') || allBooks[1],
  allBooks.find((b) => b.id === 'les-gardiennes-du-fleuve') || allBooks[2],
].filter(Boolean);

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onSearch }) => {
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [speechEngine, setSpeechEngine] = useState<'webspeech' | 'gemini'>('gemini');
  const [micState, setMicState] = useState<'inactif' | 'ecoute' | 'analyse' | 'erreur'>('inactif');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{
    type: 'permission' | 'server' | 'no-speech' | 'general';
    message: string;
  } | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Moteur Gemini : Enregistreur audio continu
  const recorderRef = useRef<AudioRecorderService | null>(null);
  // Moteur Web Speech : Reconnaissance locale navigateur
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const lastWebSpeechTranscriptRef = useRef<string>('');

  useEffect(() => {
    recorderRef.current = new AudioRecorderService();
    speechRecognitionRef.current = new SpeechRecognitionService();

    return () => {
      recorderRef.current?.cancelRecording();
      speechRecognitionRef.current?.abort();
    };
  }, []);

  // Formatage du compteur de temps d'enregistrement mm:ss
  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  const handleStartListening = () => {
    setErrorInfo(null);
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
    setErrorInfo(null);
    setElapsedSeconds(0);
    lastWebSpeechTranscriptRef.current = '';

    // MOTEUR 1 : Web Speech API (instantané local)
    if (speechEngine === 'webspeech') {
      if (!speechRecognitionRef.current) return;
      setStatusMessage('Démarrage de Web Speech API…');

      const started = await speechRecognitionRef.current.start({
        onStart: () => {
          setMicState('ecoute');
          setStatusMessage('Web Speech actif : je vous écoute… Parlez distinctement.');
        },
        onInterimResult: (interim) => {
          setLiveTranscript(interim);
          lastWebSpeechTranscriptRef.current = interim;
        },
        onFinalResult: (final) => {
          setLiveTranscript(final);
          lastWebSpeechTranscriptRef.current = final;
          handleWebSpeechComplete(final);
        },
        onError: (errType, msg) => {
          setMicState('erreur');
          setErrorInfo({
            type: errType === 'not-allowed' ? 'permission' : errType === 'no-speech' ? 'no-speech' : 'general',
            message: msg || 'Erreur lors de la reconnaissance Web Speech.',
          });
          setStatusMessage('Reconnaissance interrompue. Touchez « Réessayer » pour recommencer.');
        },
        onEnd: () => {
          if (lastWebSpeechTranscriptRef.current) {
            handleWebSpeechComplete(lastWebSpeechTranscriptRef.current);
          }
        },
      });

      if (!started) {
        setMicState('erreur');
      }
      return;
    }

    // MOTEUR 2 : Gemini IA (par défaut, analyse multimodale côté serveur)
    if (!recorderRef.current) return;

    setStatusMessage('Activation du microphone…');

    const started = await recorderRef.current.startRecording({
      maxDurationSeconds: 180, // Jusqu'à 3 minutes libres sans contrainte de temps
      onTimeUpdate: (elapsed) => {
        setElapsedSeconds(elapsed);
      },
      onComplete: async (blob, mime) => {
        await handleAudioRecorded(blob, mime);
      },
      onError: (err) => {
        setMicState('erreur');
        setErrorInfo({
          type: 'permission',
          message: err || 'Impossible d’accéder au micro. Veuillez autoriser le microphone.',
        });
        setStatusMessage(null);
      },
    });

    if (started) {
      setMicState('ecoute');
      setStatusMessage('Gemini IA à l’écoute… Décrivez votre livre sans limite de temps.');
    } else {
      setMicState('erreur');
      if (!errorInfo) {
        setErrorInfo({
          type: 'permission',
          message: 'Impossible de démarrer l’enregistrement audio.',
        });
      }
    }
  };

  // Arrêt volontaire par l'utilisateur
  const handleStopListening = () => {
    if (speechEngine === 'webspeech') {
      setMicState('analyse');
      setStatusMessage('Finalisation de la transcription…');
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        setTimeout(() => {
          if (lastWebSpeechTranscriptRef.current) {
            handleWebSpeechComplete(lastWebSpeechTranscriptRef.current);
          }
        }, 400);
      }
      return;
    }

    // Moteur Gemini
    setMicState('analyse');
    setStatusMessage('Compréhension de votre demande par l’IA Gemini…');
    if (recorderRef.current?.isRecording()) {
      recorderRef.current.stopRecording();
    }
  };

  // Traitement direct pour Web Speech API
  const handleWebSpeechComplete = (transcript: string) => {
    const cleanText = transcript.trim();
    if (!cleanText) {
      setMicState('erreur');
      setErrorInfo({
        type: 'no-speech',
        message: 'Aucune parole distincte n’a été reconnue. Touchez « Réessayer » ou choisissez le moteur Gemini IA pour une analyse plus approfondie.',
      });
      setStatusMessage('Aucune parole détectée. Touchez « Réessayer » ou tapez au clavier ci-dessous.');
      return;
    }

    setMicState('inactif');
    setStatusMessage(`Compris : « ${cleanText} »`);
    setTextInput(cleanText);

    // Analyse et parsing des critères de recherche
    const parsed = parseQuery(cleanText);
    onSearch(cleanText, parsed);
  };

  // Traitement audio Gemini une fois l'enregistrement finalisé
  const handleAudioRecorded = async (blob: Blob, _mime: string) => {
    setMicState('analyse');
    setStatusMessage('Compréhension de votre demande par l’IA Gemini…');

    if (!blob || blob.size < 100) {
      setMicState('erreur');
      setErrorInfo({
        type: 'no-speech',
        message: 'L’enregistrement était trop court ou silencieux. Touchez le bouton pour réessayer en parlant près de votre microphone.',
      });
      setStatusMessage('Enregistrement trop court. Touchez « Réessayer » pour recommencer.');
      return;
    }

    try {
      const result = await processAudioWithBackend(blob);
      console.log('[HomeScreen] Résultat IA Gemini :', result);

      const extractedQuery = (
        result.transcript ||
        result.searchTerms ||
        [result.genre, result.pays].filter(Boolean).join(' ') ||
        ''
      ).trim();

      if (extractedQuery) {
        setLiveTranscript(extractedQuery);
        setTextInput(extractedQuery);
        setMicState('inactif');
        setStatusMessage(`Compris : « ${extractedQuery} »`);

        const parsedOverride: ParsedQuery = {
          raw: extractedQuery,
          normalized: normalizeText(extractedQuery),
          genre: (result.genre as any) || undefined,
          longueur: (result.longueur as any) || undefined,
          pays: result.pays || undefined,
          themes: result.themes || [],
          maxPrixFcfa: result.maxPrixFcfa || undefined,
          isUnderstood: true,
        };

        onSearch(extractedQuery, parsedOverride);
        return;
      }

      // Si des filtres ont été reconnus même sans transcription textuelle explicite
      if (result.genre || result.pays || (result.themes && result.themes.length > 0)) {
        const fallbackText = [result.genre, result.pays, ...(result.themes || [])].filter(Boolean).join(' ');
        setLiveTranscript(fallbackText);
        setTextInput(fallbackText);
        setMicState('inactif');
        onSearch(fallbackText);
        return;
      }

      // Silence ou voix inaudible : ne pas réinitialiser silencieusement, informer l'utilisateur avec bouton Réessayer
      setMicState('erreur');
      setErrorInfo({
        type: 'no-speech',
        message: 'Aucune parole claire n’a pu être comprise dans votre enregistrement. Vérifiez que votre microphone est activé et parlez distinctement.',
      });
      setStatusMessage('Aucune parole détectée. Touchez « Réessayer » pour recommencer ou tapez au clavier ci-dessous.');
    } catch (err: any) {
      console.error('[HomeScreen] Échec du traitement audio :', err);
      setMicState('erreur');
      setErrorInfo({
        type: 'server',
        message: err?.message || 'Le serveur vocal n’a pas pu traiter l’audio. Touchez « Réessayer » ou tapez votre recherche ci-dessous.',
      });
      setStatusMessage('Erreur de traitement. Touchez « Réessayer » ou tapez au clavier ci-dessous.');
    }
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
      setErrorInfo({
        type: 'general',
        message: 'Veuillez formuler ou écrire votre demande.',
      });
      return;
    }
    setErrorInfo(null);
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
        <h1 className="text-2xl sm:text-3xl font-black text-[#181826] tracking-tight">
          Demandez un livre à voix haute
        </h1>
        <p className="text-xs sm:text-sm text-[#656575] mt-2 leading-relaxed">
          Décrivez librement ce que vous cherchez : genre, pays, thème ou budget. OraTama sélectionne les titres adaptés.
        </p>
      </div>

      {/* Zone centrale du Micro */}
      <div className="flex flex-col items-center justify-center my-3 space-y-4">
        {/* Badge d'état du micro */}
        <div
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            micState === 'ecoute'
              ? 'bg-[#FDF4E7] text-[#181826] border-[#E09228]'
              : micState === 'analyse'
              ? 'bg-[#E9EDF9] text-[#1E2958] border-[#1E2958]/40'
              : micState === 'erreur'
              ? 'bg-[#FDF0ED] text-[#B3261E] border-[#B3261E]'
              : 'bg-white text-[#656575] border-[#E6E0D6]'
          }`}
        >
          {micState === 'ecoute' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E09228] animate-ping" aria-hidden="true" />
              <span>Micro actif · Durée : {formatSeconds(elapsedSeconds)}</span>
            </>
          )}
          {micState === 'analyse' && (
            <>
              <span className="w-3 h-3 border-2 border-[#1E2958] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <span>Compréhension de votre demande…</span>
            </>
          )}
          {micState === 'inactif' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E2958]" aria-hidden="true" />
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

        {/* Bouton Micro grand format */}
        <div className="relative flex items-center justify-center my-2">
          {micState === 'ecoute' && (
            <div
              className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#E09228]/30 animate-ping pointer-events-none"
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
                : 'Démarrer la recherche orale'
            }
            aria-pressed={micState === 'ecoute'}
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 focus-visible:ring-4 focus-visible:ring-[#1E2958]/40 cursor-pointer ${
              micState === 'ecoute'
                ? 'bg-[#E09228] text-[#181826] ring-4 ring-[#E09228]/50 animate-mic-pulse border-2 border-[#1E2958]'
                : micState === 'analyse'
                ? 'bg-[#1E2958]/80 text-white cursor-wait'
                : micState === 'erreur'
                ? 'bg-[#B3261E] text-white hover:bg-[#8F1E18]'
                : 'bg-[#1E2958] hover:bg-[#141C3E] text-white'
            }`}
          >
            {micState === 'ecoute' ? (
              <>
                <svg
                  className="w-11 h-11 mb-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Terminer</span>
              </>
            ) : micState === 'analyse' ? (
              <>
                <span className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-1.5" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">Analyse</span>
              </>
            ) : micState === 'erreur' ? (
              <>
                <svg
                  className="w-10 h-10 mb-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Réessayer</span>
              </>
            ) : (
              <>
                <svg
                  className="w-12 h-12 mb-1"
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
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Parler</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs font-semibold text-[#656575]">
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
          className="w-full min-h-[52px] p-3 rounded-xl bg-white border border-[#E6E0D6] text-center flex flex-col justify-center shadow-sm"
        >
          {liveTranscript ? (
            <p className="text-sm font-semibold text-[#181826] italic">
              « {liveTranscript} »
            </p>
          ) : statusMessage ? (
            <p className="text-xs font-medium text-[#1E2958] animate-pulse">
              {statusMessage}
            </p>
          ) : (
            <p className="text-xs text-[#656575]">
              Votre voix sera transcrite ici dès que vous parlez…
            </p>
          )}
        </div>

        {/* Message d'erreur vocal contextualisé */}
        {errorInfo && (
          <div
            role="alert"
            className="w-full p-3.5 rounded-xl bg-[#FDF0ED] border border-[#B3261E]/40 text-[#B3261E] text-xs leading-relaxed space-y-2"
          >
            <p className="font-bold flex items-center gap-1.5 mb-0.5">
              <span>⚠️</span>
              <span>{errorInfo.type === 'permission' ? 'Accès microphone requis :' : 'Information orale :'}</span>
            </p>
            <p className="text-[#181826]">{errorInfo.message}</p>

            <div className="pt-2 border-t border-[#B3261E]/20 flex flex-wrap items-center gap-2">
              {errorInfo.type === 'permission' ? (
                <button
                  type="button"
                  onClick={async () => {
                    setStatusMessage('Demande d’autorisation micro en cours…');
                    const res = await requestMicrophonePermission();
                    if (res.granted) {
                      setErrorInfo(null);
                      setStatusMessage('Permission accordée ! Démarrage du micro…');
                      void startActiveListening();
                    } else {
                      setStatusMessage(null);
                      setErrorInfo({
                        type: 'permission',
                        message: res.error || 'Permission micro refusée par le navigateur.',
                      });
                    }
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 bg-[#1E2958] text-white text-[11px] font-bold rounded-lg hover:bg-[#141C3E] transition-colors shadow-sm"
                >
                  Autoriser le micro
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setErrorInfo(null);
                    void startActiveListening();
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 bg-[#1E2958] text-white text-[11px] font-bold rounded-lg hover:bg-[#141C3E] transition-colors shadow-sm"
                >
                  Réessayer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sélecteur compact de moteur oral avec bascule au milieu (sans fond encombrant) */}
      <div className="mt-2 mb-3">
        <div className="flex items-center justify-between gap-2 py-1 px-2 rounded-xl bg-transparent border border-[#E6E0D6]">
          {/* Côté gauche : Web Speech */}
          <button
            type="button"
            onClick={() => setSpeechEngine('webspeech')}
            className={`flex-1 text-right py-1 px-1.5 rounded-lg transition-all cursor-pointer ${
              speechEngine === 'webspeech'
                ? 'text-[#1E2958] font-bold'
                : 'text-[#656575] hover:text-[#181826] opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-bold leading-tight">Web Speech</span>
              <span className="text-[9px] px-1 py-0.2 rounded border border-[#E6E0D6] text-[#656575] bg-transparent">
                Navigateur
              </span>
            </div>
            <p className="text-[10px] text-[#656575] leading-tight mt-0.5">
              transcription instantanée, peu précise
            </p>
          </button>

          {/* Checkbox / Bascule au milieu */}
          <div className="shrink-0 flex items-center justify-center px-1">
            <label
              htmlFor="engine-toggle"
              className="relative inline-flex items-center cursor-pointer select-none"
              title={speechEngine === 'gemini' ? 'Moteur actif : Gemini IA (cliquez pour Web Speech)' : 'Moteur actif : Web Speech (cliquez pour Gemini IA)'}
            >
              <input
                id="engine-toggle"
                type="checkbox"
                role="switch"
                aria-label="Basculer entre Web Speech et Gemini IA"
                aria-checked={speechEngine === 'gemini'}
                checked={speechEngine === 'gemini'}
                onChange={(e) => setSpeechEngine(e.target.checked ? 'gemini' : 'webspeech')}
                className="sr-only peer"
              />
              {/* Piste de bascule */}
              <div className="w-9 h-5 bg-[#E6E0D6] rounded-full peer peer-checked:bg-[#E09228] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1E2958] transition-colors relative" />
              {/* Curseur */}
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-4 shadow-xs" />
            </label>
          </div>

          {/* Côté droit : Gemini IA (coché par défaut) */}
          <button
            type="button"
            onClick={() => setSpeechEngine('gemini')}
            className={`flex-1 text-left py-1 px-1.5 rounded-lg transition-all cursor-pointer ${
              speechEngine === 'gemini'
                ? 'text-[#181826] font-bold'
                : 'text-[#656575] hover:text-[#181826] opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold leading-tight">Gemini IA</span>
              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-[#E09228] text-white">
                Recommandé
              </span>
            </div>
            <p className="text-[10px] text-[#656575] leading-tight mt-0.5">
              transcription plus lente, mais plus efficace
            </p>
          </button>
        </div>

        {/* Optionnel : repliable pour saisie au clavier */}
        <div className="mt-1.5 text-center">
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-[11px] text-[#656575] hover:text-[#1E2958] underline underline-offset-2 transition-colors cursor-pointer"
          >
            {showTextInput ? 'Masquer la saisie au clavier' : 'Ou saisir au clavier si vous ne pouvez pas parler'}
          </button>
          {showTextInput && (
            <form onSubmit={handleTextSubmit} className="mt-2 flex gap-2">
              <input
                id="search-input"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ex: Un roman d'amour béninois…"
                className="flex-1 min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm bg-white border border-[#E6E0D6] rounded-xl text-[#181826] placeholder-[#656575] focus:border-[#1E2958] focus:ring-1 focus:ring-[#1E2958]"
              />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-1.5 bg-white hover:bg-[#E9EDF9] text-[#1E2958] border border-[#1E2958] text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Trouver
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 4 Exemples cliquables */}
      <div className="pt-3 border-t border-[#E6E0D6]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#656575] mb-2.5">
          Exemples de demandes orales à tester :
        </h3>
        <div className="flex flex-col gap-2">
          {EXAMPLE_QUERIES.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="w-full min-h-[42px] text-left text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-transparent hover:bg-[#E9EDF9]/50 active:bg-[#E9EDF9] border border-[#E6E0D6] hover:border-[#1E2958]/30 text-[#181826] font-medium transition-all flex items-center justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2958]/30"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <svg
                  className="w-4 h-4 text-[#E09228] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="line-clamp-1 italic text-[#181826]">« {example} »</span>
              </div>
              <span className="text-[#1E2958] text-xs font-bold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sélection découverte du catalogue */}
      <div className="mt-6 pt-5 border-t border-[#E6E0D6] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#656575]">
            Ou découvrez une sélection du catalogue
          </h2>
          <button
            type="button"
            onClick={() => onSearch('')}
            className="text-xs text-[#1E2958] hover:underline font-semibold"
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
              className="w-full min-h-[48px] p-2.5 rounded-xl bg-white hover:bg-[#E9EDF9]/40 border border-[#E6E0D6] text-left transition-all flex items-center gap-3 shadow-sm group"
            >
              <BookCover book={book} size="sm" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2958] bg-[#E9EDF9] px-1.5 py-0.5 rounded">
                    {book.genre}
                  </span>
                  <span className="text-[11px] text-[#656575] truncate">{book.pays}</span>
                </div>
                <p className="font-bold text-xs text-[#181826] truncate mt-0.5 group-hover:text-[#1E2958]">
                  {book.titre}
                </p>
                <p className="text-[11px] text-[#656575] truncate">
                  {book.auteur} · {book.prixFcfa.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <span className="text-[#1E2958] text-sm font-bold group-hover:translate-x-1 transition-transform pr-1" aria-hidden="true">
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

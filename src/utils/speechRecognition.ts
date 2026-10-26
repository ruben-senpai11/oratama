/**
 * Gestionnaire SpeechRecognition compatible Webkit et standard (TypeScript strict, aucun 'any')
 * Préchauffe le micro via getUserMedia, gère la résilience aux silences et propose
 * un mode diagnostic complet (navigateur, permissions, codes d'erreurs réels).
 * 
 * N'ENREGISTRE RIEN ET N'ENVOIE RIEN (100% mémoire locale client).
 */

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (
    errorType: 'no-speech' | 'not-allowed' | 'audio-capture' | 'network' | 'service-not-allowed' | 'language-not-supported' | 'unsupported' | 'other',
    message: string,
    rawCode?: string
  ) => void;
  onEnd?: () => void;
}

export interface SpeechRecognitionAlternativeItem {
  transcript: string;
  confidence?: number;
}

export interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeItem;
}

export interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

export interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognitionInstance;
}

export interface IWindowWithSpeech extends Window {
  SpeechRecognition?: ISpeechRecognitionConstructor;
  webkitSpeechRecognition?: ISpeechRecognitionConstructor;
}

/**
 * Dictionnaire complet des codes d'erreurs exacts de la reconnaissance vocale
 * avec un message clair et pédagogique pour l'utilisateur.
 */
export const SPEECH_ERROR_MESSAGES: Record<string, string> = {
  'no-speech': 'Aucun son ou parole détecté. Parlez plus près du micro ou vérifiez son niveau d’entrée.',
  'not-allowed': 'Accès au microphone refusé par l’utilisateur ou le système d’exploitation.',
  'audio-capture': 'Impossible de capturer l’audio : aucun microphone physique détecté ou le matériel est occupé.',
  'network': 'Erreur réseau : la reconnaissance vocale nécessite une connexion active aux services vocaux du navigateur.',
  'service-not-allowed': 'Service de reconnaissance vocale bloqué par défaut par ce navigateur (fréquent sur Brave ou en mode vie privée).',
  'language-not-supported': 'La langue demandée (français - fr-FR) n’est pas prise en charge par ce moteur vocal.',
  'aborted': 'Reconnaissance vocale interrompue par l’utilisateur ou le système.',
  'bad-grammar': 'Erreur de syntaxe grammaticale dans la configuration vocale.',
};

/**
 * Événement de diagnostic en mémoire vive
 */
export interface DiagnosticEvent {
  id: string;
  timestamp: number;
  type: 'start' | 'result' | 'error' | 'end' | 'mic-permission';
  code?: string;
  message: string;
  details?: unknown;
}

type DiagnosticListener = (event: DiagnosticEvent) => void;
const diagnosticListeners: Set<DiagnosticListener> = new Set();

export function subscribeDiagnosticEvents(listener: DiagnosticListener): () => void {
  diagnosticListeners.add(listener);
  return () => diagnosticListeners.delete(listener);
}

export function dispatchDiagnosticEvent(event: Omit<DiagnosticEvent, 'id' | 'timestamp'>): void {
  const fullEvent: DiagnosticEvent = {
    ...event,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };
  diagnosticListeners.forEach((listener) => {
    try {
      listener(fullEvent);
    } catch {
      // Ignorer
    }
  });
}

/**
 * Détection précise du navigateur (notamment Brave et Chromium)
 */
export interface BrowserDetectionResult {
  name: string;
  isBrave: boolean;
  isChromium: boolean;
  details: string;
  userAgent: string;
}

export async function detectBrowser(): Promise<BrowserDetectionResult> {
  if (typeof window === 'undefined') {
    return { name: 'Serveur (SSR)', isBrave: false, isChromium: false, details: 'Non applicable', userAgent: '' };
  }

  const ua = navigator.userAgent;
  let isBrave = false;

  try {
    const navAny = navigator as unknown as { brave?: { isBrave?: () => Promise<boolean> } };
    if (typeof navAny.brave?.isBrave === 'function') {
      isBrave = await navAny.brave.isBrave();
    }
  } catch {
    isBrave = false;
  }

  let name = 'Navigateur standard';
  let details = '';

  if (isBrave) {
    name = 'Brave Browser';
    details = 'Chromium avec boucliers de confidentialité stricts (bloque souvent Google Speech par défaut)';
  } else if (/Edg\//i.test(ua)) {
    name = 'Microsoft Edge';
    details = 'Moteur Chromium';
  } else if (/SamsungBrowser\//i.test(ua)) {
    name = 'Samsung Internet';
    details = 'Moteur Chromium optimisé mobile';
  } else if (/Chrome\//i.test(ua)) {
    name = 'Google Chrome';
    details = 'Support natif optimal de SpeechRecognition (fr-FR)';
  } else if (/Firefox\//i.test(ua)) {
    name = 'Mozilla Firefox';
    details = 'SpeechRecognition désactivé par défaut dans Gecko (repli sur saisie textuelle)';
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    name = 'Apple Safari';
    details = 'Moteur WebKit';
  }

  const isChromium = /Chrome|Chromium|Edg|Brave/i.test(ua);

  return {
    name,
    isBrave,
    isChromium,
    details,
    userAgent: ua,
  };
}

/**
 * Vérification du statut de la permission microphone
 */
export async function getMicrophonePermissionStatus(): Promise<'accordée' | 'refusée' | 'en attente' | 'non vérifiable'> {
  try {
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (result.state === 'granted') return 'accordée';
      if (result.state === 'denied') return 'refusée';
      return 'en attente';
    }
  } catch {
    // API Permissions non implémentée (ex: Safari iOS)
  }
  return 'non vérifiable';
}

/**
 * Demande explicite de la permission microphone via getUserMedia
 * Idéal pour les navigateurs comme Brave qui bloquent la voix tant que la permission n'est pas forcée.
 */
export async function requestMicrophonePermission(): Promise<{ granted: boolean; error?: string; code?: string }> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    dispatchDiagnosticEvent({
      type: 'mic-permission',
      code: 'unsupported',
      message: 'API navigator.mediaDevices.getUserMedia indisponible dans ce navigateur.',
    });
    return { granted: false, error: 'API indisponible', code: 'unsupported' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Libération immédiate des pistes matérielles
    stream.getTracks().forEach((track) => track.stop());
    dispatchDiagnosticEvent({
      type: 'mic-permission',
      code: 'granted',
      message: 'Permission microphone matériel accordée avec succès.',
    });
    return { granted: true };
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string };
    const code = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError' ? 'not-allowed' : 'audio-capture';
    const message = SPEECH_ERROR_MESSAGES[code] || e.message || 'Accès refusé au microphone.';
    dispatchDiagnosticEvent({
      type: 'mic-permission',
      code,
      message: `Refus ou blocage du microphone : ${message}`,
      details: e.name,
    });
    return { granted: false, error: message, code };
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindowWithSpeech;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export class SpeechRecognitionService {
  private recognition: ISpeechRecognitionInstance | null = null;
  private isListening = false;
  private userRequestedStop = false;
  private hasReceivedSpeech = false;
  private accumulatedTranscript = '';
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null;
  private restartTimeout: ReturnType<typeof setTimeout> | null = null;

  private createInstance(callbacks: SpeechRecognitionCallbacks): ISpeechRecognitionInstance | null {
    const win = window as unknown as IWindowWithSpeech;
    const RecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecognitionClass) return null;

    const instance = new RecognitionClass();
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = 'fr-FR';
    instance.maxAlternatives = 1;

    instance.onstart = () => {
      this.isListening = true;
      dispatchDiagnosticEvent({
        type: 'start',
        message: 'Reconnaissance vocale lancée (langue: fr-FR).',
      });
      callbacks.onStart?.();
    };

    instance.onresult = (event: SpeechRecognitionEventLike) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (currentInterim || currentFinal) {
        this.hasReceivedSpeech = true;
      }

      if (currentFinal) {
        this.accumulatedTranscript = (this.accumulatedTranscript + ' ' + currentFinal).trim();
        dispatchDiagnosticEvent({
          type: 'result',
          message: `Transcription finale partielle : « ${this.accumulatedTranscript} »`,
        });
        callbacks.onFinalResult?.(this.accumulatedTranscript);
      } else if (currentInterim) {
        const combined = (this.accumulatedTranscript + ' ' + currentInterim).trim();
        callbacks.onInterimResult?.(combined);
      }
    };

    instance.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const error = event.error || 'other';

      // Le silence ou une interruption automatique par le navigateur ne doit pas couper la session
      if (error === 'no-speech' || (error === 'aborted' && !this.userRequestedStop)) {
        dispatchDiagnosticEvent({
          type: 'error',
          code: error,
          message: SPEECH_ERROR_MESSAGES[error] || error,
        });
        return;
      }

      this.isListening = false;
      this.clearAutoStopTimer();
      this.clearRestartTimeout();

      const message = SPEECH_ERROR_MESSAGES[error] || `Erreur SpeechRecognition : ${error}`;
      dispatchDiagnosticEvent({
        type: 'error',
        code: error,
        message,
      });

      if (error === 'service-not-allowed') {
        callbacks.onError?.('service-not-allowed', message, 'service-not-allowed');
      } else if (error === 'not-allowed') {
        callbacks.onError?.('not-allowed', message, 'not-allowed');
      } else if (error === 'audio-capture') {
        callbacks.onError?.('audio-capture', message, 'audio-capture');
      } else if (error === 'network') {
        callbacks.onError?.('network', message, 'network');
      } else if (error === 'language-not-supported') {
        callbacks.onError?.('language-not-supported', message, 'language-not-supported');
      } else {
        callbacks.onError?.('other', message, error);
      }
    };

    instance.onend = () => {
      // Tant que l'utilisateur n'a pas lui-même cliqué sur "Terminer",
      // le navigateur qui coupe sur un silence de 2s est automatiquement relancé.
      if (!this.userRequestedStop && this.isListening) {
        this.clearRestartTimeout();
        this.restartTimeout = setTimeout(() => {
          if (!this.userRequestedStop && this.isListening) {
            try {
              this.recognition?.start();
              dispatchDiagnosticEvent({
                type: 'start',
                message: 'Reconnaissance vocale maintenue active (redémarrage après pause de parole).',
              });
            } catch {
              try {
                this.recognition = this.createInstance(callbacks);
                this.recognition?.start();
              } catch {
                // ignore
              }
            }
          }
        }, 80);
        return;
      }

      // Arrêt volontaire demandé par l'utilisateur
      this.isListening = false;
      this.clearAutoStopTimer();
      this.clearRestartTimeout();

      dispatchDiagnosticEvent({
        type: 'end',
        message: 'Session SpeechRecognition terminée.',
      });

      if (this.accumulatedTranscript.trim()) {
        callbacks.onFinalResult?.(this.accumulatedTranscript.trim());
      } else if (!this.hasReceivedSpeech) {
        callbacks.onError?.(
          'no-speech',
          SPEECH_ERROR_MESSAGES['no-speech'],
          'no-speech'
        );
      }
      callbacks.onEnd?.();
    };

    return instance;
  }

  public async start(callbacks: SpeechRecognitionCallbacks): Promise<boolean> {
    this.userRequestedStop = false;
    this.hasReceivedSpeech = false;
    this.accumulatedTranscript = '';
    this.clearAutoStopTimer();
    this.clearRestartTimeout();

    if (!isSpeechRecognitionSupported()) {
      const msg = 'La reconnaissance vocale n’est pas supportée par votre navigateur. Utilisez le champ texte ci-dessous.';
      dispatchDiagnosticEvent({
        type: 'error',
        code: 'unsupported',
        message: msg,
      });
      callbacks.onError?.('unsupported', msg, 'unsupported');
      return false;
    }

    // 1. Vérifier la permission micro matériel sans couper les pistes actives
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName }).catch(() => null);
        if (status?.state === 'granted') {
          dispatchDiagnosticEvent({
            type: 'mic-permission',
            code: 'granted',
            message: 'Micro matériel prêt et autorisé.',
          });
        } else if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          dispatchDiagnosticEvent({
            type: 'mic-permission',
            code: 'granted',
            message: 'Micro matériel autorisé.',
          });
        }
      }
    } catch (err: unknown) {
      const e = err as { name?: string };
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        const msg = SPEECH_ERROR_MESSAGES['not-allowed'];
        dispatchDiagnosticEvent({
          type: 'error',
          code: 'not-allowed',
          message: msg,
        });
        callbacks.onError?.('not-allowed', msg, 'not-allowed');
        return false;
      }
    }

    // 2. Arrêter toute session précédente
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }

    // 3. Créer une nouvelle instance dédiée
    try {
      this.recognition = this.createInstance(callbacks);
      if (!this.recognition) return false;

      this.isListening = true;

      // Sécurité d'inactivité de 3 minutes (180s) pour éviter l'oubli
      this.autoStopTimer = setTimeout(() => {
        if (this.isListening) {
          this.stop();
        }
      }, 180000);

      this.recognition.start();
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      const msg = 'Impossible d’initialiser le moteur vocal. Utilisez le champ texte.';
      dispatchDiagnosticEvent({
        type: 'error',
        code: 'other',
        message: `${msg} (${e.message || 'erreur interne'})`,
      });
      callbacks.onError?.('other', msg, 'other');
      return false;
    }
  }

  public stop(): void {
    this.userRequestedStop = true;
    this.clearAutoStopTimer();
    this.clearRestartTimeout();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
  }

  public abort(): void {
    this.userRequestedStop = true;
    this.clearAutoStopTimer();
    this.clearRestartTimeout();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
  }

  private clearAutoStopTimer(): void {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
  }

  private clearRestartTimeout(): void {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
  }
}

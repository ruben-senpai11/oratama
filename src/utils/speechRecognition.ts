/**
 * Gestionnaire SpeechRecognition compatible Webkit et standard (TypeScript strict, aucun 'any')
 * Préchauffe le micro via getUserMedia et gère la résilience aux silences et déconnexions
 */

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (errorType: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | 'other', message: string) => void;
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

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindowWithSpeech;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export class SpeechRecognitionService {
  private recognition: ISpeechRecognitionInstance | null = null;
  private isListening = false;
  private hasReceivedSpeech = false;
  private accumulatedTranscript = '';
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null;

  public async start(callbacks: SpeechRecognitionCallbacks): Promise<boolean> {
    if (!isSpeechRecognitionSupported()) {
      callbacks.onError?.(
        'unsupported',
        'La reconnaissance vocale n’est pas supportée par votre navigateur. Utilisez le champ texte ci-dessous.'
      );
      return false;
    }

    // 1. Débloquer et tester le micro matériel via getUserMedia
    // Cela active la permission au niveau du système et résout les problèmes de micro inactif
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Libérer immédiatement le flux afin de laisser le moteur SpeechRecognition le capturer
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: unknown) {
      const e = err as { name?: string };
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        callbacks.onError?.(
          'not-allowed',
          'Accès au micro refusé. Activez le micro dans les paramètres du navigateur ou tapez votre recherche.'
        );
        return false;
      }
    }

    // 2. Arrêter toute session précédente
    this.stop();

    const win = window as unknown as IWindowWithSpeech;
    const RecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecognitionClass) return false;

    // 3. Créer une nouvelle instance dédiée pour éviter les conflits d'état de Chrome
    try {
      this.recognition = new RecognitionClass();
      // continuous = true permet d'écouter la phrase entière sans coupure prématurée après 1s de silence
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'fr-FR';
      this.recognition.maxAlternatives = 1;
      this.hasReceivedSpeech = false;
      this.accumulatedTranscript = '';

      // Sécurité : arrêt automatique après 12 secondes d'écoute
      this.clearAutoStopTimer();
      this.autoStopTimer = setTimeout(() => {
        if (this.isListening) {
          this.stop();
        }
      }, 12000);

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
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
          callbacks.onFinalResult?.(this.accumulatedTranscript);
        } else if (currentInterim) {
          const combined = (this.accumulatedTranscript + ' ' + currentInterim).trim();
          callbacks.onInterimResult?.(combined);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        const error = event.error;

        // Le simple silence (no-speech) ne doit pas détruire la session immédiatement
        if (error === 'no-speech') {
          return;
        }

        this.isListening = false;
        this.clearAutoStopTimer();

        if (error === 'not-allowed' || error === 'service-not-allowed') {
          callbacks.onError?.(
            'not-allowed',
            'Accès au micro refusé. Activez le micro dans les paramètres du navigateur ou tapez votre recherche.'
          );
        } else if (error === 'network') {
          callbacks.onError?.(
            'network',
            'Connexion réseau instable pour la reconnaissance vocale. Utilisez le champ texte ci-dessous.'
          );
        } else {
          callbacks.onError?.(
            'other',
            'Reconnaissance interrompue : réessayez ou écrivez votre demande.'
          );
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.clearAutoStopTimer();

        if (this.accumulatedTranscript.trim()) {
          callbacks.onFinalResult?.(this.accumulatedTranscript.trim());
        } else if (!this.hasReceivedSpeech) {
          callbacks.onError?.(
            'no-speech',
            'Aucune voix détectée : réessayez en parlant clairement près du micro ou écrivez.'
          );
        }
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Erreur start recognition:', err);
      callbacks.onError?.('other', 'Impossible de démarrer le micro. Utilisez le champ texte.');
      return false;
    }
  }

  public stop(): void {
    this.clearAutoStopTimer();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
  }

  public abort(): void {
    this.clearAutoStopTimer();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {
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
}

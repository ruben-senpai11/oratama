/**
 * Gestionnaire SpeechRecognition compatible Webkit et standard (TypeScript strict, aucun 'any')
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

  constructor() {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindowWithSpeech;
    const RecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (RecognitionClass) {
      this.recognition = new RecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'fr-FR';
      this.recognition.maxAlternatives = 1;
    }
  }

  public start(callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.recognition) {
      callbacks.onError?.(
        'unsupported',
        'La reconnaissance vocale n’est pas supportée par votre navigateur. Utilisez le champ texte ci-dessous.'
      );
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    this.hasReceivedSpeech = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim || final) {
        this.hasReceivedSpeech = true;
      }

      if (interim) {
        callbacks.onInterimResult?.(interim);
      }

      if (final) {
        callbacks.onFinalResult?.(final.trim());
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const error = event.error;
      this.isListening = false;

      if (error === 'not-allowed' || error === 'service-not-allowed') {
        callbacks.onError?.(
          'not-allowed',
          'Accès au micro refusé. Activez le micro dans les paramètres du navigateur ou tapez votre recherche.'
        );
      } else if (error === 'no-speech') {
        callbacks.onError?.(
          'no-speech',
          'Aucune voix détectée : réessayez en parlant plus près du micro ou écrivez.'
        );
      } else if (error === 'network') {
        callbacks.onError?.(
          'network',
          'Connexion réseau instable pour la reconnaissance vocale. Utilisez le champ texte ci-dessous.'
        );
      } else {
        callbacks.onError?.(
          'other',
          'Je n’ai pas compris : réessayez ou écrivez votre demande.'
        );
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (!this.hasReceivedSpeech) {
        callbacks.onError?.(
          'no-speech',
          'Aucune voix détectée : réessayez en parlant plus près du micro ou écrivez.'
        );
      }
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Erreur start recognition:', err);
      callbacks.onError?.('other', 'Impossible de démarrer le micro. Utilisez le champ texte.');
      return false;
    }
  }

  public stop(): void {
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
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
  }
}

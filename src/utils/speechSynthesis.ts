/**
 * Découpe un texte en phrases complètes pour une lecture fluide et le surlignage mot à mot / phrase par phrase
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  // Découpe sur ponctuation forte suivie d'un espace ou de fin de chaîne
  const rawSentences = text
    .replace(/([.?!…])\s+/g, '$1|__SPLIT__|')
    .split('|__SPLIT__|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return rawSentences.length > 0 ? rawSentences : [text];
}

/**
 * Récupère la meilleure voix française disponible dans le navigateur
 */
export function getFrenchVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve(null);
      return;
    }

    const synth = window.speechSynthesis;

    const findVoice = (): SpeechSynthesisVoice | null => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return null;

      // 1. Chercher voix française naturelle ou locale (fr-FR, fr-BE, fr-CA, fr)
      const frVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('fr'));
      if (frVoices.length === 0) return null;

      // Privilégier une voix par défaut ou locale
      const preferred = frVoices.find((v) => v.lang === 'fr-FR' && v.localService) ||
                        frVoices.find((v) => v.lang === 'fr-FR') ||
                        frVoices.find((v) => v.default) ||
                        frVoices[0];
      return preferred;
    };

    const immediate = findVoice();
    if (immediate) {
      resolve(immediate);
      return;
    }

    // Attendre l'événement voiceschanged
    const onVoicesChanged = () => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(findVoice());
    };

    synth.addEventListener('voiceschanged', onVoicesChanged);

    // Timeout de sécurité au cas où l'événement n'est jamais émis
    setTimeout(() => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(findVoice());
    }, 1000);
  });
}

export interface SpeechPlayerCallbacks {
  onSentenceChange?: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
  onFinished?: () => void;
  onError?: (message: string) => void;
}

export class SentenceSpeechPlayer {
  private sentences: string[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private isPaused = false;
  private rate = 1.0;
  private voice: SpeechSynthesisVoice | null = null;
  private callbacks: SpeechPlayerCallbacks = {};
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(callbacks: SpeechPlayerCallbacks = {}) {
    this.callbacks = callbacks;
    this.initVoice();
  }

  private async initVoice() {
    this.voice = await getFrenchVoice();
  }

  public setSentences(sentences: string[]): void {
    this.stop();
    this.sentences = sentences;
    this.currentIndex = 0;
  }

  public setRate(newRate: number): void {
    this.rate = newRate;
    if (this.isPlaying && !this.isPaused) {
      // Rejouer la phrase courante avec le nouveau débit
      this.playSentence(this.currentIndex);
    }
  }

  public async play(): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.callbacks.onError?.('La synthèse vocale n’est pas disponible sur votre navigateur.');
      return;
    }

    if (!this.sentences.length) return;

    if (this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.callbacks.onPlayStateChange?.(true, false);
      return;
    }

    if (!this.voice) {
      this.voice = await getFrenchVoice();
    }

    if (!this.voice) {
      this.callbacks.onError?.(
        'Aucune voix française n’a été trouvée sur cet appareil. Vérifiez les paramètres de synthèse vocale de votre système.'
      );
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.callbacks.onPlayStateChange?.(true, false);
    this.playSentence(this.currentIndex);
  }

  private playSentence(index: number): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (index >= this.sentences.length) {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentIndex = 0;
      this.callbacks.onPlayStateChange?.(false, false);
      this.callbacks.onFinished?.();
      return;
    }

    this.currentIndex = index;
    this.callbacks.onSentenceChange?.(index);

    const utterance = new SpeechSynthesisUtterance(this.sentences[index]);
    utterance.lang = 'fr-FR';
    utterance.rate = this.rate;
    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.playSentence(this.currentIndex + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        this.callbacks.onError?.('Erreur lors de la lecture audio.');
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pause(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    this.isPaused = true;
    this.callbacks.onPlayStateChange?.(true, true);
  }

  public stop(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    window.speechSynthesis.cancel();
    this.callbacks.onPlayStateChange?.(false, false);
  }

  public nextSentence(): void {
    if (this.currentIndex < this.sentences.length - 1) {
      this.playSentence(this.currentIndex + 1);
    }
  }

  public previousSentence(): void {
    if (this.currentIndex > 0) {
      this.playSentence(this.currentIndex - 1);
    }
  }

  public jumpToSentence(index: number): void {
    if (index >= 0 && index < this.sentences.length) {
      this.playSentence(index);
    }
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }
}

/**
 * Service d'intégration vocale et multimodale pour OraTama : Bibliothèque Africaine Orale.
 * 
 * Enregistrement audio continu fluide via MediaRecorder sans limite artificielle
 * de durée (l'utilisateur parle à son rythme, décrit sa recherche, puis termine),
 * transmission sécurisée au backend OraTama (`POST /api/voice-search`),
 * transcription fidèle des accents et toponymes africains, et extraction
 * sémantique structurée des critères de recherche de livres.
 * 
 * 🔒 SÉCURITÉ : La clé API Google Gemini est conservée exclusivement côté serveur
 * dans l'environnement d'exécution (Vite dev server ou fonction serverless).
 * Aucune clé ni secret n'est jamais exposé dans le navigateur du lecteur.
 */

export interface GeminiSearchExtraction {
  transcript: string;
  searchTerms: string;
  genre: 'roman' | 'conte' | 'poésie' | 'essai' | 'théâtre' | 'jeunesse' | null;
  longueur: 'court' | 'moyen' | 'long' | null;
  pays: string | null;
  themes: string[];
  maxPrixFcfa: number | null;
}

/**
 * Vérifie si le backend de reconnaissance vocale intelligente est disponible
 */
export async function checkVoiceBackendStatus(): Promise<{ available: boolean; model?: string }> {
  try {
    const res = await fetch('/api/voice-status');
    if (!res.ok) return { available: false };
    const data = await res.json();
    return { available: Boolean(data.available), model: data.model };
  } catch {
    return { available: false };
  }
}

/**
 * Détermine le type MIME audio optimal supporté par le navigateur
 */
export function getOptimalAudioMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm';
}

/**
 * Convertit un Blob audio en chaîne Base64 (compatible navigateur et test Node.js)
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Fallback pour Node.js / tests Vitest
  const buffer = await blob.arrayBuffer();
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Envoie l'enregistrement audio au backend sécurisé (/api/voice-search)
 * pour transcription et extraction sémantique des critères de recherche
 */
export async function processAudioWithBackend(
  audioBlob: Blob
): Promise<GeminiSearchExtraction> {
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/webm';

  const response = await fetch('/api/voice-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioBase64: base64Audio,
      mimeType,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errorMsg = errorJson?.error || `Erreur serveur (${response.status})`;
    throw new Error(errorMsg);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Aucune transcription reçue du serveur.');
  }

  return {
    transcript: result.data.transcript || '',
    searchTerms: result.data.searchTerms || result.data.transcript || '',
    genre: result.data.genre || null,
    longueur: result.data.longueur || null,
    pays: result.data.pays || null,
    themes: Array.isArray(result.data.themes) ? result.data.themes : [],
    maxPrixFcfa: typeof result.data.maxPrixFcfa === 'number' ? result.data.maxPrixFcfa : null,
  };
}

// Alias pour compatibilité
export const processAudioWithGemini = processAudioWithBackend;

/**
 * Enregistreur audio continu sans limite artificielle de temps
 */
export class FreeAudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private safetyTimeout: ReturnType<typeof setTimeout> | null = null;

  public isRecording = false;

  public async start(onTick?: (secondsElapsed: number) => void): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = getOptimalAudioMimeType();
      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // morceaux de 250ms pour une capture fluide
      this.isRecording = true;

      // Timer pour mettre à jour l'affichage en direct de la durée
      if (onTick) {
        onTick(0);
        this.durationInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          onTick(elapsed);
        }, 1000);
      }

      // Timeout de sécurité raisonnable à 3 minutes (180s) uniquement pour éviter l'oubli
      this.safetyTimeout = setTimeout(() => {
        if (this.isRecording) {
          this.stop().catch(() => {});
        }
      }, 180000);

      return true;
    } catch (err) {
      console.error('Erreur lors du démarrage du MediaRecorder:', err);
      this.cleanup();
      return false;
    }
  }

  public async stop(): Promise<Blob | null> {
    if (!this.mediaRecorder || !this.isRecording) {
      this.cleanup();
      return null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.cleanup();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const finalBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(finalBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch {
        this.cleanup();
        resolve(null);
      }
    });
  }

  public cancel(): void {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.isRecording = false;
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    if (this.safetyTimeout) {
      clearTimeout(this.safetyTimeout);
      this.safetyTimeout = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.audioChunks = [];
  }
}

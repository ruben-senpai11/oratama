/**
 * Service d'intégration vocale et multimodale Gemini 2.0 Flash / Pro (Google AI)
 * pour OraTama : Bibliothèque Africaine Orale.
 * 
 * Permet l'enregistrement audio fluide via MediaRecorder sans limite artificielle
 * de durée (l'utilisateur parle librement, décrit sa recherche, puis termine),
 * la transcription fidèle des accents et toponymes africains, et l'extraction
 * sémantique structurée des critères de recherche de livres.
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

const STORAGE_KEY = 'oratama_gemini_api_key';

// Mémoire vive de secours pour les environnements de test / SSR
const memoryStorage: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore
  }
  return memoryStorage[key] || null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Ignore
  }
  memoryStorage[key] = value;
}

function removeStorageItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // Ignore
  }
  delete memoryStorage[key];
}

/**
 * Récupère la clé API Gemini configurée :
 * 1. Priorité à la clé saisie par l'utilisateur dans localStorage
 * 2. Repli sur la variable d'environnement Vite VITE_GEMINI_API_KEY si disponible
 */
export function getGeminiApiKey(): string | null {
  const localKey = getStorageItem(STORAGE_KEY);
  if (localKey && localKey.trim().length > 10) {
    return localKey.trim();
  }

  // Repli sur l'environnement Vite (.env.local)
  try {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
      return envKey.trim();
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Enregistre la clé API Gemini dans localStorage
 */
export function setGeminiApiKey(apiKey: string): void {
  setStorageItem(STORAGE_KEY, apiKey.trim());
}

/**
 * Supprime la clé API Gemini de localStorage
 */
export function clearGeminiApiKey(): void {
  removeStorageItem(STORAGE_KEY);
}

/**
 * Indique si une clé Gemini est configurée
 */
export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
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
    'audio/wav'
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
 * Teste la validité d'une clé API Gemini 2.0 Flash
 */
export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return { success: false, message: 'La clé API ne peut pas être vide.' };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${cleanKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Réponds uniquement avec le mot : "OK"' }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 10
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errMsg = errorData?.error?.message || `Erreur HTTP ${response.status}`;
      return {
        success: false,
        message: `Échec de connexion : ${errMsg}. Vérifiez votre clé sur https://aistudio.google.com/app/apikey`
      };
    }

    return { success: true, message: 'Clé API Gemini validée avec succès !' };
  } catch (error) {
    return {
      success: false,
      message: `Erreur réseau lors du test de la clé : ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Envoie l'enregistrement audio à Gemini pour transcription et extraction sémantique
 */
export async function processAudioWithGemini(
  audioBlob: Blob,
  apiKey: string,
  model = 'gemini-flash-latest'
): Promise<GeminiSearchExtraction> {
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/webm';

  const prompt = `Tu es l'assistant vocal intelligent d'OraTama, la bibliothèque africaine orale.
Écoute attentivement cet enregistrement audio en français (qui peut comporter des accents ouest-africains, des noms de villes ou pays d'Afrique comme Cotonou, Porto-Novo, Ganvié, Abidjan, Dakar, Lomé, Bamako, etc., des titres de livres, des genres littéraires ou des termes en langues locales comme le fon, yoruba, wolof).

Mission :
1. Transcris fidèlement la totalité des propos de l'utilisateur.
2. Analyse sa demande pour en extraire les critères de recherche littéraire dans la bibliothèque OraTama.

Réponds STRICTEMENT avec un objet JSON valide respectant cette structure :
{
  "transcript": "Transcription exacte et fidèle de ce que dit l'utilisateur",
  "searchTerms": "mots-clés principaux pour rechercher dans les titres, résumés et auteurs",
  "genre": "roman" ou "conte" ou "poésie" ou "essai" ou "théâtre" ou "jeunesse" ou null,
  "longueur": "court" ou "moyen" ou "long" ou null,
  "pays": "Bénin" ou "Sénégal" ou "Côte d’Ivoire" ou "Cameroun" ou "Togo" ou "Mali" ou "Guinée" ou "Congo" ou "Burkina Faso" ou "Gabon" ou null,
  "themes": ["amour", "nature", "mémoire", "ville", "famille", "histoire", "société", "philosophie", ...],
  "maxPrixFcfa": nombre ou null
}

IMPORTANT : Ne renvoie que le JSON pur, sans balises de code markdown ni texte avant ou après.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType.split(';')[0], // ex: "audio/webm"
                data: base64Audio
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errorMsg = errorJson?.error?.message || `Erreur serveur Gemini (${response.status})`;
    throw new Error(`Erreur Gemini : ${errorMsg}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini n’a renvoyé aucune transcription pour cet audio.');
  }

  try {
    // Nettoyer d'éventuels délimiteurs markdown
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      transcript: parsed.transcript || '',
      searchTerms: parsed.searchTerms || parsed.transcript || '',
      genre: parsed.genre || null,
      longueur: parsed.longueur || null,
      pays: parsed.pays || null,
      themes: Array.isArray(parsed.themes) ? parsed.themes : [],
      maxPrixFcfa: typeof parsed.maxPrixFcfa === 'number' ? parsed.maxPrixFcfa : null,
    };
  } catch {
    // Si le parsing JSON échoue, utiliser le texte brut comme transcription
    return {
      transcript: rawText.trim(),
      searchTerms: rawText.trim(),
      genre: null,
      longueur: null,
      pays: null,
      themes: [],
      maxPrixFcfa: null,
    };
  }
}

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
        }
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

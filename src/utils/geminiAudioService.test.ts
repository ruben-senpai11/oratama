import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getOptimalAudioMimeType,
  processAudioWithBackend,
  checkVoiceBackendStatus,
  blobToBase64,
} from './geminiAudioService';

describe('geminiAudioService - Utilitaires audio et statut backend', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renvoie un type MIME audio par défaut', () => {
    const mime = getOptimalAudioMimeType();
    expect(typeof mime).toBe('string');
    expect(mime.length).toBeGreaterThan(0);
  });

  it('convertit correctement un Blob en Base64', async () => {
    const fakeBlob = new Blob(['hello world audio data'], { type: 'audio/plain' });
    const base64 = await blobToBase64(fakeBlob);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);
  });

  it('détecte la disponibilité du backend vocal via /api/voice-status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ available: true, model: 'gemini-flash-latest' }),
    } as Response);

    const status = await checkVoiceBackendStatus();
    expect(status.available).toBe(true);
    expect(status.model).toBe('gemini-flash-latest');
  });

  it('gère l’indisponibilité du backend sans lever d’exception bloquante', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const status = await checkVoiceBackendStatus();
    expect(status.available).toBe(false);
  });
});

describe('geminiAudioService - Traitement multimodal via backend sécurisé', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('transmet les données audio au backend et parse la réponse structurée', async () => {
    const mockBackendResponse = {
      success: true,
      data: {
        transcript: 'Je cherche un conte traditionnel béninois pour enfants',
        searchTerms: 'conte traditionnel béninois enfants',
        genre: 'conte',
        longueur: 'court',
        pays: 'Bénin',
        themes: ['conte', 'enfance'],
        maxPrixFcfa: 2000,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBackendResponse,
    } as Response);

    const fakeBlob = new Blob(['fake audio content'], { type: 'audio/webm' });
    const result = await processAudioWithBackend(fakeBlob);

    expect(result.transcript).toBe('Je cherche un conte traditionnel béninois pour enfants');
    expect(result.genre).toBe('conte');
    expect(result.pays).toBe('Bénin');
    expect(result.longueur).toBe('court');
    expect(result.maxPrixFcfa).toBe(2000);
    expect(result.themes).toContain('conte');
  });

  it('lève une erreur explicite si le serveur renvoie une erreur HTTP', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: 'Service vocal momentanément indisponible.',
      }),
    } as Response);

    const fakeBlob = new Blob(['fake audio'], { type: 'audio/webm' });
    await expect(processAudioWithBackend(fakeBlob)).rejects.toThrow(
      'Service vocal momentanément indisponible.'
    );
  });

  it('lève une erreur si la réponse serveur indique un échec', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Audio inaudible',
      }),
    } as Response);

    const fakeBlob = new Blob(['fake audio'], { type: 'audio/webm' });
    await expect(processAudioWithBackend(fakeBlob)).rejects.toThrow('Audio inaudible');
  });
});

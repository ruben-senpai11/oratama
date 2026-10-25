import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  clearGeminiApiKey,
  isGeminiConfigured,
  getOptimalAudioMimeType,
  processAudioWithGemini,
} from './geminiAudioService';

describe('geminiAudioService - Gestion de la clé API', () => {
  beforeEach(() => {
    clearGeminiApiKey();
  });

  it('détecte correctement l’absence de clé par défaut', () => {
    expect(isGeminiConfigured()).toBe(false);
    expect(getGeminiApiKey()).toBeNull();
  });

  it('enregistre et récupère une clé API valide', () => {
    const fakeKey = 'AIzaSyFakeKeyForTest123456789';
    setGeminiApiKey(fakeKey);

    expect(isGeminiConfigured()).toBe(true);
    expect(getGeminiApiKey()).toBe(fakeKey);
  });

  it('supprime proprement la clé de configuration', () => {
    const fakeKey = 'AIzaSyFakeKeyForTest123456789';
    setGeminiApiKey(fakeKey);
    expect(isGeminiConfigured()).toBe(true);

    clearGeminiApiKey();
    expect(isGeminiConfigured()).toBe(false);
    expect(getGeminiApiKey()).toBeNull();
  });

  it('renvoie un type MIME audio par défaut', () => {
    const mime = getOptimalAudioMimeType();
    expect(typeof mime).toBe('string');
    expect(mime.length).toBeGreaterThan(0);
  });
});

describe('geminiAudioService - Traitement multimodal et extraction', () => {
  it('parse correctement la réponse JSON structurée de Gemini 2.0 Flash', async () => {
    const mockResponsePayload = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  transcript: 'Je cherche un conte traditionnel béninois pour enfants',
                  searchTerms: 'conte traditionnel béninois enfants',
                  genre: 'conte',
                  longueur: 'court',
                  pays: 'Bénin',
                  themes: ['conte', 'enfance'],
                  maxPrixFcfa: 2000,
                }),
              },
            ],
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponsePayload,
    } as Response);

    const fakeBlob = new Blob(['fake audio content'], { type: 'audio/webm' });
    const result = await processAudioWithGemini(fakeBlob, 'fake-api-key');

    expect(result.transcript).toBe('Je cherche un conte traditionnel béninois pour enfants');
    expect(result.genre).toBe('conte');
    expect(result.pays).toBe('Bénin');
    expect(result.longueur).toBe('court');
    expect(result.maxPrixFcfa).toBe(2000);
    expect(result.themes).toContain('conte');
  });

  it('nettoie les balises markdown ```json si Gemini en produit', async () => {
    const mockMarkdown = '```json\n{"transcript": "Un roman policier à Cotonou", "searchTerms": "roman policier Cotonou", "genre": "roman", "pays": "Bénin"}\n```';
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: mockMarkdown }] } }],
      }),
    } as Response);

    const fakeBlob = new Blob(['fake audio'], { type: 'audio/webm' });
    const result = await processAudioWithGemini(fakeBlob, 'fake-key');

    expect(result.transcript).toBe('Un roman policier à Cotonou');
    expect(result.genre).toBe('roman');
    expect(result.pays).toBe('Bénin');
  });

  it('lance une erreur explicite si Gemini retourne une erreur HTTP', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: 'API_KEY_INVALID' },
      }),
    } as Response);

    const fakeBlob = new Blob(['fake audio'], { type: 'audio/webm' });
    await expect(processAudioWithGemini(fakeBlob, 'bad-key')).rejects.toThrow('API_KEY_INVALID');
  });
});

import { describe, it, expect, vi } from 'vitest';
import {
  SPEECH_ERROR_MESSAGES,
  detectBrowser,
  subscribeDiagnosticEvents,
  dispatchDiagnosticEvent,
  DiagnosticEvent,
} from './speechRecognition';

describe('speechRecognition — Mode Diagnostic & Gestion des erreurs vocales', () => {
  it('1. contient tous les codes d’erreur requis avec des messages clairs en français', () => {
    const requiredCodes = [
      'no-speech',
      'not-allowed',
      'audio-capture',
      'network',
      'service-not-allowed',
      'language-not-supported',
    ];

    for (const code of requiredCodes) {
      expect(SPEECH_ERROR_MESSAGES[code]).toBeDefined();
      expect(typeof SPEECH_ERROR_MESSAGES[code]).toBe('string');
      expect(SPEECH_ERROR_MESSAGES[code].length).toBeGreaterThan(15);
    }
  });

  it('2. fournit un message spécifique pour le blocage par défaut de Brave (service-not-allowed)', () => {
    const msg = SPEECH_ERROR_MESSAGES['service-not-allowed'];
    expect(msg).toContain('Service de reconnaissance vocale');
    expect(msg.toLowerCase()).toContain('brave');
  });

  it('3. fournit un message clair pour no-speech, not-allowed, audio-capture, network et language-not-supported', () => {
    expect(SPEECH_ERROR_MESSAGES['no-speech']).toContain('Aucun son');
    expect(SPEECH_ERROR_MESSAGES['not-allowed']).toContain('Accès au microphone refusé');
    expect(SPEECH_ERROR_MESSAGES['audio-capture']).toContain('capture');
    expect(SPEECH_ERROR_MESSAGES['network']).toContain('réseau');
    expect(SPEECH_ERROR_MESSAGES['language-not-supported']).toContain('langue');
  });

  it('4. détecte le navigateur et les propriétés Chromium / Brave', async () => {
    const result = await detectBrowser();
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('isBrave');
    expect(result).toHaveProperty('isChromium');
    expect(result).toHaveProperty('userAgent');
  });

  it('5. notifie les écouteurs de diagnostic lors de dispatchDiagnosticEvent sans persistance externe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDiagnosticEvents(listener);

    dispatchDiagnosticEvent({
      type: 'error',
      code: 'service-not-allowed',
      message: 'Test diagnostic local',
    });

    expect(listener).toHaveBeenCalledTimes(1);
    const eventArg = listener.mock.calls[0][0] as DiagnosticEvent;
    expect(eventArg.type).toBe('error');
    expect(eventArg.code).toBe('service-not-allowed');
    expect(eventArg.message).toBe('Test diagnostic local');
    expect(eventArg.id).toBeDefined();
    expect(eventArg.timestamp).toBeGreaterThan(0);

    unsubscribe();
  });
});

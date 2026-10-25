import React, { useState, useEffect } from 'react';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  clearGeminiApiKey,
  testGeminiApiKey
} from '../utils/geminiAudioService';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
  onFallbackToBrowser?: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  onFallbackToBrowser,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getGeminiApiKey();
      setApiKeyInput(current || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setTestResult({
        success: false,
        message: 'Veuillez saisir votre clé API ou cliquer sur « Continuer avec le micro du navigateur ».',
      });
      return;
    }

    setGeminiApiKey(trimmed);
    setTestResult({
      success: true,
      message: 'Clé Gemini 2.0 Flash enregistrée avec succès !',
    });
    setTimeout(() => {
      onKeySaved?.();
      onClose();
    }, 600);
  };

  const handleTestKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setTestResult({
        success: false,
        message: 'Veuillez coller votre clé API avant de tester.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testGeminiApiKey(trimmed);
    setIsTesting(false);
    setTestResult(result);
  };

  const handleClear = () => {
    clearGeminiApiKey();
    setApiKeyInput('');
    setTestResult({
      success: true,
      message: 'Clé API supprimée. L’application utilisera le micro du navigateur par défaut.',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#FBF8F3] rounded-2xl shadow-2xl border-2 border-[#1F2A5C] overflow-hidden text-[#1B1B2A] max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="bg-[#1F2A5C] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✨</span>
            <h2 id="gemini-modal-title" className="text-lg font-bold tracking-tight">
              Reconnaissance Vocale Gemini 2.0 Flash
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corps défilable */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed">
          {/* Explication UX sans limite de temps */}
          <div className="bg-[#FDF3E3] border border-[#E9A23B]/40 p-3.5 rounded-xl">
            <p className="font-semibold text-[#1B1B2A] flex items-center gap-2">
              <span className="text-base">🎙️</span>
              <span>Parlez librement, sans aucune limite de temps</span>
            </p>
            <p className="text-xs text-[#555] mt-1">
              Fini les coupures après 3 ou 5 secondes ! Avec Gemini 2.0 Flash, vous pouvez décrire en détail votre recherche littéraire, vos envies et vos préférences. L’intelligence artificielle écoute, retranscrit fidèlement et extrait automatiquement les critères.
            </p>
          </div>

          {/* Guide pas-à-pas pour obtenir la clé */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E8E3DA] space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider text-[#1F2A5C]">
              Où trouver votre clé API Google AI gratuite ?
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#333]">
              <li>
                Rendez-vous sur{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#1F2A5C] underline hover:text-[#E9A23B] inline-flex items-center gap-1"
                >
                  Google AI Studio (aistudio.google.com)
                  <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>Connectez-vous avec votre compte Google standard.</li>
              <li>
                Cliquez sur le bouton bleu <span className="font-bold">« Create API key »</span>.
              </li>
              <li>Copiez la clé générée (elle commence par <code className="bg-[#F2EFE9] px-1 py-0.5 rounded text-[11px]">AIzaSy...</code>).</li>
              <li>Collez-la directement dans le champ ci-dessous.</li>
            </ol>
            <p className="text-[11px] text-[#6B6B7A] italic">
              ℹ️ L'accès à Gemini 2.0 Flash sur Google AI Studio est gratuit dans la limite des quotas standards. Votre clé reste stockée localement sur votre appareil.
            </p>
          </div>

          {/* Champ de saisie de la clé */}
          <div>
            <label htmlFor="gemini-key-input" className="block text-xs font-bold text-[#1B1B2A] mb-1">
              Clé API Gemini (Google AI) :
            </label>
            <div className="relative">
              <input
                id="gemini-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Exemple : AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-[#E8E3DA] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A5C] text-[#1B1B2A] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? 'Masquer la clé' : 'Afficher la clé'}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[#6B6B7A] hover:text-[#1B1B2A] rounded font-semibold"
              >
                {showKey ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {/* Retour de test / statut */}
          {testResult && (
            <div
              role="status"
              className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 ${
                testResult.success
                  ? 'bg-[#EBF7EE] text-[#137333] border-[#137333]/30'
                  : 'bg-[#FDF0ED] text-[#B3261E] border-[#B3261E]/30'
              }`}
            >
              <span className="text-base">{testResult.success ? '✅' : '⚠️'}</span>
              <p className="flex-1 leading-snug">{testResult.message}</p>
            </div>
          )}

          {/* Actions de test et suppression */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !apiKeyInput.trim()}
              className="text-xs font-bold text-[#1F2A5C] hover:text-[#E9A23B] disabled:opacity-40 disabled:pointer-events-none underline flex items-center gap-1"
            >
              {isTesting ? (
                <>
                  <span className="w-3 h-3 border-2 border-[#1F2A5C] border-t-transparent rounded-full animate-spin" />
                  <span>Test de connexion en cours…</span>
                </>
              ) : (
                'Tester la clé en direct'
              )}
            </button>

            {apiKeyInput.trim() && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-[#B3261E] hover:underline font-semibold"
              >
                Effacer la clé
              </button>
            )}
          </div>
        </div>

        {/* Pied de dialogue / Boutons principaux */}
        <div className="bg-[#F2EFE9] px-5 py-3.5 border-t border-[#E8E3DA] flex flex-col sm:flex-row gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              onFallbackToBrowser?.();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#D5CFBF] bg-white text-[#1B1B2A] hover:bg-[#E8E3DA] transition-colors"
          >
            Utiliser le micro standard du navigateur
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!apiKeyInput.trim()}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1F2A5C] text-white hover:bg-[#161E42] disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Enregistrer et Activer Gemini</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

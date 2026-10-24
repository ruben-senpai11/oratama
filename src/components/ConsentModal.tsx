import React from 'react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onAccept, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm bg-[#FBF8F3] rounded-2xl p-6 shadow-2xl border border-[#E8E3DA] text-[#1B1B2A] animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-[#E8ECFA] text-[#1F2A5C] flex items-center justify-center mb-4 mx-auto">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>

        <h2 id="consent-title" className="text-lg font-bold text-center text-[#1B1B2A] mb-2">
          Utilisation du microphone
        </h2>

        <div id="consent-desc" className="text-sm text-[#6B6B7A] space-y-3 leading-relaxed mb-6">
          <p>
            Pour comprendre votre demande à voix haute, votre navigateur utilise son service de reconnaissance vocale (pouvant traiter l’audio auprès de son fournisseur habituel).
          </p>
          <div className="p-3 bg-white rounded-lg border border-[#E8E3DA] text-xs font-medium text-[#1B1B2A]">
            🛡️ <strong className="font-semibold">Engagement OraTama :</strong> notre application n’enregistre aucun appel réseau externe, ne collecte aucune donnée et n’envoie aucune voix sur un serveur tiers.
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="w-full min-h-[44px] px-4 py-3 bg-[#1F2A5C] hover:bg-[#161E42] text-white font-semibold rounded-xl transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-[#1F2A5C] focus-visible:ring-offset-2"
          >
            Autoriser et continuer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-[44px] px-4 py-3 bg-transparent hover:bg-[#EFEAE1] text-[#6B6B7A] font-medium rounded-xl transition-colors border border-[#E8E3DA]"
          >
            Continuer avec le clavier
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'application est déjà exécutée en mode autonome (déjà installée)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Vérifier si l'utilisateur a déjà reporté l'invitation dans cette session
    const wasDismissed = sessionStorage.getItem('oratama_install_dismissed');
    if (wasDismissed) {
      return;
    }

    // Écouter l'événement standard d'installation du navigateur
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Déclencher l'affichage de la notification dès l'arrivée
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 600);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
        }
      } catch {
        setShowManualGuide(true);
      }
    } else {
      // Si l'API native n'est pas disponible (ex: iOS Safari ou navigateur sans support direct)
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('oratama_install_dismissed', 'true');
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-labelledby="install-title"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-2 border-[#1E2958] p-4 text-[#181826] animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start gap-3">
        {/* Miniature de l'icône de l'application */}
        <div className="w-12 h-12 rounded-xl bg-[#1E2958] flex-shrink-0 flex items-center justify-center text-[#FBF8F3] font-black text-sm tracking-wide shadow-sm border border-[#E09228]/40">
          OT
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h2 id="install-title" className="text-sm font-bold text-[#1E2958] leading-snug">
            Installer l'application OraTama
          </h2>
          <p className="text-xs text-[#656575] mt-1 leading-relaxed">
            Installez l’application sur votre appareil pour y accéder directement depuis votre écran d’accueil, rapidement et même hors connexion.
          </p>

          {showManualGuide && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-[#FDF4E7] border border-[#E09228] text-[11px] text-[#181826] leading-relaxed">
              <strong className="block text-[#1E2958] mb-0.5">Pour ajouter à l'écran d'accueil :</strong>
              Dans le menu de votre navigateur (ou l'icône Partager sur iPhone), choisissez <strong>« Ajouter à l'écran d'accueil »</strong> ou <strong>« Installer l'application »</strong>.
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              className="min-h-[44px] px-4 py-2 bg-[#1E2958] text-white text-xs font-bold rounded-xl hover:bg-[#141C3E] active:scale-95 transition-all shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#1E2958] focus:ring-offset-2"
            >
              <span>📲</span>
              <span>Installer l'application</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[44px] px-3 py-2 text-xs font-medium text-[#656575] hover:text-[#181826] hover:bg-black/5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#656575]"
            >
              Plus tard
            </button>
          </div>
        </div>

        {/* Bouton fermeture discrète en haut à droite */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer la proposition d'installation"
          className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center text-[#656575] hover:text-[#181826] rounded-full hover:bg-black/5 text-lg font-bold"
        >
          ×
        </button>
      </div>
    </aside>
  );
};

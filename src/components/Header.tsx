import React from 'react';
import { ViewScreen } from '../types';

interface HeaderProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, onBack }) => {
  const showBack = currentScreen.name !== 'home';

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (currentScreen.name === 'reader' && 'bookId' in currentScreen) {
      onNavigate({ name: 'book', bookId: currentScreen.bookId });
    } else if (currentScreen.name === 'book') {
      onNavigate({ name: 'home' });
    } else if (currentScreen.name === 'results') {
      onNavigate({ name: 'home' });
    } else {
      onNavigate({ name: 'home' });
    }
  };

  return (
    <header className="bg-[#FBF8F3] border-b border-[#E6E0D6] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Retour à l'écran précédent"
              className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-full text-[#181826] hover:bg-[#EFEAE1] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate({ name: 'home' })}
            className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#1E2958] rounded-lg py-1 px-1 -ml-1 text-left"
            aria-label="OraTama — Accueil"
          >
            {/* Icône du favicon */}
            <svg
              className="w-7 h-7 rounded-lg shrink-0 shadow-xs"
              viewBox="0 0 192 192"
              fill="none"
              aria-hidden="true"
            >
              <rect width="192" height="192" rx="36" fill="#1E2958" />
              <circle cx="96" cy="96" r="64" fill="none" stroke="#E09228" strokeWidth="5" opacity="0.4" />
              <path
                d="M72 116 C 64 104, 64 88, 72 76 M60 126 C 48 108, 48 84, 60 66"
                fill="none"
                stroke="#E09228"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M120 116 C 128 104, 128 88, 120 76 M132 126 C 144 108, 144 84, 132 66"
                fill="none"
                stroke="#E09228"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <text
                x="96"
                y="106"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="34"
                fontWeight="800"
                fill="#FBF8F3"
                textAnchor="middle"
                letterSpacing="1"
              >
                OT
              </text>
            </svg>

            {/* Logo typographique */}
            <span className="font-extrabold text-xl tracking-tight text-[#1E2958]">
              Ora<span className="text-[#181826]">Tama</span>
            </span>
          </button>
        </div>

        {/* À droite : Bibliothèque Vocale */}
        <div className="flex items-center">
          <span className="text-xs sm:text-sm font-bold text-[#1E2958] bg-[#E9EDF9] px-3 py-1 rounded-full border border-[#1E2958]/20 tracking-wide">
            Bibliothèque Vocale
          </span>
        </div>
      </div>
    </header>
  );
};

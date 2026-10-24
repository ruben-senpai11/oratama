import React from 'react';
import { ViewScreen } from '../types';

interface HeaderProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate }) => {
  const showBack = currentScreen.name !== 'home';

  const handleBack = () => {
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
    <header className="bg-[#FAF6F1] border-b border-[#E5DCD3] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Retour à l'écran précédent"
              className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-full text-[#1F1A1A] hover:bg-[#EFE8DE] transition-colors"
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
            className="flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#933B40] rounded-lg py-1 px-1 -ml-1 text-left"
            aria-label="OraTama accueil"
          >
            {/* Typographie système textuelle distincte de tout logo externe */}
            <span className="font-extrabold text-xl tracking-tight text-[#933B40]">
              Ora<span className="text-[#1F1A1A]">Tama</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#933B40] bg-[#F6EAEB] px-1.5 py-0.5 rounded-full border border-[#933B40]/20">
              Vocal
            </span>
          </button>
        </div>

        {/* Liens légers de navigation */}
        <nav aria-label="Navigation principale" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home' })}
            className={`min-h-[44px] px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center ${
              currentScreen.name === 'home'
                ? 'text-[#933B40] bg-[#F6EAEB]'
                : 'text-[#5C5454] hover:text-[#1F1A1A] hover:bg-[#EFE8DE]'
            }`}
          >
            Demander
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ name: 'author' })}
            className={`min-h-[44px] px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center ${
              currentScreen.name === 'author'
                ? 'text-[#933B40] bg-[#F6EAEB]'
                : 'text-[#5C5454] hover:text-[#1F1A1A] hover:bg-[#EFE8DE]'
            }`}
          >
            Auteur
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ name: 'about' })}
            className={`min-h-[44px] px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center ${
              currentScreen.name === 'about'
                ? 'text-[#933B40] bg-[#F6EAEB]'
                : 'text-[#5C5454] hover:text-[#1F1A1A] hover:bg-[#EFE8DE]'
            }`}
          >
            À propos
          </button>
        </nav>
      </div>
    </header>
  );
};

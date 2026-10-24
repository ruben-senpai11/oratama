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
    <header className="bg-[#FBF8F3] border-b border-[#E8E3DA] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Retour à l'écran précédent"
              className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-full text-[#1B1B2A] hover:bg-[#EFEAE1] transition-colors"
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
            className="flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#1F2A5C] rounded-lg py-1 px-1 -ml-1 text-left"
            aria-label="OraTama Vocal — Accueil"
          >
            {/* Typographie textuelle distincte */}
            <span className="font-extrabold text-xl tracking-tight text-[#1F2A5C]">
              Ora<span className="text-[#1B1B2A]">Tama</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1F2A5C] bg-[#E8ECFA] px-1.5 py-0.5 rounded-full border border-[#1F2A5C]/20">
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
                ? 'text-[#1F2A5C] bg-[#E8ECFA]'
                : 'text-[#6B6B7A] hover:text-[#1B1B2A] hover:bg-[#EFEAE1]'
            }`}
          >
            Demander
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ name: 'author' })}
            className={`min-h-[44px] px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center ${
              currentScreen.name === 'author'
                ? 'text-[#1F2A5C] bg-[#E8ECFA]'
                : 'text-[#6B6B7A] hover:text-[#1B1B2A] hover:bg-[#EFEAE1]'
            }`}
          >
            Auteur
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ name: 'about' })}
            className={`min-h-[44px] px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center ${
              currentScreen.name === 'about'
                ? 'text-[#1F2A5C] bg-[#E8ECFA]'
                : 'text-[#6B6B7A] hover:text-[#1B1B2A] hover:bg-[#EFEAE1]'
            }`}
          >
            À propos
          </button>
        </nav>
      </div>
    </header>
  );
};

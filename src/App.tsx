import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewScreen } from './types';
import { Header } from './components/Header';
import { InstallPrompt } from './components/InstallPrompt';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { parseQuery } from './utils/queryParser';

// Chargement paresseux des écrans (lazy loading) pour optimiser le bundle JS
const HomeScreen = lazy(() => import('./screens/HomeScreen').then((m) => ({ default: m.HomeScreen })));
const ResultsScreen = lazy(() => import('./screens/ResultsScreen').then((m) => ({ default: m.ResultsScreen })));
const BookDetailScreen = lazy(() => import('./screens/BookDetailScreen').then((m) => ({ default: m.BookDetailScreen })));
const ReaderScreen = lazy(() => import('./screens/ReaderScreen').then((m) => ({ default: m.ReaderScreen })));
const AuthorScreen = lazy(() => import('./screens/AuthorScreen').then((m) => ({ default: m.AuthorScreen })));
const AboutScreen = lazy(() => import('./screens/AboutScreen').then((m) => ({ default: m.AboutScreen })));

// Décodage du hash d'URL pour navigation directe
function parseHash(hash: string): ViewScreen {
  const clean = hash.replace(/^#\/?/, '');
  if (!clean || clean === 'home') {
    return { name: 'home' };
  }
  if (clean.startsWith('results')) {
    const queryPart = clean.includes('?') ? clean.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    const q = params.get('q') || '';
    return { name: 'results', query: q, parsed: parseQuery(q) };
  }
  if (clean.startsWith('book/')) {
    const bookId = clean.replace('book/', '');
    return { name: 'book', bookId };
  }
  if (clean.startsWith('reader/')) {
    const bookId = clean.replace('reader/', '');
    return { name: 'reader', bookId };
  }
  if (clean.startsWith('author')) {
    const parts = clean.split('/');
    const bookId = parts[1] || undefined;
    return { name: 'author', bookId };
  }
  if (clean === 'about') {
    return { name: 'about' };
  }
  return { name: 'home' };
}

// Encodage de l'écran en hash
function screenToHash(screen: ViewScreen): string {
  switch (screen.name) {
    case 'home':
      return '#home';
    case 'results':
      return `#results?q=${encodeURIComponent(screen.query)}`;
    case 'book':
      return `#book/${screen.bookId}`;
    case 'reader':
      return `#reader/${screen.bookId}`;
    case 'author':
      return screen.bookId ? `#author/${screen.bookId}` : '#author';
    case 'about':
      return '#about';
  }
}

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>(() => {
    if (typeof window !== 'undefined') {
      return parseHash(window.location.hash);
    }
    return { name: 'home' };
  });

  const [lastResultsScreen, setLastResultsScreen] = useState<Extract<ViewScreen, { name: 'results' }> | null>(() => {
    if (typeof window !== 'undefined') {
      const initial = parseHash(window.location.hash);
      if (initial.name === 'results') return initial;
    }
    return null;
  });

  const [isDebugMode, setIsDebugMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('debug=1') || window.location.hash.includes('debug=1');
    }
    return false;
  });

  // Synchronisation avec les changements d'URL du navigateur (bouton retour/suivant et ?debug=1)
  useEffect(() => {
    const handleUrlChange = () => {
      const parsed = parseHash(window.location.hash);
      setCurrentScreen(parsed);
      if (parsed.name === 'results') {
        setLastResultsScreen(parsed);
      }
      if (window.location.search.includes('debug=1') || window.location.hash.includes('debug=1')) {
        setIsDebugMode(true);
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const navigateTo = (screen: ViewScreen) => {
    if (screen.name === 'results') {
      setLastResultsScreen(screen);
    }
    setCurrentScreen(screen);
    const newHash = screenToHash(screen);
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentScreen.name === 'reader' && 'bookId' in currentScreen) {
      navigateTo({ name: 'book', bookId: currentScreen.bookId });
    } else if (currentScreen.name === 'book') {
      if (lastResultsScreen) {
        navigateTo(lastResultsScreen);
      } else {
        navigateTo({ name: 'home' });
      }
    } else {
      navigateTo({ name: 'home' });
    }
  };

  const handleSearch = (query: string, parsedOverride?: any) => {
    const parsed = parsedOverride || parseQuery(query);
    const resultsScreen: Extract<ViewScreen, { name: 'results' }> = {
      name: 'results',
      query,
      parsed,
    };
    setLastResultsScreen(resultsScreen);
    navigateTo(resultsScreen);
  };

  const handleCloseDebug = () => {
    setIsDebugMode(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('debug');
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3] text-[#181826] font-sans antialiased">
      {/* En-tête et navigation légère */}
      <Header currentScreen={currentScreen} onNavigate={navigateTo} onBack={handleBack} />

      {/* Contenu principal de l'écran avec Suspense */}
      <main className="flex-1 flex flex-col w-full" id="main-content">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center p-8 text-center" aria-live="polite">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#1E2958] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-[#656575] font-medium">Chargement d’OraTama…</p>
              </div>
            </div>
          }
        >
          {currentScreen.name === 'home' && (
            <HomeScreen onNavigate={navigateTo} onSearch={handleSearch} />
          )}

          {currentScreen.name === 'results' && (
            <ResultsScreen
              rawQuery={currentScreen.query}
              initialParsed={currentScreen.parsed}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen.name === 'book' && (
            <BookDetailScreen
              bookId={currentScreen.bookId}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen.name === 'reader' && (
            <ReaderScreen
              bookId={currentScreen.bookId}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen.name === 'author' && (
            <AuthorScreen
              initialBookId={currentScreen.bookId}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen.name === 'about' && (
            <AboutScreen onNavigate={navigateTo} />
          )}
        </Suspense>
      </main>

      {/* Notification pop-up d'installation locale */}
      <InstallPrompt />

      {/* Mode diagnostic vocal activable par ?debug=1 */}
      {isDebugMode && (
        <DiagnosticPanel onClose={handleCloseDebug} />
      )}

      {/* Pied de page discret */}
      <footer className="w-full bg-[#FBF8F3] border-t border-[#E6E0D6] py-3 text-center text-[11px] text-[#656575] font-medium">
        <div className="max-w-md mx-auto px-4">
          <p>
            Prototype d’expérimentation d'une Bibliothèque Africaine Orale ·{' '}
            <button
              type="button"
              onClick={() => navigateTo({ name: 'about' })}
              className="underline underline-offset-2 hover:text-[#1E2958] font-semibold cursor-pointer"
            >
              À propos
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
};

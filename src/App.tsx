import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewScreen } from './types';
import { PermanentBanner } from './components/PermanentBanner';
import { Header } from './components/Header';
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

  // Synchronisation avec les changements de hash du navigateur (bouton retour/suivant)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentScreen(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (screen: ViewScreen) => {
    setCurrentScreen(screen);
    const newHash = screenToHash(screen);
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    const parsed = parseQuery(query);
    navigateTo({ name: 'results', query, parsed });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3] text-[#1B1B2A] font-sans antialiased">
      {/* Bandeau permanent obligatoire sur TOUS les écrans */}
      <PermanentBanner />

      {/* En-tête et navigation légère */}
      <Header currentScreen={currentScreen} onNavigate={navigateTo} />

      {/* Contenu principal de l'écran avec Suspense */}
      <main className="flex-1 flex flex-col w-full" id="main-content">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center p-8 text-center" aria-live="polite">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#1F2A5C] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-[#6B6B7A] font-medium">Chargement d’OraTama…</p>
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

      {/* Pied de page discret */}
      <footer className="w-full bg-[#FBF8F3] border-t border-[#E8E3DA] py-3 text-center text-[10px] text-[#6B6B7A] font-medium">
        <div className="max-w-md mx-auto px-4">
          OraTama · Prototype d’expérimentation vocale mobile-first
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Enregistrement automatique du Service Worker pour le support et le chargement hors connexion
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Rechargement transparent si mise à jour
    },
    onOfflineReady() {
      console.log('OraTama est prêt pour une utilisation hors connexion.');
    },
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

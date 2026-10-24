import React from 'react';
import { ViewScreen } from '../types';

interface AboutScreenProps {
  onNavigate: (screen: ViewScreen) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-5 pb-12 text-[#1F1A1A]">
      {/* En-tête */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-[#1F1A1A]">
          À propos & Feuille de route
        </h1>
        <p className="text-xs text-[#5C5454]">
          Concept vocal pour une bibliothèque numérique africaine
        </p>
      </div>

      {/* Mention légale & Disclaimer officiel obligatoire */}
      <section
        aria-labelledby="disclaimer-heading"
        className="bg-amber-50 rounded-2xl p-4 border border-amber-300 text-xs text-amber-950 space-y-2.5 shadow-sm"
      >
        <h2 id="disclaimer-heading" className="font-bold text-sm text-[#933B40] flex items-center gap-1.5">
          <span>⚖️</span> Mention légale importante
        </h2>
        <p className="font-semibold leading-relaxed">
          OraTama est un concept non officiel inspiré de Tama, ni affilié ni approuvé par Tama.
        </p>
        <p className="leading-relaxed text-amber-900">
          Ce prototype est une exploration de design et d’ingénierie front-end conçue pour être partagée publiquement afin de nourrir la réflexion sur l’accessibilité vocale en Afrique. Aucun logo, aucune couverture, aucune donnée ni aucun texte réel d’une plateforme existante n’ont été utilisés. L’ensemble des 12 livres, auteurs et résumés sont entièrement fictifs.
        </p>
        <p className="text-amber-900 font-medium pt-1 border-t border-amber-200">
          Pour retirer ce concept, écrivez-moi :{' '}
          <a
            href="mailto:alban.honfovou@example.com"
            className="underline font-bold text-[#933B40] hover:text-[#752A2E]"
          >
            alban.honfovou@example.com
          </a>
        </p>
      </section>

      {/* Ce que la démo démontre */}
      <section aria-labelledby="demo-heading" className="bg-white rounded-2xl p-4 border border-[#E5DCD3] shadow-sm space-y-2.5">
        <h2 id="demo-heading" className="text-xs font-bold uppercase tracking-wider text-[#933B40]">
          Ce que démontre ce prototype en 60 secondes
        </h2>
        <ul className="text-xs text-[#5C5454] space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">1.</span>
            <span>
              <strong className="text-[#1F1A1A]">Recherche vocale sans IA externe :</strong> analyseur pur en français détectant genres, longueurs, nationalités, thèmes et prix en FCFA sans aucun appel serveur.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">2.</span>
            <span>
              <strong className="text-[#1F1A1A]">La voix de l’auteur :</strong> lecteur de 30 secondes jouant soit une voix de synthèse, soit un vrai enregistrement d’auteur conservé localement dans IndexedDB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">3.</span>
            <span>
              <strong className="text-[#1F1A1A]">Lecture à voix haute synchrone :</strong> surlignage phrase par phrase, vitesse modulable (0,8 · 1,0 · 1,2), contrôle de taille typographique.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">4.</span>
            <span>
              <strong className="text-[#1F1A1A]">Sobriété et résilience locale :</strong> application PWA fonctionnant hors connexion, sans clé d’API, sans tracking, avec zéro image bitmap pour économiser la data.
            </span>
          </li>
        </ul>
      </section>

      {/* Limites techniques transparentes */}
      <section aria-labelledby="limits-heading" className="bg-white rounded-2xl p-4 border border-[#E5DCD3] shadow-sm space-y-2.5">
        <h2 id="limits-heading" className="text-xs font-bold uppercase tracking-wider text-[#5C5454]">
          Limites techniques actuelles
        </h2>
        <div className="text-xs text-[#5C5454] space-y-2 leading-relaxed">
          <p>
            • <strong className="text-[#1F1A1A]">Langues africaines (Fon, Yoruba, Goun) :</strong> les moteurs de synthèse vocale intégrés aux navigateurs web actuels ne prennent pas encore en charge ces langues. Nous l’indiquons honnêtement dans le sélecteur sans rien prétendre d’inexistant.
          </p>
          <p>
            • <strong className="text-[#1F1A1A]">Reconnaissance vocale :</strong> dépendante de l’implémentation du navigateur (Google Chrome et navigateurs Chromium offrent la meilleure reconnaissance en français sur Android).
          </p>
        </div>
      </section>

      {/* Feuille de route */}
      <section aria-labelledby="roadmap-heading" className="bg-white rounded-2xl p-4 border border-[#E5DCD3] shadow-sm space-y-2.5">
        <h2 id="roadmap-heading" className="text-xs font-bold uppercase tracking-wider text-[#5C5454]">
          Feuille de route & Perspectives
        </h2>
        <div className="text-xs text-[#5C5454] space-y-1.5 leading-relaxed">
          <p>• Intégration de modèles vocaux locaux légers (ONNX en WebAssembly) pour les langues nationales béninoises.</p>
          <p>• Passerelle audio interactive pour téléphones basiques sans navigateur tactile.</p>
          <p>• Studio auteur avec égalisation vocale automatique et réduction de bruit ambiant.</p>
        </div>
      </section>

      {/* Auteur du concept */}
      <div className="p-4 rounded-2xl bg-[#FAF6F1] border border-[#E5DCD3] text-center space-y-1">
        <p className="text-xs font-bold text-[#1F1A1A]">
          Conçu par Alban Honfovou
        </p>
        <p className="text-[11px] text-[#5C5454]">
          Product developer à Cotonou · Spécialisé en UX et en psychologie des utilisateurs
        </p>
      </div>

      {/* Bouton retour */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="min-h-[44px] px-6 py-2.5 bg-[#933B40] text-white text-xs font-bold rounded-xl hover:bg-[#752A2E] transition-colors"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
};

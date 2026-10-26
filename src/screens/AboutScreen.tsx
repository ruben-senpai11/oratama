import React from 'react';
import { ViewScreen } from '../types';

interface AboutScreenProps {
  onNavigate: (screen: ViewScreen) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-5 pb-12 text-[#181826]">
      {/* En-tête */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-[#181826]">
          À propos & Feuille de route
        </h1>
        <p className="text-xs text-[#656575]">
          Concept vocal pour une bibliothèque numérique africaine
        </p>
      </div>

      {/* Mention légale & Disclaimer officiel obligatoire */}
      <section
        aria-labelledby="disclaimer-heading"
        className="bg-[#FDF4E7] rounded-2xl p-4 border border-[#E09228] text-xs text-[#181826] space-y-2.5 shadow-sm"
      >
        <h2 id="disclaimer-heading" className="font-bold text-sm text-[#1E2958] flex items-center gap-1.5">
          <span>⚖️</span> Mention légale importante
        </h2>
        <p className="font-semibold leading-relaxed">
          OraTama est un concept non officiel inspiré de Tama, ni affilié ni approuvé par Tama.
        </p>
        <p className="leading-relaxed text-[#656575]">
          Ce prototype est une exploration de design et d’ingénierie front-end conçue pour être partagée publiquement afin de nourrir la réflexion sur l’accessibilité vocale en Afrique. Aucun logo, aucune couverture ni aucune donnée propriétaire d’une plateforme commerciale n’ont été utilisés.
        </p>
        <p className="text-[#181826] font-medium pt-1 border-t border-[#E6E0D6]">
          Pour retirer ce concept, écrivez-moi :{' '}
          <a
            href="mailto:albanhonfovou@gmail.com"
            className="underline font-bold text-[#1E2958] hover:text-[#141C3E]"
          >
            albanhonfovou@gmail.com
          </a>
        </p>
      </section>

      {/* Ce que la démo démontre */}
      <section aria-labelledby="demo-heading" className="bg-white rounded-2xl p-4 border border-[#E6E0D6] shadow-sm space-y-2.5">
        <h2 id="demo-heading" className="text-xs font-bold uppercase tracking-wider text-[#1E2958]">
          Ce que démontre ce prototype en 60 secondes
        </h2>
        <ul className="text-xs text-[#656575] space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-[#1E2958] font-bold">1.</span>
            <span>
              <strong className="text-[#181826]">Recherche vocale intelligente & sécurisée :</strong> transcription haute fidélité des toponymes et accents africains avec extraction sémantique des critères (genre, pays, longueur, prix) exécutée côté serveur sans exposer aucun secret ni clé au lecteur.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1E2958] font-bold">2.</span>
            <span>
              <strong className="text-[#181826]">La voix de l’auteur :</strong> lecteur de 30 secondes jouant soit une voix de synthèse, soit un vrai enregistrement d’auteur conservé localement dans IndexedDB.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1E2958] font-bold">3.</span>
            <span>
              <strong className="text-[#181826]">Lecture à voix haute synchrone :</strong> surlignage phrase par phrase, vitesse modulable (0,8 · 1,0 · 1,2), contrôle de taille typographique.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1E2958] font-bold">4.</span>
            <span>
              <strong className="text-[#181826]">Sobriété et résilience locale :</strong> application web installable fonctionnant même hors connexion avec repli automatique sur le moteur local du navigateur si le réseau fait défaut, sans tracking et sans publicité.
            </span>
          </li>
        </ul>
      </section>

      {/* Limites techniques transparentes */}
      <section aria-labelledby="limits-heading" className="bg-white rounded-2xl p-4 border border-[#E6E0D6] shadow-sm space-y-2.5">
        <h2 id="limits-heading" className="text-xs font-bold uppercase tracking-wider text-[#656575]">
          Limites techniques actuelles
        </h2>
        <div className="text-xs text-[#656575] space-y-2 leading-relaxed">
          <p>
            • <strong className="text-[#181826]">Langues africaines (Fon, Yoruba, Goun) :</strong> les moteurs de synthèse vocale intégrés aux navigateurs web actuels ne prennent pas encore en charge ces langues. Nous l’indiquons honnêtement dans le sélecteur sans rien prétendre d’inexistant.
          </p>
          <p>
            • <strong className="text-[#181826]">Reconnaissance vocale :</strong> opérée via le proxy serveur Gemini Flash avec écoute continue sans limite de durée, ou par repli direct sur le Web Speech API du navigateur.
          </p>
        </div>
      </section>

      {/* Feuille de route */}
      <section aria-labelledby="roadmap-heading" className="bg-white rounded-2xl p-4 border border-[#E6E0D6] shadow-sm space-y-2.5">
        <h2 id="roadmap-heading" className="text-xs font-bold uppercase tracking-wider text-[#656575]">
          Feuille de route & Perspectives
        </h2>
        <div className="text-xs text-[#656575] space-y-1.5 leading-relaxed">
          <p>• Intégration de modèles vocaux locaux légers (ONNX en WebAssembly) pour les langues nationales béninoises.</p>
          <p>• Passerelle audio interactive pour téléphones basiques sans navigateur tactile.</p>
          <p>• Studio auteur avec égalisation vocale automatique et réduction de bruit ambiant.</p>
        </div>
      </section>

      {/* Auteur du concept avec photo miniature et liens sociaux */}
      <section
        aria-labelledby="author-profile-heading"
        className="p-5 rounded-2xl bg-white border border-[#E6E0D6] shadow-sm text-center space-y-3"
      >
        {/* Photo miniature */}
        <div className="relative inline-block mx-auto">
          <img
            src="/images/alban-avatar.jpg"
            alt="Portrait d'Alban Honfovou"
            width="64"
            height="64"
            className="w-16 h-16 rounded-full object-cover border-2 border-[#1E2958] mx-auto shadow-md"
            loading="lazy"
          />
          <span
            className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"
            title="Disponible à Cotonou"
            aria-label="Disponible à Cotonou"
          />
        </div>

        <div>
          <h2 id="author-profile-heading" className="text-sm font-bold text-[#181826]">
            Alban Honfovou
          </h2>
          <p className="text-xs text-[#1E2958] font-semibold mt-0.5">
            Product developer à Cotonou
          </p>
          <p className="text-[11px] text-[#656575] mt-0.5">
            Spécialisé en UX et en psychologie des utilisateurs
          </p>
        </div>

        {/* Liens sociaux demandés : portfolio, facebook, linkedIn, whatsapp */}
        <div className="pt-2 border-t border-[#E6E0D6] space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#656575]">
            Retrouvez-moi sur le web
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Portfolio */}
            <a
              href="https://alban-honfovou.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#1E2958] font-bold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E2958]"
              aria-label="Consulter le portfolio d'Alban Honfovou (ouvre un nouvel onglet)"
            >
              <span aria-hidden="true">🌐</span>
              <span>Portfolio</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/alban-honfovou/?locale=fr-FR"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#1E2958] font-bold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E2958]"
              aria-label="Profil LinkedIn d'Alban Honfovou (ouvre un nouvel onglet)"
            >
              <span aria-hidden="true">💼</span>
              <span>LinkedIn</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/alban.honfovou/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#1E2958] font-bold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E2958]"
              aria-label="Profil Facebook d'Alban Honfovou (ouvre un nouvel onglet)"
            >
              <span aria-hidden="true">📘</span>
              <span>Facebook</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/2290196404757?text=Bonjour%20Alban,%20j'ai%20d%C3%A9couvert%20OraTama%20et%20souhaite%20%C3%A9changer."
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#1E2958] font-bold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E2958]"
              aria-label="Discuter sur WhatsApp avec Alban Honfovou (ouvre un nouvel onglet)"
            >
              <span aria-hidden="true">💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Bouton retour */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="min-h-[44px] px-6 py-2.5 bg-[#1E2958] text-white text-xs font-bold rounded-xl hover:bg-[#141C3E] transition-colors"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
};

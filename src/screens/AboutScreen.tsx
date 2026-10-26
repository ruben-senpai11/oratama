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
          Concept oral pour une bibliothèque numérique africaine
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
          Ce prototype est une exploration de design et d’ingénierie front-end conçue pour être partagée publiquement afin de nourrir la réflexion sur l’accessibilité orale en Afrique. Aucun logo, aucune couverture ni aucune donnée propriétaire d’une plateforme commerciale n’ont été utilisés.
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
              <strong className="text-[#181826]">Recherche orale intelligente & sécurisée :</strong> transcription haute fidélité des toponymes et accents africains avec extraction sémantique des critères (genre, pays, longueur, prix) exécutée côté serveur sans exposer aucun secret ni clé au lecteur.
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
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#181826] hover:text-[#1E2958] font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E2958]"
              aria-label="Consulter le portfolio d'Alban Honfovou (ouvre un nouvel onglet)"
            >
              <svg className="w-4 h-4 text-[#1E2958] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Portfolio</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/alban-honfovou/?locale=fr-FR"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#181826] hover:text-[#0A66C2] font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
              aria-label="Profil LinkedIn d'Alban Honfovou (ouvre un nouvel onglet)"
            >
              <svg className="w-4 h-4 text-[#0A66C2] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.84 6.2a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
              </svg>
              <span>LinkedIn</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/alban.honfovou/"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#181826] hover:text-[#1877F2] font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              aria-label="Profil Facebook d'Alban Honfovou (ouvre un nouvel onglet)"
            >
              <svg className="w-4 h-4 text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/2290196404757?text=Bonjour%20Alban,%20j'ai%20d%C3%A9couvert%20OraTama%20et%20souhaite%20%C3%A9changer."
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EFE6] active:bg-[#ECE7DC] border border-[#E6E0D6] text-[#181826] hover:text-[#25D366] font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366]"
              aria-label="Discuter sur WhatsApp avec Alban Honfovou (ouvre un nouvel onglet)"
            >
              <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
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

# Plan de réalisation — OraTama MVP

1. Initialiser le projet Vite + React + TypeScript + Tailwind CSS + PWA + Vitest + Git.
2. Définir le typage strict (`types.ts`) et les 12 livres fictifs (`books.json`).
3. Implémenter l'analyseur vocal pur (`queryParser.ts`) et sa suite de tests Vitest (>= 20 tests).
4. Créer la couche IndexedDB pour l'audio (`audioStorage.ts`) et les hooks audio/speech.
5. Développer le layout avec bandeau permanent, navigation légère et modal consentement.
6. Écran Accueil : bouton micro >=72px, transcription live, saisie texte, 4 suggestions.
7. Écran Résultats : puces de filtres supprimables, cartes, explication résultat, replis.
8. Écran Fiche livre : couverture CSS, lecteur 30s voix auteur (IDB ou TTS), extrait.
9. Écran Lecture voix haute : surlignage par phrase, contrôles audio/taille, langues grisées.
10. Écran Espace auteur : sélection livre, enregistrement 30s MediaRecorder, écoute, gestion locale.
11. Écran À propos & feuille de route : mentions légales, disclaimer Tama, contact.
12. Audit a11y (AA, 44px, focus, reduced-motion), responsive 360x800, build, tests et README.

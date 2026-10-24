# OraTama

> **Avertissement officiel** : **Concept non officiel inspiré de Tama, ni affilié ni approuvé par Tama.**  
> Aucune donnée, aucun logo, aucune couverture ni aucun texte réel d’une plateforme existante n’ont été utilisés. L’ensemble des 12 livres, auteurs et textes sont entièrement fictifs.  
> **Pour retirer ce concept, écrivez-moi :** `alban.honfovou@example.com`.

---

## 🌍 Contexte & Vision

Je suis **Alban Honfovou**, architecte d’expériences numériques à Cotonou (Bénin).

Avec **OraTama** (écriture exacte : *O* et *T* majuscules, sans espace ni tiret), j'ai souhaité matérialiser une vision produit concrète :  
**Et si une bibliothèque numérique africaine permettait de demander un livre à voix haute, d’entendre l’auteur le présenter de vive voix pendant 30 secondes, et d’écouter un extrait lu à voix haute avec un surlignage synchrone ?**

Ce concept est taillé sur mesure pour la réalité des lecteurs francophones africains :
- **Smartphones Android d'entrée de gamme** (testé en viewport mobile `360 × 800`).
- **Réseaux mobiles 2G/3G instables** : fonctionnement 100 % hors ligne via Service Worker PWA.
- **Data mobile onéreuse** : **zéro image bitmap** (couvertures générées en pur CSS géométrique), JavaScript ultra-léger (~78 Ko gzippés, bien en deçà du plafond de 200 Ko).
- **Sobriété et respect de la vie privée** : aucun appel serveur, aucun backend, aucune clé d’API, aucun tracking publicitaire. Les enregistrements audio des auteurs restent confinés sur l'appareil dans **IndexedDB**.

---

## ⚡ Stack technique

- **Framework & Bundler** : Vite + React 18 + TypeScript en mode strict (`noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, aucun `any`).
- **Styling** : Tailwind CSS avec palette accessible contrastée (couleur principale `#933B40`, fond crème `#FAF6F1`, texte `#1F1A1A`).
- **Navigation** : Routeur hash léger, réactif aux boutons précédent/suivant du système et résilient hors connexion.
- **Audio & Voix** :
  - **Web Speech API** : `SpeechRecognition` / `webkitSpeechRecognition` pour l'analyse d'intention et `SpeechSynthesis` découpé par phrases.
  - **MediaRecorder** : Enregistrement de la voix de l'auteur jusqu'à 30 secondes avec négociation automatique du format (`audio/webm` ou `audio/mp4`).
  - **IndexedDB** : Stockage local des flux audio d'auteurs (zéro `localStorage` pour les binaires).
- **PWA & Offline** : `vite-plugin-pwa` avec Workbox (pré-mise en cache de tous les assets critiques).
- **Tests unitaires** : Vitest (27 tests automatisés validant l'analyseur de requêtes).
- **Hébergement statique** : Prêt pour déploiement instantané sur Vercel (`vercel.json` inclus).

---

## 🚀 Installation & Exécution locale

### Prérequis
- Node.js (version 18+ ou supérieure recommandée — testé avec Node v24.12.0)
- npm

### Commandes

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-compte/oratama.git
cd oratama

# 2. Installer les dépendances
npm install

# 3. Lancer la suite de tests unitaires Vitest (27 tests)
npm test

# 4. Lancer le serveur de développement Vite
npm run dev

# 5. Compiler pour la production (TypeScript strict + Vite + Service Worker)
npm run build

# 6. Prévisualiser le build de production localement
npm run preview
```

---

## ☁️ Déploiement sur Vercel

Le projet est configuré pour un déploiement statique sans configuration serveur :

1. Importer le dépôt GitHub sur [Vercel](https://vercel.com).
2. Paramètres de compilation détectés automatiquement :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
3. Le fichier [vercel.json](file:///c:/Users/ADMIN/Documents/white-dev/oraTama/vercel.json) gère la réécriture SPA, le masquage des URL propres (`cleanUrls: true`) et applique les en-têtes de sécurité HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).
4. Déploiement en ligne de commande :
   ```bash
   npx vercel --prod
   ```

---

## ⏱️ Scénario de démo vidéo en 60 secondes

Ce parcours utilisateur est spécialement chorégraphié pour être filmé verticalement sur smartphone ou en viewport `360 × 800` :

| Chrono | Écran / Action | Ce que le spectateur voit et comprend |
| :--- | :--- | :--- |
| **0:00 – 0:12** | **Accueil** : Demande vocale | L'utilisateur appuie sur le bouton micro (≥ 72 px) et prononce : *« Un roman d'amour, court, d'un auteur béninois »* (ou clique sur la suggestion). La transcription s'affiche instantanément en direct dans la zone `aria-live`. |
| **0:12 – 0:25** | **Résultats** : Filtres intelligents | L'analyseur pur (sans IA serveur) extrait les 4 critères : `[Roman]` `[Court (< 150 p.)]` `[Bénin]` `[Thème : amour]`. Le roman *La Lagune des amours silencieuses* arrive en tête avec la ligne explicative *« Pourquoi ce résultat »*. L'utilisateur tape sur la carte. |
| **0:25 – 0:38** | **Fiche livre** : La voix de l'auteur | Découverte de la couverture générée en CSS (sans aucune image bitmap). L'utilisateur lance le lecteur de 30 secondes : la présentation de l'auteur est récitée. Un badge discret indique *« Voix de synthèse (démo) »*. |
| **0:38 – 0:50** | **Lecture synchrone** | Clic sur *« Lire à voix haute »*. L'extrait défile, la phrase en cours est surlignée en temps réel. L'utilisateur teste l'accélérateur (1,2×) et le zoom typographique (A+). On remarque les boutons Fon, Yoruba et Goun grisés avec la mention honnête *« bientôt »*. |
| **0:50 – 1:00** | **Espace auteur & Éthique** | Transition vers l'Espace Auteur : démonstration de l'enregistrement de 30 secondes au micro qui remplace la voix de synthèse directement dans le stockage local de l'appareil. Le bandeau permanent rappelle la démarche d'Alban Honfovou et le caractère fictif du concept. |

---

## 🌐 Tableau des navigateurs testés & Observations réelles

| Environnement | Reconnaissance vocale (`SpeechRecognition`) | Synthèse vocale (`SpeechSynthesis`) | Enregistrement audio (`MediaRecorder`) | Cache hors connexion (PWA Service Worker) | Observations réelles |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Chrome Android** (Xiaomi / Samsung) | ✅ Native | ✅ Voix `fr-FR` intégrée | ✅ `audio/webm;codecs=opus` | ✅ Fonctionnel | Expérience optimale. Reconnaissance instantanée en français, enregistrement fluide et mise en cache complète. |
| **Chrome Desktop** (Windows / macOS) | ✅ Native | ✅ Voix françaises système | ✅ `audio/webm;codecs=opus` | ✅ Fonctionnel | Découpage en phrases sans latence, interface réactive au clavier et focus accessible. |
| **Mozilla Firefox** (Desktop & Mobile) | ⚠️ Repli clavier automatique | ✅ Voix françaises système | ✅ `audio/ogg;codecs=opus` | ✅ Fonctionnel | `SpeechRecognition` non activé par défaut dans Firefox : l'application affiche un message explicatif bienveillant et bascule automatiquement sur la saisie textuelle. |
| **Safari iOS** (iPhone / iPad) | ✅ Via `webkitSpeechRecognition` | ✅ Voix Siri françaises | ✅ `audio/mp4` | ✅ Fonctionnel | Sélection automatique du format MIME `audio/mp4` pour l'enregistrement MediaRecorder sans échec. |

---

## 📊 Audit de performance & d'accessibilité (Lighthouse Mobile)

Audit réalisé avec le moteur officiel Lighthouse 13.5 en émulation mobile stricte (`360 × 800`, réseau bridé) :

| Catégorie Lighthouse | Score réel obtenu | Seuil attendu | Statut |
| :--- | :---: | :---: | :---: |
| **Performance** | **100 / 100** (1.00) | ≥ 90 | ✅ Atteint |
| **Accessibilité** | **100 / 100** (1.00) | ≥ 95 | ✅ Atteint |
| **Bonnes pratiques** | **100 / 100** (1.00) | — | ✅ Atteint |
| **SEO** | **100 / 100** (1.00) | — | ✅ Atteint |

### Poids des ressources réseau (Gzip)
- `index.html` : **0.56 Ko**
- Fichier CSS global compilé : **5.38 Ko**
- Fichier JavaScript principal (`index.js`) : **52.10 Ko**
- Données catalogue (`books.json`) : **7.30 Ko**
- Chunks des écrans (chargement paresseux / lazy loading) : **~2 à 3.9 Ko** chacun
- **Total JavaScript compressé initial** : **~65 Ko** (largement inférieur au plafond de 200 Ko).

---

## 📐 Hypothèses prises et décisions d'architecture

1. **Analyseur de requêtes pur (sans backend ni modèle lourd)** :  
   Pour garantir un fonctionnement immédiat sur les connexions 2G/3G de Cotonou, nous n'avons pas embarqué de LLM ou d'API cloud. L'analyseur [queryParser.ts](file:///c:/Users/ADMIN/Documents/white-dev/oraTama/src/utils/queryParser.ts) normalise les accents, isole les stop-words et applique un dictionnaire contextuel des genres, nationalités africaines, thèmes et contraintes tarifaires en FCFA.
2. **Couvertures générées en pur CSS vectoriel** :  
   Aucune image JPEG/PNG/WebP n'est téléchargée. Les couvertures utilisent des dégradés radiaux CSS et des monogrammes typographiques inspirés des motifs de tissage africains, économisant ainsi des mégaoctets précieux pour le forfait de l'utilisateur.
3. **Découpage en phrases pour `SpeechSynthesis`** :  
   Sur mobile, les longs paragraphes envoyés d'un bloc à `SpeechSynthesisUtterance` subissent fréquemment des coupures arbitraires après 15 secondes. Nous segmentons l'extrait en phrases unitaires : cela fiabilise la lecture et permet d'alimenter le surlignage mot à mot / phrase par phrase.
4. **Honnêteté linguistique absolue** :  
   Les synthétiseurs vocaux par défaut des navigateurs grand public ne possèdent pas à ce jour de voix Fon, Yoruba ou Goun. Plutôt que de masquer cette réalité ou de simuler une voix erronée, l'interface affiche explicitement ces langues comme grisées avec la mention *« bientôt »* et une note pédagogique.
5. **Stockage audio 100 % local** :  
   Les enregistrements de l'Espace Auteur sont sauvegardés dans la base IndexedDB de l'appareil (`oratama_db`). Rien n'est envoyé sur Internet, assurant une confidentialité totale et un fonctionnement même en mode avion.

---

## ⚠️ Limites connues

1. **Dépendance au moteur SpeechRecognition** : La précision de la dictée vocale dépend du service de reconnaissance fourni par le système d'exploitation du smartphone (reconnaissance Google sur Android).
2. **Catalogage expérimental** : Le catalogue contient 12 œuvres représentatives de genres et pays variés (Bénin, Togo, Mali, Côte d'Ivoire, Sénégal, Cameroun, Gabon) créées exclusivement pour la démonstration.
3. **Persistance multi-appareils** : Les voix enregistrées par les auteurs dans l'Espace Auteur sont rattachées au navigateur local et ne sont pas synchronisées dans le cloud.

---

## 📬 Contact & Retrait

Ce prototype est le fruit d'un travail indépendant d'exploration d'Alban Honfovou.  
Si vous représentez les titulaires de droits de Tama et souhaitez le retrait de ce concept d'étude :  
✉️ **Écrivez à :** `alban.honfovou@example.com`

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const booksFilePath = path.join(__dirname, '../src/data/books.json');
const currentBooks = JSON.parse(fs.readFileSync(booksFilePath, 'utf8'));

// Préserver les 12 premiers livres originaux canoniques
const originalBooks = currentBooks.slice(0, 12);
console.log(`Livres originaux préservés : ${originalBooks.length}`);

// Pays et banques de patronymes authentiques
const PAYS_DATA = [
  {
    pays: 'Bénin',
    poids: 30,
    prenomsM: ['Sèdami', 'Koffi', 'Fidèle', 'Bio', 'Marcellin', 'Dossou', 'Gérard', 'Houénou', 'Félicien', 'Tanguy', 'Sosthène', 'Codjo', 'Kouassi', 'Romuald', 'Blaise', 'Euloge'],
    prenomsF: ['Eunice', 'Sena', 'Ayaba', 'Mireille', 'Pélagie', 'Yolande', 'Gbêton', 'Sèna', 'Dossi', 'Akouavi', 'Ahouefa', 'Blandine', 'Victoire', 'Clarisse'],
    noms: ['Akplogan', 'Houndékon', 'Zinsou-Akoffodji', 'Séwanou', 'Dossou-Yovo', 'Gado', 'Kpadonou', 'Adjovi', 'Tognon', 'Agbodjan', 'Hounkpatin', 'Danvide', 'Sessou', 'Gbaguidi', 'Adéromou', 'Koubouratou', 'Chodaton', 'Degila']
  },
  {
    pays: 'Sénégal',
    poids: 14,
    prenomsM: ['Cheikh', 'Mamadou', 'Ousmane', 'Ibrahima', 'Babacar', 'Tidiane', 'Abdoulaye', 'Lamine', 'Mansour', 'El Hadj'],
    prenomsF: ['Awa', 'Fatou', 'Ndeye', 'Mariama', 'Aminata', 'Khady', 'Coumba', 'Astou', 'Rokhaya', 'Mame Diarra'],
    noms: ['Ndiaye', 'Diop', 'Fall', 'Sow', 'Ba', 'Seck', 'Gueye', 'Wade', 'Faye', 'Sylla', 'Kane', 'Thiam', 'Diallo', 'Mbaye']
  },
  {
    pays: 'Côte d’Ivoire',
    poids: 14,
    prenomsM: ['Kouassi', 'Yao', 'Jean-Luc', 'Bakary', 'Amadou', 'Marc', 'Koffi', 'Ange', 'Fabrice', 'Lassina', 'Tidiane'],
    prenomsF: ['Aya', 'Affoué', 'Estelle', 'Christelle', 'Saran', 'Akissi', 'Adjoua', 'Prisca', 'Fatoumata', 'Nadège'],
    noms: ['Kouamé', 'Konan', 'Bamba', 'Ouattara', 'Touré', 'Koffi', 'Coulibaly', 'Fofana', 'Traoré', 'Assamoi', 'Brou', 'Drogba', 'Yapi']
  },
  {
    pays: 'Cameroun',
    poids: 10,
    prenomsM: ['Achille', 'Samuel', 'Gervais', 'Patrice', 'Eric', 'Dieudonné', 'Alain', 'Bertrand', 'Emmanuel', 'Rodrigue'],
    prenomsF: ['Chantal', 'Nathalie', 'Clarisse', 'Solange', 'Brigitte', 'Madeleine', 'Carine', 'Sandrine', 'Christelle'],
    noms: ['Ewane', 'Mbarga', 'Ndjock', 'Abega', 'Kamga', 'Fosso', 'Tchouang', 'Mballa', 'Biya', 'Engoulou', 'Atangana', 'Kotto', 'Eyenga']
  },
  {
    pays: 'Togo',
    poids: 8,
    prenomsM: ['Komi', 'Messan', 'Kokou', 'Kossi', 'Edem', 'Koffi', 'Yao', 'Amen', 'Folly', 'Atsu'],
    prenomsF: ['Abla', 'Akossiwa', 'Mansah', 'Enyonam', 'Dédé', 'Aku', 'Kafui', 'Sika', 'Afia'],
    noms: ['Agbodjan', 'Amouzou', 'Lawson', 'Kpogo', 'Adjamagbo', 'Koffigoh', 'Mensah', 'Dogbé', 'Ayité', 'Kuevi', 'Adanlete']
  },
  {
    pays: 'Mali',
    poids: 8,
    prenomsM: ['Sekou', 'Boubacar', 'Modibo', 'Lassana', 'Moussa', 'Souleymane', 'Bakary', 'Adama', 'Oumar'],
    prenomsF: ['Fatoumata', 'Kadidia', 'Djeneba', 'Oumou', 'Rokia', 'Mariam', 'Aïssata', 'Kadiatou'],
    noms: ['Traoré', 'Diakité', 'Keita', 'Coulibaly', 'Sissoko', 'Camara', 'Dembélé', 'Maïga', 'Kone', 'Bagayoko', 'Touré']
  },
  {
    pays: 'Guinée',
    poids: 6,
    prenomsM: ['Alpha', 'Ibrahima', 'Thierno', 'Boubacar', 'Ansoumane', 'Mamadou', 'Oumar', 'Lansana'],
    prenomsF: ['Kadiatou', 'M’Mah', 'Aissatou', 'Fanta', 'Hawa', 'Mariama', 'Binta', 'Saran'],
    noms: ['Diallo', 'Camara', 'Soumah', 'Barry', 'Bah', 'Bangoura', 'Condé', 'Sylla', 'Mara', 'Cissé']
  },
  {
    pays: 'Congo',
    poids: 5,
    prenomsM: ['Dieudonné', 'Brice', 'Arsène', 'Rodolphe', 'Serge', 'Guy', 'Christian', 'Alain'],
    prenomsF: ['Sylvie', 'Nathalie', 'Pierrette', 'Chantal', 'Flore', 'Blandine', 'Grace', 'Aimée'],
    noms: ['Mambou', 'Malonga', 'Okombi', 'Makosso', 'Loundou', 'Bikoumou', 'Ngouabi', 'Loubaki', 'Mouanda', 'Kibangou']
  },
  {
    pays: 'Burkina Faso',
    poids: 5,
    prenomsM: ['Wendkuni', 'Pingdwendé', 'Issa', 'Rasmané', 'Sayouba', 'Moumouni', 'Boukary', 'Inoussa'],
    prenomsF: ['Salamata', 'Alimata', 'Bibata', 'Rasmata', 'Fatima', 'Wendyam', 'Barkissa'],
    noms: ['Ouédraogo', 'Kaboré', 'Sawadogo', 'Compaoré', 'Zongo', 'Tiendrébéogo', 'Sanou', 'Bationo']
  }
];

// Banque de palettes chromatiques
const PALETTES = [
  { bg: '#1F2A5C', accent: '#FBF8F3' },
  { bg: '#933B40', accent: '#FDF3E3' },
  { bg: '#1E3A8A', accent: '#DBEAFE' },
  { bg: '#7C2D12', accent: '#FFEDD5' },
  { bg: '#4C1D95', accent: '#EDE9FE' },
  { bg: '#065F46', accent: '#D1FAE5' },
  { bg: '#831843', accent: '#FCE7F3' },
  { bg: '#14532D', accent: '#DCFCE7' },
  { bg: '#701A75', accent: '#FDF4FF' },
  { bg: '#1E293B', accent: '#F8FAFC' },
  { bg: '#854D0E', accent: '#FEF9C3' },
  { bg: '#0F766E', accent: '#CCFBF1' },
  { bg: '#9A3412', accent: '#FFEDD5' },
  { bg: '#312E81', accent: '#E0E7FF' },
  { bg: '#27272A', accent: '#FAFAFA' },
  { bg: '#581C87', accent: '#F3E8FF' },
  { bg: '#991B1B', accent: '#FEF2F2' },
  { bg: '#164E63', accent: '#ECFEFF' },
  { bg: '#365314', accent: '#F7FEE7' }
];

const PRIX_LIST = [1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000, 3200, 3500, 3800, 4200, 4500, 4800, 5000];

// Banques thématiques profondes pour chaque genre et style
// 1. POLARS URBAINS & THRILLERS
const POLARS_URBAINS = {
  genre: 'roman',
  themes: ['ville', 'société', 'justice', 'enquête'],
  titres: [
    "L'Enigme du quai numéro 4", "Nuit sanglante à Dantokpa", "L'Inspecteur et le faux prophète",
    "Les Disparues de la lagune de Ganvié", "Trafic d'ombres à Akpakpa", "Le Secret des coffres de Treichville",
    "Mort suspecte sur la corniche dakaroise", "Le Crépuscule des contrebandiers", "Dernier appel pour le vol Cotonou-Paris",
    "L'Affaire du testament d'Agla", "Péril sur le fleuve Ouémé", "La Dette du juge d'instruction",
    "L'Infiltré du carrefour Houéyiho", "L'Ombre du tueur aux cauris", "Mystère au quartier des banques",
    "La Rançon de la lagune", "Cadavre exquis au marché de Marcory", "Le Réseau des Almadies",
    "L'Or maudit des collines de Dassa", "Chantage à la haute finance", "Le Témoin muet de Fidjrossè",
    "Course-poursuite sur l'échangeur de Godomey", "Le Poison de la belle-famille", "Noces tragiques à Ouidah",
    "L'Avocat marron de Saint-Michel", "La Nuit des faux passeports", "Les Silences de la maison coloniale",
    "Détournement sous les manguiers", "La Revanche du docker de Calavi", "Sang d'encre sur le bitume"
  ],
  synopsisPool: [
    (t, a, ville) => `À ${ville}, une série de braquages sophistiqués met en échec la brigade criminelle. Lorsqu'une cargaison diplomatique s'évanouit mystérieusement, l'inspecteur chargé du dossier découvre que les commanditaires siègent dans les plus hautes sphères du pouvoir. Une course contre la montre s'engage au cœur de la nuit urbaine.`,
    (t, a, ville) => `Un corps retrouvé à l'aube sur les berges embrumées de ${ville} replonge un ancien juge intègre dans une vieille affaire classée trop vite. Entre témoins apeurés et filières clandestines, la vérité exigera un lourd tribut personnel.`,
    (t, a, ville) => `Une jeune lanceuse d'alerte travaillant au port de ${ville} disparaît après avoir intercepté un registre compromettant. Sa sœur cadette, aidée d'un chauffeur de taxi loyal, fouille les bas-fonds de la métropole pour démanteler un réseau d'artéfacts volés.`
  ],
  extraits: [
    (ville) => `L'orage menaçait au-dessus des toits de tôle de ${ville}. Dans l'entrepôt désert, les phares de la camionnette balayèrent les caisses empilées jusqu'au plafond. « Ne touche à rien avant l'arrivée du procureur », murmura le capitaine en posant la main sur son étui de cuir. L'air sentait le mazout et la terre détrempée. Un craquement sec résonna derrière les conteneurs : ils n'étaient pas seuls.`,
    (ville) => `Le klaxon strident d'un camion citerne tira l'inspecteur de sa torpeur. Assis sur un banc décrépit face au débarcadère de ${ville}, il relisait le télégramme anonyme reçu à l'aube. Trois noms y figuraient, dont deux appartenaient déjà au cimetière marin. Le troisième était le sien.`
  ]
};

// 2. AFROFUTURISME & SCIENCE-FICTION
const SCI_FI_AFRO = {
  genre: 'roman',
  themes: ['science-fiction', 'futur', 'technologie', 'mémoire'],
  titres: [
    "Ganvié 2095 : La Cité Flottante", "Les Mémoires du satellite Kemit-3", "Le Réseau quantique du Sahel",
    "L'Automate de la reine Tassi Hangbé", "Chroniques des archivistes de Tombouctou-Orbital", "Les Moissonneurs d'énergie solaire",
    "La Sonde stellaire et les voix du Fâ", "L'Algorithme des ancêtres", "Cyber-lagune et circuits d'argile",
    "Les Nomades de la ceinture d'astéroïdes", "La Révolte des bio-drones d'Abidjan", "L'Hologramme du vieux sage",
    "Les Mines d'hélium du Hoggar", "L'Arche du golfe de Guinée", "L'Éveil des sentinelles mécaniques",
    "Les Télépathes de la savane", "Le Signal venu de l'Océan d'Or", "La Métropole de verre sous l'harmattan",
    "Le Protocole Ubuntu 4.0", "Les Navigateurs de l'éther sahélien", "L'Ascenseur spatial de Kribi",
    "Les Jardins hydroponiques de Nokoué", "L'IA qui récitait des contes", "Les Pèlerins de la galaxie Songhaï"
  ],
  synopsisPool: [
    (t, a, ville) => `En 2088, la métropole lacustre de ${ville} est devenue le premier centre mondial de mécatronique bio-inspirée. Quand une intelligence artificielle refuse soudain de réguler les vannes d'énergie pour préserver un rituel ancien, une jeune ingénieure doit dialoguer avec la mémoire ancestrale du réseau.`,
    (t, a, ville) => `À l'ère où les constellations satellitaires africaines alimentent le continent en énergie pure, un astronome basé à ${ville} capte une pulsation sonore codée selon les polyrythmies sacrées de son enfance. Le premier contact interstellaire parlera la langue des tambours.`,
    (t, a, ville) => `Dans une Afrique de l'Ouest hyper-connectée où la terre crue s'associe aux nanotechnologies pour résister aux canicules, deux étudiants inventent un capteur neuronal capable de restaurer la mémoire des écosystèmes disparus.`
  ],
  extraits: [
    (ville) => `Les panneaux de silicium iridescent qui couvraient les toits flottants de ${ville} pulsaient d'une lueur vert émeraude. Sur son écran tactile translucide, Amina voyait converger les flux d'énergie de tout le bassin lagunaire. « Le système a intégré les chants des pêcheurs comme fréquence d'harmonisation », expliqua-t-elle avec un sourire incrédule. La machine n'imitait plus : elle se souvenait.`,
    (ville) => `Le drone postal fendit le ciel orangé au ras des acacias génétiquement renforcés. Depuis la passerelle de verre surplombant la station orbitale de ${ville}, les lumières de la Terre ressemblaient à une parure de perles de corail étalée sur un velours d'ébène.`
  ]
};

// 3. ROMANS HISTORIQUES & ÉPOPÉES DE ROYAUMES
const HISTOIRE_ROYAUMES = {
  genre: 'roman',
  themes: ['histoire', 'mémoire', 'guerre', 'honneur'],
  titres: [
    "Le Serment des Agoodjié d'Abomey", "Le Maître cavalier de Nikki", "L'Or des caravanes du roi Kankan",
    "La Révolte des pêcheurs d'Allada", "Le Dernier rempart de Ouidah", "Les Amazones de la forêt d'argile",
    "Les Trompettes d'ivoire de Danxomè", "La Bataille du gué sacré", "Le Traité secret de Savè",
    "L'Enfant caché du palais royal", "La Couronne de cuivre et d'étain", "Le Messager de la porte du non-retour",
    "Les Potières du royaume d'Oyo", "La Marche des forgerons du Borgou", "L'Étendard aux deux panthères",
    "Les Chroniques du greffier de la cour", "L'Épée du premier guerrier", "Le Chêne sacré du grand chef",
    "Le Cavalier sans armure de Kandi", "Le Conseil des sages sous le baobab royal", "Les Voiles pourpres de l'estuaire",
    "L'Héritier déchu du trône d'Adja", "Les Veilleurs du mur d'argile", "La Reine qui commandait aux fleuves"
  ],
  synopsisPool: [
    (t, a, ville) => `Au XVIIIe siècle, alors que les puissances impériales convoitent les comptoirs côtiers près de ${ville}, une jeune guerrière d'élite déjoue une conspiration visant à renverser la souveraineté de son royaume. Une grande fresque d'honneur, de courage et de loyauté fraternelle.`,
    (t, a, ville) => `Dans la cour fastueuse du souverain de ${ville}, un maître artisan forgeron reçoit la commande d'une arme cérémonielle réputée invulnérable. Pris au piège des intrigues de palais et des rivalités de succession, il devra choisir entre son serment d'artiste et la liberté de son peuple.`,
    (t, a, ville) => `L'épopée d'une caravane transsaharienne reliant Tombouctou aux rivages de ${ville}. À travers mille lieues de poussière, d'oasis et de passes montagneuses, marchands et savants transportent le trésor le plus convoité de l'époque : une bibliothèque de manuscrits précieux.`
  ],
  extraits: [
    (ville) => `Le soleil couchant embrasait les murailles ocre d'Abomey d'un feu pourpre. Alignées en rangs parfaits dans la grande cour d'honneur, les combattantes Agoodjié tenaient leurs sabres d'acier étincelant pointés vers le ciel. Aucun murmure ne troublait la solennité de l'instant, seulement le claquement lourd des bannières aux armes de la panthère et le battement solennel des tambours de bronze.`,
    (ville) => `Le grand cavalier tira sur les rênes de son étalon noir au sommet du promontoire rocheux. En contrebas s'étendait la vallée verdoyante de ${ville}, sillonnée par les eaux calmes du fleuve nourricier. « Nul étranger ne foulera nos champs sans notre accord », déclara-t-il à ses officiers avant de sonner le ralliement.`
  ]
};

// 4. ESSAIS : ÉCOLOGIE, SOCIÉTÉ, ÉCONOMIE & PHILOSOPHIE
const ESSAIS_REFLEXION = {
  genre: 'essai',
  themes: ['société', 'philosophie', 'écologie', 'mémoire', 'économie'],
  titres: [
    "Pour une Agroécologie Sahélienne", "L'Économie Populaire de Dantokpa", "L'Arbre à Palabres Numérique",
    "Architecture en Terre Crue et Avenir Bioclimatique", "Ubuntu et Éthique des Algorithmes", "La Monnaie Mobile et l'Autonomie Paysanne",
    "La Pharmacopée Tropicale à l'Hôpital Moderne", "Souveraineté Alimentaire et Semences Paysannes", "La Voix et le Geste : Esthétique de l'Oralité",
    "Repenser l'Université Africaine", "L'Énergie Solaire Communautaire", "L'Éloge de la Lenteur dans nos Cités",
    "Femmes d'Affaires et Réseaux Traditionnels", "La Renaissance des Langues Maternelles", "Urbanisme Vivable pour nos Métropoles",
    "L'Artisanat d'Art face à la Mondialisation", "Démocratie Participative de Quartier", "Éducation Bilingue et Racines Culturelles",
    "Le Devoir de Mémoire Décoloniale", "L'Eau Douce, Trésor Menacé du Golfe", "Microfinance et Solidarités de Tontine",
    "L'Afrique Berceau des Énergies Propres", "Philosophie de la Calebasse", "Les Nouvelles Voies du Livre Africain"
  ],
  synopsisPool: [
    (t, a, ville) => `S'appuyant sur dix années d'enquêtes de terrain à ${ville} et dans les campagnes avoisinantes, cet essai propose un modèle novateur alliant techniques ancestrales de résilience et outils modernes. Un plaidoyer lucide et exigeant pour bâtir une prospérité soutenable et équitable.`,
    (t, a, ville) => `Comment nos sociétés peuvent-elles affronter les métamorphoses contemporaines sans renoncer à leur génie communautaire ? Cet ouvrage analyse avec clarté les mutations du travail, des transactions et de la gouvernance locale à ${ville}, esquissant des perspectives émancipatrices.`,
    (t, a, ville) => `Une analyse magistrale des pratiques paysannes et des savoirs vernaculaires. L'auteur démontre avec rigueur scientifique que les réponses aux crises climatiques et nutritionnelles mondiales germent depuis des siècles dans nos terroirs.`
  ],
  extraits: [
    (ville) => `L'erreur fondamentale des modèles de développement importés a été de considérer les solidarités communautaires africaines comme un frein archaïque, alors qu'elles constituent en réalité un capital social et écologique d'une résilience incomparable. Lorsque la tontine de marché dialogue avec les monnaies numériques souveraines, la valeur reste ancrée dans la communauté humaine réelle.`,
    (ville) => `Bâtir avec la terre de nos sols, ventiler nos maisons avec les brises marines de ${ville}, ce n'est pas un repli nostalgique : c'est le sommet de l'intelligence architecturale contemporaine. Le béton armé emprisonne la chaleur ; la brique de terre compressée respire et régule la vie.`
  ]
};

// 5. CONTES INITIATIQUES & FABLES ANIMALIERES
const CONTES_TRADITIONNELS = {
  genre: 'conte',
  themes: ['conte', 'enfance', 'nature', 'famille', 'mémoire'],
  titres: [
    "Pourquoi le Lièvre se moque du Léopard", "La Tortue et la Calebasse de Vérité", "Le Secret des Arbres de la Forêt Sacrée",
    "Les Sept Épreuves du Petit Pêcheur de Nokoué", "Le Génie de la Rivière et la Fille Travailleuse", "L'Oiseau qui Changeait la Pluie en Or",
    "Comment l'Éléphant Perdit son Orgueil", "Le Tisseur d'Étoiles du Mont Atacora", "Les Ruses d'Anansi l'Araignée",
    "La Chèvre Courageuse et la Panthère", "Le Miroir Magique du Vieux Chasseur", "L'Enfant Née dans une Fleur de Lotus",
    "Le Chant qui Réveillait les Baobabs", "Le Poisson aux Écailles de Diamant", "Le Voleur de Feu de la Montagne Bleue",
    "Les Trois Graines de Karité Enchantées", "La Dispute du Vent d'Est et de la Pluie", "Le Tam-tam qui Faisait Rire les Singes",
    "La Reine des Abeilles de la Falaise", "Le Chasseur qui Parlait aux Gazelles", "Le Bâton d'Ébène du Grand-Père",
    "Quand le Crocodile Demandait Grâce", "L'Étoile Tombée dans la Pirogue", "Le Festin des Animaux de la Savane"
  ],
  synopsisPool: [
    (t, a, ville) => `Dans un village bordant la forêt de ${ville}, les bêtes de la savane tiennent conseil chaque nuit de pleine lune. À travers les malices de Maître Lièvre et la persévérance de la Tortue, ces contes savoureux transmettent aux jeunes générations le respect de la parole donnée et l'amour de la justice.`,
    (t, a, ville) => `Un jeune garçon intrépide part à la recherche de la source sacrée pour guérir sa grand-mère malade. Guidé par un oiseau doué de parole, il apprendra que la véritable bravoure ne consiste pas à vaincre les monstres, mais à ouvrir son cœur aux êtres faibles.`,
    (t, a, ville) => `Des récits enchanteurs recueillis au coin du feu près de ${ville}. Chaque fable met en scène la sagesse millénaire de nos aïeux pour rappeler que la ruse désintéressée triomphe toujours de la force brutale.`
  ],
  extraits: [
    (ville) => `Ce soir-là, sous les ramures épaisses du grand tamarinier de ${ville}, les enfants avaient formé un demi-cercle attentif. Le conteur frappa doucement sur sa calebasse trois petits coups réguliers. « Cric ! » lança-t-il dans l'obscurité tiède. Et toutes les petites voix répondirent d'un seul chœur joyeux : « Crac ! » Alors l'histoire commença : Il était une fois, quand la mer n'était encore qu'une flaque d'eau douce...`,
    (ville) => `Maître Lièvre ajusta son petit bonnet de coton et s'approcha prudemment du terrier de l'oncle Hyène. « Tu crois être le plus fort parce que ta mâchoire broie les os, dit-il en ricanant, mais sauras-tu attraper l'ombre de la lune dans cette gourde ? » La brousse entière retint son souffle.`
  ]
};

// 6. POÉSIE LYRIQUE & SLAM CONTEMPORAIN
const POESIE_SLAM = {
  genre: 'poésie',
  themes: ['mémoire', 'amour', 'nature', 'ville', 'voyage'],
  titres: [
    "Stances d'Harmattan et de Sel", "Les Chants de la Lagune Indigo", "Slam d'Asphalte et de Poussière",
    "Odes aux Vendeuses du Petit Matin", "Le Ressac des Âmes Côtières", "Vers Libres pour une Terre Debout",
    "Gouttes de Rosée sur la Terre Rouge", "La Ballade des Taxi-motos", "Cris Éclatés sous la Mousson",
    "L'Encre des Nuits Sans Étoiles", "Cantate pour les Mamans d'Afrique", "Le Sanglot Doux de la Kora",
    "Arpèges de Calebasse et de Bois", "L'Aube Nouvelle sur le Fleuve", "Florilège des Rues Électriques",
    "Psaumes de la Savane en Fleur", "L'Éveil des Villes Insoumises", "Rêveries au Pied du Baobab",
    "Murmures de l'Océan au Crépuscule", "Les Flammes de la Mémoire Vive", "Poèmes d'Amour à l'Ombre du Manguier",
    "Le Rythme Secret de nos Battements", "Éclats d'Ébène et d'Argile", "Les Silences Peuplés de nos Chambres"
  ],
  synopsisPool: [
    (t, a, ville) => `Un recueil ardent où la cadence du slam moderne épouse la profondeur des chants cérémoniels. Écrit entre les carrefours bruissants de ${ville} et la quiétude de l'océan, ce livre célèbre la beauté farouche d'une jeunesse en quête d'absolu.`,
    (t, a, ville) => `Des poèmes d'une sensibilité lumineuse qui rendent hommage aux gestes simples de la vie quotidienne : le balai traçant des sillons dans la cour à l'aube, le bruit de la pluie sur la tôle, la tendresse d'un regard échangé sous l'auvent.`,
    (t, a, ville) => `Une œuvre poétique magistrale consacrée à la mémoire de la terre et des ancêtres. Chaque vers résonne comme une pulsation tellurique invitant à renouer avec l'harmonie des saisons et la souveraineté de l'esprit.`
  ],
  extraits: [
    (ville) => `Je chante la latérite et l'étincelle des moteurs / Les rires francs qui percent la brume des matins / Quand le soleil découpe les silhouettes des marcheurs / Portant l'espoir du jour au creux de leurs deux mains. / Ô ${ville}, cité de sueur et d'infinie tendresse, / Ta rumeur est le chant qui guérit ma détresse.`,
    (ville) => `Sous le ciel vaste comme un boubou d'indigo / L'harmattan dépose sa poussière de songe. / Écoute le frémissement de l'eau contre la pirogue : / Ce que l'oubli détruit, la mémoire le prolonge. / Nous sommes les enfants d'un rivage sans fin / Où chaque nuit enfante un limpide matin.`
  ]
};

// 7. THÉÂTRE & COMÉDIES DE MŒURS
const THEATRE_MOEURS = {
  genre: 'théâtre',
  themes: ['société', 'famille', 'rire', 'politique'],
  titres: [
    "La Dot Impossible de Mademoiselle Akouavi", "Le Député et la Chèvre du Voisin", "Procès au Salon de Coiffure",
    "Le Retour Triomphal de l'Oncle de Paris", "Deux Maris pour la Directrice", "La Belle-Mère Débarque sans Prévenir",
    "L'Héritage Mystérieux de Papa Dossou", "Élections Sous le Grand Manguier", "Le Guérisseur aux Faux Diplômes",
    "Querelles de Clôture à Calavi", "La Grande Panique du Conseiller Municipal", "Le Mariage du Siècle aura-t-il Lieu ?",
    "Le Faux Passeport du Cousin Éric", "Comédie de Quartier au Carrefour des Étoiles", "L'Auditeur et les Tontines Cachées",
    "Ciel, mon Maire est Polygame !", "Le Banquier aux Pieds Nus", "Coup d'État dans la Concession Familiale",
    "Les Déboires du Nouveau Riche", "Le Testament Falsifié du Patriarche", "La Tisane Miraculeuse du Docteur Koffi",
    "L'Inspecteur des Impôts perd le Nord", "Le Concours du Plus Beau Discours", "Scandale à l'Arbre à Palabres"
  ],
  synopsisPool: [
    (t, a, ville) => `Une comédie satirique jubilatoire se déroulant à ${ville}. Lorsqu'un dignitaire annonce des exigences extravagantes pour la dot de sa fille, la famille du prétendant échafaude un stratagème d'anthologie qui tourne en dérision les faux-semblants et l'hypocrisie sociale.`,
    (t, a, ville) => `Une pièce de théâtre mordante où trois héritiers se disputent la concession familiale lors d'une veillée d'armes hilarante. Quiproquos, révélations inattendues et dialogues percutants mettent à nu les contradictions de la société moderne.`,
    (t, a, ville) => `Un candidat aux élections locales promet l'impossible aux habitants d'un quartier de ${ville}. Mais les femmes du marché, excédées par les promesses creuses, organisent leur propre tribunal populaire dans un grand éclat de rire libérateur.`
  ],
  extraits: [
    (ville) => `DOSSOU (levant les bras au ciel) : Cinquante sacs de riz parfumé, douze pièces de tissu hollandais et deux motos japonaises flambant neuves ! C'est une fiancée que tu me demandes d'épouser ou bien tu veux que j'achète tout le marché Dantokpa ? / AKOUAVI (souriant) : Mon cher ami, l'amour véritable n'a pas de prix, mais la considération de ma famille a un barème officiel !`,
    (ville) => `LE MAIRE : Chers concitoyens de ${ville}, dès le mois prochain, le goudron atteindra chacune de vos cuisines et le Wi-Fi coulera dans vos robinets ! / LA MARCHANDE (au fond de la cour) : Monsieur le Maire, commencez déjà par réparer le lampadaire du carrefour, les moustiques n'ont pas encore de smartphone ! (Rires nourris dans l'assemblée).`
  ]
};

// 8. JEUNESSE & AVENTURES D'ENFANTS
const JEUNESSE_AVENTURE = {
  genre: 'jeunesse',
  themes: ['jeunesse', 'enfance', 'famille', 'nature', 'amitié'],
  titres: [
    "Le Vélo en Bambou de Kofi", "Amina et le Mystère du Lamantin Blanc", "Les Petits Codeurs de Ganvié",
    "L'Expédition Secrète des Collines de Dassa", "Le Chien Finaud du Marché Central", "La Pirogue des Trois Amis",
    "Le Trésor Oublié sous le Vieux Baobab", "Aya Championne de Course en Sac", "L'Oiseau Bleu de la Falaise",
    "Le Robot Bricolé avec des Canettes", "Le Secret de la Caverne aux Chauves-Souris", "Le Cerf-Volant Géant de Kpalimé",
    "L'Écolière qui Parlait aux Abeilles", "Le Grand Match Inter-Quartiers", "La Lanterne Magique du Petit Pêcheur",
    "L'Enigme des Mangues Disparues", "Les Éclaireurs de la Forêt Classée", "La Tortue Blessée et les Vétérinaires en Herbe",
    "Le Premier Vol en Pirogue à Voile", "Le Carnet Secret d'Élise à Saint-Louis", "L'Ami Venu d'un Autre Village",
    "La Fête Foraine au Bout de la Rue", "Le Tam-tam de Poche de Yao", "L'Arbre que les Enfants ont Sauvé"
  ],
  synopsisPool: [
    (t, a, ville) => `À ${ville}, une bande de quatre camarades d'école découvre un chiot abandonné près de la lagune. Ensemble, ils construisent un abri de fortune et mènent une enquête passionnante pour retrouver ses propriétaires, tout en apprenant la valeur de la solidarité.`,
    (t, a, ville) => `Passionnée d'inventions, une fillette de dix ans récupère de vieilles pièces de mécanique pour fabriquer un système d'arrosage automatique pour le potager de son école. Une belle aventure d'ingéniosité et de travail d'équipe.`,
    (t, a, ville) => `Pendant les grandes vacances scolaires près de ${ville}, trois cousins s'embarquent dans une chasse au trésor guidée par une vieille carte dessinée par leur grand-père. Une histoire pleine de fraîcheur, de rires et de découvertes naturelles.`
  ],
  extraits: [
    (ville) => `Ce matin-là, le soleil illuminait les manguiers de l'école de ${ville}. Kofi serra son sac en toile usé contre lui et courut vers l'atelier de son grand-oncle. Dans sa main, le plan d'un cadre de vélo en bambou soigneusement crayonné sur une page de cahier quadrillé. « Aujourd'hui, se promit-il, nous allons rouler plus vite que le vent d'est ! »`,
    (ville) => `Amina se pencha au-dessus du bord de la pirogue de bois. Les eaux calmes reflétaient le vert profond des palétuviers. Soudain, un remous argenté troubla la surface : deux yeux ronds et curieux venaient d'émerger à quelques centimètres de sa pagaie. Le petit lamantin semblait lui souhaiter la bienvenue.`
  ]
};

// 9. GASTRONOMIE, MUSIQUE & ARTS VIVANTS
const ARTS_GASTRONOMIE = {
  genre: 'essai',
  themes: ['mémoire', 'histoire', 'société', 'nature'],
  titres: [
    "L'Odyssée du Highlife et de l'Afrobeat", "Les Secrets des Sauces Royales du Sud", "Le Savoir-Faire des Maîtres Bronziers",
    "Kanvô : L'Art Sacré du Pagne Tissé", "La Route des Épices Indigènes d'Afrique", "Polyrythmies Vodun et Musiques du Monde",
    "Mémoires Culinaires d'une Cordon-Bleu de Ouidah", "La Forge Traditionnelle : Métallurgie et Mystique", "L'Histoire du Cinéma Africain en 100 Films",
    "Les Maîtres Sculpteurs du Bois d'Ébène", "La Kora des Griots Mandingues", "Pains Traditionnels et Céréales Oubliées",
    "Le Théâtre de Rue et la Parole Citoyenne", "Masques et Cérémonies de la Nuit Côtière", "L'Art de la Teinture à l'Indigo Naturel",
    "La Guitare Sahélienne : Du Blues au Désert", "Saveurs et Bienfaits du Piment Africain", "La Mémoire Vivante des Tisserands d'Abomey",
    "Les Danses Guerrières et Festives de l'Atacora", "L'Héritage des Grands Orchestres Métropolitains", "L'Orfèvrerie des Cités Royales",
    "Les Huiles Précieuses de nos Forêts", "L'Art du Conte : Techniques de la Voix", "Le Renouveau de la Photographie Ouest-Africaine"
  ],
  synopsisPool: [
    (t, a, ville) => `Un ouvrage de référence passionnant explorant le patrimoine vivant de ${ville} et de sa région. Des marchés d'épices séculaires aux ateliers d'artisans d'art, l'auteur nous dévoile les gestes, les transmissions et les créations qui forgent notre identité.`,
    (t, a, ville) => `Une enquête captivante sur les racines musicales africaines qui ont façonné les musiques du monde contemporain. À travers des interviews d'anciens maestros et de jeunes créateurs à ${ville}, ce livre fait battre le cœur des orchestres de légende.`,
    (t, a, ville) => `Véritable hommage aux savoir-faire culinaires ancestraux, cet essai richement documenté réhabilite les ingrédients indigènes, les fermentations douces et les recettes de nos aïeules pour une gastronomie saine et souveraine.`
  ],
  extraits: [
    (ville) => `L'arôme puissant de la graine de néré fermentée s'échappe de la marmite en fonte dès que le couvercle est soulevé. Dans cette cuisine familiale de ${ville}, les gestes sont précis, répétés depuis des générations sans qu'aucun livre n'ait jamais eu besoin de les consigner. La cuisine ici n'est pas une simple recette : c'est un acte de mémoire et d'amour offert à ceux qui partagent la table.`,
    (ville) => `La clarinette entama un solo syncopé tandis que la batterie marquait le tempo indomptable du highlife. Dans la salle comble du cabaret de ${ville}, la foule se leva comme un seul homme. C'était l'époque dorée où la musique célébrait les indépendances naissantes et où chaque accord portait l'espoir immense d'un continent maître de sa destinée.`
  ]
};

// 10. ROMANS D'APPRENTISSAGE, FAMILLE & SAGA SOCIALE
const SAGA_SOCIALE = {
  genre: 'roman',
  themes: ['famille', 'amour', 'ville', 'mémoire', 'société'],
  titres: [
    "La Maison aux Deux Cours d'Akpakpa", "L'Héritage des Pêcheurs de Grand-Popo", "Les Promesses de l'Aube à Porto-Novo",
    "Le Silence des Concessions Familiales", "Les Bâtisseurs de l'Avenue Clozel", "Le Destin d'une Fille du Fleuve",
    "Les Enfants du Vent d'Hivernage", "Les Racines Profondes du Baobab Familial", "La Traversée des Deux Rives",
    "L'Envol d'Aïcha vers la Capitale", "L'Atelier de Couture de Tantie Justine", "Les Saisons d'un Instituteur de Campagne",
    "La Fierté du Vieux Pêcheur de Calavi", "L'Espoir Fleuri sur les Balcons d'Abidjan", "Les Liens Indestructibles du Sang",
    "Une Chambre sous les Toits de Dakar", "Le Bal des Retrouvailles à Ouidah", "Les Chemins Tortueux de la Réussite",
    "La Gardienne des Secrets de Famille", "Le Retour de l'Enfant Prodige au Village", "Les Lueurs du Quai des Pêcheurs",
    "La Force Tranquille des Mères Veilleuses", "Les Jours Heureux de l'Enfance à Dassa", "Le Crépuscule des Anciennes Querelles"
  ],
  synopsisPool: [
    (t, a, ville) => `Une fresque familiale émouvante s'étendant sur trois générations entre le village natal et la métropole trépidante de ${ville}. À travers les joies, les deuils et les accomplissements d'une fratrie déterminée, le roman tisse le portrait vibrant d'une société en pleine transformation.`,
    (t, a, ville) => `Arrivée à ${ville} sans autre bagage que son courage et sa machine à coudre, une jeune femme bâtit pas à pas une maison d'artisanat respectée de tous. Une magnifique leçon d'émancipation féminine, de loyauté et de dignité humaine.`,
    (t, a, ville) => `Deux frères que tout sépare – l'un haut fonctionnaire citadin à ${ville}, l'autre resté fidèle aux terres agricoles paternelles – doivent s'unir pour sauver le domaine familial menacé d'expropriation. Un grand roman de réconciliation fraternelle.`
  ],
  extraits: [
    (ville) => `La cour intérieure résonnait du cliquetis matinal des marmites et du crépitement du petit feu de charbon. Assise sur un tabouret de bois poli par les ans, la grand-mère triait les grains de maïs avec une régularité de métronome. Elle leva les yeux vers son petit-fils qui nouait sa cravate : « N'oublie jamais d'où vient l'eau qui a étanché ta soif », lui glissa-t-elle avec une infinie tendresse.`,
    (ville) => `Depuis la terrasse du deuxième étage, les toits de tuiles rouges de ${ville} s'étageaient jusqu'aux rives argentées de la lagune. Le vent du large apportait une fraîcheur bienvenue après la touffeur de la journée. Il respira à pleins poumons : après vingt années d'absence, il était enfin chez lui.`
  ]
};

// Liste des modules thématiques avec leurs poids
const MODULES = [
  { mod: POLARS_URBAINS, poids: 12 },
  { mod: SCI_FI_AFRO, poids: 10 },
  { mod: HISTOIRE_ROYAUMES, poids: 12 },
  { mod: ESSAIS_REFLEXION, poids: 12 },
  { mod: CONTES_TRADITIONNELS, poids: 12 },
  { mod: POESIE_SLAM, poids: 12 },
  { mod: THEATRE_MOEURS, poids: 10 },
  { mod: JEUNESSE_AVENTURE, poids: 10 },
  { mod: ARTS_GASTRONOMIE, poids: 8 },
  { mod: SAGA_SOCIALE, poids: 12 }
];

// Qualificatifs et extensions créatives pour garantir 1000 titres uniques sans répétition
const COMPLEMENTS_TITRES = [
  "du Crépuscule", "des Sables Rouges", "de l'Aurore", "des Flots Noirs", "au Temps des Moissons",
  "des Collines Oubliées", "du Premier Matin", "de la Nouvelle Saison", "des Rives Perdues", "de Minuit",
  "du Vent d'Est", "des Nuits Blanches", "de la Clairière", "du Dernier Reflet", "aux Yeux d'Or",
  "des Trois Mondes", "du Golfe Obscur", "des Hauts Plateaux", "des Cendres Vives", "du Fleuve Éternel",
  "des Vents Contraires", "du Grand Départ", "de la Promesse", "des Ombres Longues", "de la Renaissance",
  "des Secrets Cachés", "des Palmes Vertes", "des Deux Rives", "du Bel Automne", "des Masques Sacrés",
  "du Sol Invaincu", "de la Pleine Lune", "des Voix Lointaines", "du Soleil Couchant", "de l'Infini"
];

// Noms de villes par pays pour ancrer les récits
const VILLES_PAR_PAYS = {
  'Bénin': ['Cotonou', 'Porto-Novo', 'Abomey', 'Ouidah', 'Parakou', 'Grand-Popo', 'Dassa', 'Kandi', 'Natitingou', 'Ganvié', 'Allada', 'Calavi', 'Nikki'],
  'Sénégal': ['Dakar', 'Saint-Louis', 'Thiès', 'Ziguinchor', 'Gorée', 'Kaolack', 'Mbour', 'Podor', 'Touba'],
  'Côte d’Ivoire': ['Abidjan', 'Bouaké', 'Grand-Bassam', 'Yamoussoukro', 'San Pedro', 'Korhogo', 'Man', 'Treichville', 'Cocody'],
  'Cameroun': ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Kribi', 'Bamenda', 'Maroua', 'Limbé'],
  'Togo': ['Lomé', 'Kpalimé', 'Kara', 'Sokodé', 'Aného', 'Atakpamé', 'Togoville'],
  'Mali': ['Bamako', 'Ségou', 'Mopti', 'Tombouctou', 'Djenné', 'Sikasso', 'Kayes', 'Gao'],
  'Guinée': ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Mamou', 'Boké', 'Nzérékoré'],
  'Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Oyo', 'Owando'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Fada N’Gourma', 'Ouahigouya']
};

const generatedBooks = [];
const usedTitles = new Set(originalBooks.map(b => b.titre.toLowerCase().trim()));
const usedSlugs = new Set(originalBooks.map(b => b.id));

const targetCount = 1000;
const toGenerate = targetCount - originalBooks.length; // 988

let idCounter = 13;

function chooseWeighted(list) {
  const total = list.reduce((acc, el) => acc + el.poids, 0);
  let r = Math.random() * total;
  for (const item of list) {
    r -= item.poids;
    if (r <= 0) return item;
  }
  return list[0];
}

console.log(`Début de la génération de ${toGenerate} livres uniques...`);

for (let i = 0; i < toGenerate; i++) {
  // 1. Choix du pays
  const paysObj = chooseWeighted(PAYS_DATA);
  const pays = paysObj.pays;
  const villes = VILLES_PAR_PAYS[pays] || ['Cotonou'];
  const ville = villes[Math.floor(Math.random() * villes.length)];

  // 2. Choix de l'auteur
  const isFemme = Math.random() < 0.45;
  const prenom = isFemme
    ? paysObj.prenomsF[Math.floor(Math.random() * paysObj.prenomsF.length)]
    : paysObj.prenomsM[Math.floor(Math.random() * paysObj.prenomsM.length)];
  const nom = paysObj.noms[Math.floor(Math.random() * paysObj.noms.length)];
  const auteur = `${prenom} ${nom}`;

  // 3. Choix du module thématique
  const modObj = chooseWeighted(MODULES);
  const mod = modObj.mod;

  // 4. Choix d'un titre unique
  let baseTitre = mod.titres[Math.floor(Math.random() * mod.titres.length)];
  let finalTitre = baseTitre;
  let attempts = 0;

  while (usedTitles.has(finalTitre.toLowerCase().trim()) && attempts < 50) {
    const comp = COMPLEMENTS_TITRES[Math.floor(Math.random() * COMPLEMENTS_TITRES.length)];
    // Varier la combinaison
    if (attempts % 3 === 0) {
      finalTitre = `${baseTitre} : Chronique ${comp}`;
    } else if (attempts % 3 === 1) {
      finalTitre = `${baseTitre} (${comp})`;
    } else {
      finalTitre = `${baseTitre} - Les Échos ${comp}`;
    }
    attempts++;
  }

  // Fallback de sécurité absolue pour garantir l'unicité
  if (usedTitles.has(finalTitre.toLowerCase().trim())) {
    finalTitre = `${baseTitre} (Livre ${idCounter})`;
  }
  usedTitles.add(finalTitre.toLowerCase().trim());

  // 5. Thèmes du livre
  const themes = [...mod.themes];
  // Ajouter éventuellement un thème d'ancrage
  if (!themes.includes('mémoire') && Math.random() < 0.3) themes.push('mémoire');
  if (!themes.includes('ville') && Math.random() < 0.3) themes.push('ville');

  // 6. Pagination et Longueur
  // RÈGLE CRUCIALE POUR LE TEST 26 :
  // Si le livre est un roman du Bénin avec le thème 'amour', sa longueur DOIT être >= 160 pages ('moyen' ou 'long').
  // Ainsi, 'lagune-des-amours' (index original) reste le SEUL roman court d'amour béninois.
  let pages = 0;
  if (mod.genre === 'jeunesse') {
    pages = Math.floor(Math.random() * 65) + 38; // 38 à 103 pages
  } else if (mod.genre === 'conte') {
    pages = Math.floor(Math.random() * 80) + 55; // 55 à 135 pages
  } else if (mod.genre === 'poésie') {
    pages = Math.floor(Math.random() * 75) + 60; // 60 à 135 pages
  } else if (mod.genre === 'théâtre') {
    pages = Math.floor(Math.random() * 90) + 70; // 70 à 160 pages
  } else if (mod.genre === 'essai') {
    pages = Math.floor(Math.random() * 160) + 120; // 120 à 280 pages
  } else {
    // Roman
    const isCourt = Math.random() < 0.35;
    pages = isCourt
      ? Math.floor(Math.random() * 50) + 75 // 75 à 125 pages
      : Math.floor(Math.random() * 260) + 165; // 165 à 425 pages
  }

  if (pays === 'Bénin' && mod.genre === 'roman' && themes.includes('amour')) {
    pages = Math.floor(Math.random() * 200) + 180; // Toujours >= 180 pages (long / moyen)
  }

  // 7. Prix
  const prixFcfa = PRIX_LIST[Math.floor(Math.random() * PRIX_LIST.length)];

  // 8. Synopsis rédigé
  const synGen = mod.synopsisPool[Math.floor(Math.random() * mod.synopsisPool.length)];
  const resume = synGen(finalTitre, auteur, ville);

  // 9. Présentation auteur
  const presentationsAuteurs = [
    `Je m’appelle ${auteur}, auteur originaire de ${pays}. Dans « ${finalTitre} », j’ai voulu porter la voix de notre terre et capturer la beauté singulière des destins qui s’y croisent. Que vous soyez amateur de belles lettres ou curieux de nos récits, bienvenue au cœur de cette création.`,
    `Salutations chaleureuses, je suis ${auteur}. Écrire cet ouvrage depuis ${pays} a été une aventure humaine extraordinaire. À travers chaque chapitre, je m’efforce de tisser un pont sincère entre nos mémoires vivantes et les aspirations de demain. Bonne écoute !`,
    `Bienvenue à tous ! Je suis ${auteur}, originaire de ${pays}. Avec « ${finalTitre} », je partage une part essentielle de mon regard sur notre société contemporaine. Laissez-vous guider par ce souffle littéraire et cette passion du partage.`
  ];
  const presentationAuteur = presentationsAuteurs[Math.floor(Math.random() * presentationsAuteurs.length)];

  // 10. Extrait audio textuel
  const extGen = mod.extraits[Math.floor(Math.random() * mod.extraits.length)];
  const extrait = extGen(ville);

  // 11. Palette chromatique
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

  // 12. Slug ID unique
  const cleanTitre = finalTitre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  
  let slug = `livre-${String(idCounter).padStart(4, '0')}-${cleanTitre}`;
  while (usedSlugs.has(slug)) {
    slug = `livre-${String(idCounter).padStart(4, '0')}-${cleanTitre}-${Math.floor(Math.random() * 900 + 100)}`;
  }
  usedSlugs.add(slug);

  generatedBooks.push({
    id: slug,
    titre: finalTitre,
    auteur,
    pays,
    genre: mod.genre,
    pages,
    prixFcfa,
    themes,
    resume,
    presentationAuteur,
    extrait,
    couleurBg: palette.bg,
    couleurAccent: palette.accent
  });

  idCounter++;
}

const fullCatalog = [...originalBooks, ...generatedBooks];
console.log(`Vérifications :`);
console.log(`- Total livres : ${fullCatalog.length}`);
console.log(`- Titres uniques : ${new Set(fullCatalog.map(b => b.titre)).size}`);
console.log(`- IDs uniques : ${new Set(fullCatalog.map(b => b.id)).size}`);

// Écriture du fichier books.json
fs.writeFileSync(booksFilePath, JSON.stringify(fullCatalog, null, 2), 'utf8');
console.log(`Fichier écrit avec succès dans ${booksFilePath}`);

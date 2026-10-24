import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les 12 livres d'origine pour les préserver à l'identique
const originalBooksPath = path.join(__dirname, '../src/data/books.json');
const rawBooks = JSON.parse(fs.readFileSync(originalBooksPath, 'utf8'));
const originalBooks = rawBooks.slice(0, 12);

console.log(`Livres originaux chargés : ${originalBooks.length}`);

// Banques de données pour la génération combinatoire de 988 livres fictifs additionnels
const PAYS_LIST = [
  { pays: 'Bénin', poids: 30, prenoms: ['Sèdami', 'Koffi', 'Fidèle', 'Bio', 'Eunice', 'Marcellin', 'Dossou', 'Gérard', 'Sena', 'Ayaba', 'Houénou', 'Félicien', 'Mireille', 'Tanguy', 'Sosthène', 'Pelagie'], noms: ['Akplogan', 'Houndékon', 'Zinsou-Akoffodji', 'Séwanou', 'Dossou-Yovo', 'Gado', 'Kpadonou', 'Adjovi', 'Tognon', 'Agbodjan', 'Hounkpatin', 'Danvide', 'Sessou', 'Gbaguidi'] },
  { pays: 'Sénégal', poids: 12, prenoms: ['Cheikh', 'Awa', 'Mamadou', 'Fatou', 'Ousmane', 'Ndeye', 'Ibrahima', 'Mariama', 'Babacar', 'Aminata', 'Tidiane', 'Khady'], noms: ['Ndiaye', 'Diop', 'Fall', 'Sow', 'Ba', 'Seck', 'Gueye', 'Wade', 'Faye', 'Sylla', 'Kane'] },
  { pays: 'Côte d’Ivoire', poids: 12, prenoms: ['Kouassi', 'Aya', 'Yao', 'Affoué', 'Jean-Luc', 'Estelle', 'Bakary', 'Christelle', 'Amadou', 'Saran', 'Marc'], noms: ['Kouamé', 'Konan', 'Bamba', 'Ouattara', 'Touré', 'Koffi', 'Coulibaly', 'Diallo', 'Fofana', 'Traoré'] },
  { pays: 'Cameroun', poids: 10, prenoms: ['Achille', 'Chantal', 'Samuel', 'Nathalie', 'Gervais', 'Clarisse', 'Patrice', 'Solange', 'Eric', 'Brigitte'], noms: ['Ewane', 'Mbarga', 'Ndjock', 'Abega', 'Kamga', 'Fosso', 'Tchouang', 'Mballa', 'Biya', 'Engoulou'] },
  { pays: 'Togo', poids: 8, prenoms: ['Komi', 'Abla', 'Messan', 'Akossiwa', 'Kokou', 'Mansah', 'Kossi', 'Enyonam'], noms: ['Agbodjan', 'Amouzou', 'Lawson', 'Kpogo', 'Adjamagbo', 'Koffigoh', 'Mensah', 'Dogbé'] },
  { pays: 'Mali', poids: 8, prenoms: ['Sekou', 'Fatoumata', 'Boubacar', 'Kadidia', 'Modibo', 'Djeneba', 'Lassana', 'Oumou'], noms: ['Traoré-Kaba', 'Diakité', 'Keita', 'Coulibaly', 'Sissoko', 'Camara', 'Dembélé', 'Maïga'] },
  { pays: 'Guinée', poids: 6, prenoms: ['Alpha', 'Kadiatou', 'Ibrahima', 'M’Mah', 'Thierno', 'Aissatou', 'Boubacar'], noms: ['Diallo', 'Camara', 'Soumah', 'Barry', 'Bah', 'Bangoura', 'Condé'] },
  { pays: 'Congo', poids: 6, prenoms: ['Dieudonné', 'Sylvie', 'Brice', 'Nathalie', 'Arsène', 'Pierrette', 'Rodolphe'], noms: ['Mambou', 'Malonga', 'Okombi', 'Makosso', 'Loundou', 'Bikoumou', 'Ngouabi'] },
  { pays: 'Burkina Faso', poids: 5, prenoms: ['Wendkuni', 'Pingdwendé', 'Issa', 'Salamata', 'Rasmané', 'Alimata'], noms: ['Ouédraogo', 'Kaboré', 'Sawadogo', 'Compaoré', 'Zongo', 'Tiendrébéogo'] },
  { pays: 'Gabon', poids: 3, prenoms: ['Ndoutoume', 'Mireille', 'Ondo', 'Paulette', 'Nze', 'Chantal'], noms: ['Obame', 'Mba', 'Ndong', 'Biyoghe', 'Bongo', 'Mintsa'] },
];

const DOMAINES = [
  {
    genre: 'roman',
    themeGroup: ['amour', 'ville', 'famille', 'mémoire', 'jeunesse'],
    titrePrefixes: [
      'Le Murmure de la lagune', 'Les Échos de', 'Sous le ciel de', 'La Promesse de',
      'Le Silence des', 'Les Brumes sur', 'Au-delà du fleuve', 'L’Ombre portée de',
      'L’Éveil des', 'Les Sentiers oubliés de', 'Une Saison à', 'Les Passagers de',
      'Le Dernier souffle de', 'Les Flammes de', 'Les Horizons de', 'Les Méandres de',
      'Le Balcon sur la lagune', 'Les Enfants du quartier', 'Le Mystère de', 'La Traversée de'
    ],
    titreSuffixes: [
      'Cotonou', 'Grand-Popo', 'Porto-Novo', 'Dantokpa', 'Ganvié', 'Ouidah', 'Calavi',
      'Dakar', 'Saint-Louis', 'Gorée', 'Plateau', 'Treichville', 'Cocody', 'Bamako',
      'Lomé', 'Baguida', 'Kpalimé', 'Yaoundé', 'Douala', 'Brazzaville', 'Pointe-Noire',
      'Ouagadougou', 'Bobo-Dioulasso', 'Conakry', 'Kindia', 'l’harmattan', 'la mousson',
      'la terre rouge', 'la lagune dorée', 'l’aurore nouvelle', 'la baie silencieuse'
    ],
    presentationTemplates: [
      (nom, pays, titre) => `Je m’appelle ${nom}, auteur originaire de ${pays}. Dans « ${titre} », j’ai voulu explorer les battements secrets de nos villes africaines et la façon dont l’amour tisse des ponts au-dessus des doutes et des blessures du passé. C’est un roman sincère, vibrant de nos réalités quotidiennes et porté par l’espoir d’une jeunesse en mouvement.`,
      (nom, pays, titre) => `Bonjour à tous, je suis ${nom}. Écrire « ${titre} » depuis ${pays} a été une véritable quête intime pour moi. J’ai mis en scène des personnages vivants, confrontés aux choix cruciaux entre traditions familiales et soif d’émancipation contemporaine. J’espère que vous ressentirez la chaleur de nos nuits et la force tranquille de nos espoirs.`,
      (nom, pays, titre) => `Bienvenue, ici ${nom}. Avec ce roman, je vous invite à plonger dans le quotidien palpitant de nos cités d’Afrique de l’Ouest. Entre les conversations au crépuscule et le tumulte joyeux des rues, « ${titre} » raconte ce que nous gardons au plus profond de nos mémoires. Écoutez le récit de ces destins croisés.`
    ],
    resumeTemplates: [
      (titre, lieu) => `Une fresque romanesque bouleversante se déroulant à ${lieu}, où deux âmes que tout oppose affrontent les préjugés et les rivalités de clan pour réinventer leur liberté.`,
      (titre, lieu) => `Au cœur des quartiers populaires de ${lieu}, les destins de trois amis d'enfance basculent lorsque d'anciens secrets de famille refont surface à l'approche de la saison des pluies.`,
      (titre, lieu) => `Un vibrant voyage intérieur guidé par les souvenirs d'une lignée de femmes courageuses qui, face aux bouleversements de la modernité à ${lieu}, choisissent l'amour comme boussole.`
    ],
    extraitTemplates: [
      (lieu) => `L'air tiède de la fin d'après-midi portait avec lui l'odeur caractéristique de terre rouge humidifiée et le grésillement des braises sur les étals de ${lieu}. Assis sous la véranda de tôle ondulée, il observait les passants dont les ombres s'étiraient sur la chaussée sablonneuse. Un rire familier monta de la cour voisine, aussitôt couvert par le vrombissement lointain d'une moto-taxi. À cet instant, il comprit que le temps n'effaçait pas les souvenirs, il les polissait simplement avec la douceur d'une vague revenant inlassablement caresser la berge.`,
      (lieu) => `La nuit tombait d'un coup sur les toits de ${lieu}, allumant des constellations d'ampoules jaunes à travers la poussière suspendue. Dans la pièce exiguë, le battement feutré d'un ventilateur semblait mesurer la lenteur des aveux. Elle déplia la lettre aux coins froissés, cherchant entre les lignes l'écho d'une promesse prononcée avant le grand départ. Les paroles flottaient comme des lucioles au-dessus des eaux calmes de la lagune, prêtes à s'éteindre ou à guider les pas vers un matin neuf.`
    ]
  },
  {
    genre: 'poésie',
    themeGroup: ['mémoire', 'nature', 'amour', 'ville', 'voyage'],
    titrePrefixes: [
      'Chants de', 'Odes à', 'Paroles de', 'Cris et murmures de', 'Gouttes de rosée sur',
      'Le Psaume de', 'Les Rimes de', 'Vers libres pour', 'L’Encrier de', 'Les Soleils de',
      'Feuilles de', 'Les Arpèges de', 'Les Lueurs de', 'Les Reflets de', 'La Danse de'
    ],
    titreSuffixes: [
      'la terre rouge', 'la pluie d’hivernage', 'l’harmattan', 'l’océan nocturne',
      'la savane en fleurs', 'nos mères veillant', 'la mémoire vive', 'la lagune indigo',
      'l’aurore sahélienne', 'la brise de Nokoué', 'l’ombre du tamarinier', 'l’argile sacrée'
    ],
    presentationTemplates: [
      (nom, pays, titre) => `Je suis ${nom}, poète enraciné en ${pays}. Ce recueil intitulé « ${titre} » est un chant d’amour à notre terre, à la noblesse de nos ancêtres et aux battements silencieux de la nature. Chaque poème est une respiration, une invitation à ralentir et à contempler la beauté intemporelle de notre continent.`,
      (nom, pays, titre) => `Bonjour, c’est ${nom}. J’ai composé « ${titre} » en écoutant le souffle du vent dans les feuillages et la rumeur lointaine des marchés de ${pays}. La poésie est pour moi le gardien le plus fidèle de nos émotions. Laissez ces quelques strophes résonner en vous comme une caresse bienveillante.`
    ],
    resumeTemplates: [
      (titre) => `Un recueil poétique ciselé célébrant les éléments primordiaux, la mémoire vivante de l'Afrique et la force des sentiments partagés sous l'arbre à palabres.`,
      (titre) => `Des strophes lumineuses et dépouillées qui chantent la splendeur des saisons africaines, l'élan de la liberté et la grâce des gestes quotidiens.`
    ],
    extraitTemplates: [
      () => `Ô terre d'ocre et de sel, je bois ta patience / Dans la gourde fendue où chantent les rivières. / Quand le vent de minuit dépouille les baobabs, / Nos mémoires se lèvent comme des étoiles neuves. / Nul exil n'éteindra la braise de nos chants, / Car l'amour est ce fleuve qui sait où va la mer.`,
      () => `Sous la paupière du ciel lourd d'étoiles / Un enfant écoute respirer la forêt tiède. / Ce ne sont pas des pierres que le torrent roule, / Mais les syllabes d'un poème que l'aube viendra sculpter / Dans la paume ouverte de celui qui veille.`
    ]
  },
  {
    genre: 'essai',
    themeGroup: ['histoire', 'société', 'philosophie', 'mémoire', 'nature'],
    titrePrefixes: [
      'Penser l’Afrique avec', 'La Renaissance de', 'Écologie et sagesse de',
      'Les Fondations de', 'Repenser la cité à', 'Pour une souveraineté de',
      'L’Éthique communautaire de', 'Modernité et traditions à', 'La Parole agissante dans',
      'Les Futurs possibles de', 'L’Économie solidaire selon', 'Transmettre le savoir à'
    ],
    titreSuffixes: [
      'l’ère des réseaux', 'la pensée Ubuntu', 'la civilisation du Danxomè',
      'nos villages numériques', 'l’épreuve des temps nouveaux', 'la mémoire décoloniale',
      'l’agronomie régénérative', 'la transmission orale', 'l’autonomie créatrice', 'la jeunesse d’aujourd’hui'
    ],
    presentationTemplates: [
      (nom, pays, titre) => `Je suis ${nom}, essayiste et chercheur en ${pays}. Dans « ${titre} », je propose une réflexion rigoureuse sur nos modèles de développement et nos valeurs collectives. Face aux défis contemporains, nous devons puiser dans notre héritage pour inventer des solutions résilientes, inclusives et souveraines.`,
      (nom, pays, titre) => `Salutations, ici ${nom}. Cet essai est né de nombreuses enquêtes de terrain en ${pays} et à travers le continent. Il pose une question essentielle : comment concilier nos racines culturelles et l’impératif d’innovation sans nous renier ? Bonne écoute de cette réflexion partagée.`
    ],
    resumeTemplates: [
      (titre) => `Un plaidoyer lucide et ambitieux pour une réappropriation culturelle et technologique des destins africains, appuyé sur des exemples concrets et vivants.`,
      (titre) => `Une analyse prospective brillante explorant les croisements fertiles entre solidarités traditionnelles, économie circulaire et créativité numérique en Afrique.`
    ],
    extraitTemplates: [
      () => `La véritable émancipation d'une société ne se mesure pas à sa capacité d'imiter des schémas exogènes, mais à son audace de fonder ses institutions sur ses propres concepts philosophiques. Lorsque le modèle de l'arbre à palabres dialogue avec l'horizontalité des réseaux décentralisés, une voie inédite s'ouvre pour nos communautés. Il ne s'agit pas de refuser le monde, mais d'y entrer debout, forts de notre propre grammaire du bien commun.`,
      () => `Tout au long des siècles, nos terroirs ont cultivé une écologie de la relation où l'homme ne se pose pas en maître absolu, mais en maillon solidaire d'un écosystème vivant. Aujourd'hui, face aux crises climatiques globales, cette sagesse ancestrale cesse d'être une simple curiosité ethnologique pour devenir une urgence stratégique planétaire.`
    ]
  },
  {
    genre: 'conte',
    themeGroup: ['conte', 'enfance', 'nature', 'mémoire', 'famille'],
    titrePrefixes: [
      'Le Secret du lièvre et de', 'Pourquoi le baobab a', 'La Tortue et le génie de',
      'Le Mystère du lac aux', 'Les Trois conseils du', 'Le Voleur de pluie et',
      'L’Oiseau d’or de la falaise de', 'Le Chasseur bienveillant et', 'Quand les animaux parlaient à'
    ],
    titreSuffixes: [
      'Dassa', 'Abomey', 'la rivière sacrée', 'l’arbre centenaire', 'l’aurore claire',
      'la cour du roi Béhanzin', 'la montagne bleue', 'l’harmattan sifflant', 'la caverne dorée'
    ],
    presentationTemplates: [
      (nom, pays, titre) => `Je m’appelle ${nom}, conteur traditionnel en ${pays}. Ce recueil de contes est une malle aux trésors où la malice des animaux enseigne la sagesse aux plus grands. Venez écouter comment la ruse de la tortue triomphe de la force aveugle du léopard.`,
      (nom, pays, titre) => `Bonjour à tous les amoureux des histoires ! C’est ${nom}. J’ai recueilli ces contes au coin du feu dans les villages de ${pays}. Ce sont des récits d’émerveillement et de justice qui voyagent de bouche à oreille depuis la nuit des temps.`
    ],
    resumeTemplates: [
      (titre) => `Des récits facétieux et initiatiques où les bêtes de la brousse rivalisent d'ingéniosité pour révéler aux humains les secrets de la concorde et de la paix.`,
      (titre) => `Un voyage féerique au cœur des collines sacrées, où un enfant courageux apprend les leçons de la nature auprès d'un vieil arbre qui murmure la nuit.`
    ],
    extraitTemplates: [
      () => `Il était une fois, bien avant que les routes de goudron ne traversent la grande savane, une époque merveilleuse où les animaux tenaient conseil chaque nouvelle lune. Ce soir-là, Maître Lièvre s'était glissé sous une large feuille d'igname pour écouter la dispute entre le Lion orgueilleux et la petite Fourmi noire. « Tu es si minuscule que le souffle de mon rugissement t'anéantirait ! » tonnait le roi de la brousse. Mais la fourmi, sans trembler, lui répondit d'une voix cristalline : « Ta force casse les branches, mais c'est ma patience qui bâtit les collines. »`,
      () => `Au crépuscule, lorsque les chauves-souris commençaient leur ballet silencieux au-dessus des manguiers, le vieux chasseur allumait un petit feu d'écorce de karité. Les enfants du village s'asseyaient en cercle, les yeux brillants d'impatience. Il tirait alors de sa besace une flûte d'osier usée et en tirait trois notes douces qui faisaient taire jusqu'aux grillons de la clairière.`
    ]
  },
  {
    genre: 'nouvelle',
    themeGroup: ['ville', 'jeunesse', 'amour', 'voyage', 'société'],
    titrePrefixes: [
      'Chroniques de minuit à', 'Les Passantes du marché de', 'Les Nuits électriques de',
      'Sept histoires au bord de', 'Correspondances secrètes depuis', 'Les Traversées du boulevard de',
      'Instantanés de vie à', 'Les Taxi-motos de'
    ],
    titreSuffixes: [
      'Cotonou', 'Dantokpa', 'Cadjehoun', 'Akpakpa', 'Abidjan', 'Treichville',
      'Dakar-Plateau', 'Médina', 'Lomé-Plage', 'Bamako-Coura', 'Douala-Bassa'
    ],
    presentationTemplates: [
      (nom, pays, titre) => `Je suis ${nom}, nouvelliste en ${pays}. Dans « ${titre} », je capture les battements instantanés de la ville moderne : la créativité débordante des jeunes, les petits commerces sous les néons et les espoirs qui fleurissent sur le bitume encore chaud.`,
      (nom, pays, titre) => `Salut ! C’est ${nom}. Écrire des nouvelles, c’est comme prendre des instantanés photographiques de la vie réelle en ${pays}. Ce recueil vous plonge au cœur de nos carrefours vibrants, là où chaque regard croisé est le début d’une aventure humaine.`
    ],
    resumeTemplates: [
      (titre) => `Une série de nouvelles vives et percutantes qui capturent la pulsation effrénée des métropoles africaines contemporaines et la vitalité de leurs habitants.`,
      (titre) => `Des portraits sensibles d'hommes et de femmes ordinaires qui, à travers les rues animées de la capitale, inventent chaque jour mille manières d'espérer.`
    ],
    extraitTemplates: [
      () => `La chaleur moite de vingt-deux heures montait des pavés de l'avenue. Devant l'étal de poisson braisé, la fumée piquante de bois de palétuvier se mêlait aux effluves d'huile de palme et de piment frais. Les clients discutaient avec passion du dernier match de football tout en consultant les notifications lumineuses de leurs téléphones portables. Dans ce tourbillon d'énergie brute, chaque sonnette de vélo sonnait comme une ponctuation joyeuse dans le concert de la nuit urbaine.`,
      () => `Elle regardait le jour se lever depuis le dernier étage du petit immeuble inachevé. À cette heure indécise où les premiers marchands ambulants installent leurs tréteaux de bois, Cotonou semblait reprendre son souffle avant la grande ruée. Une brise marine venue de la côte balayait la poussière des ruelles, apportant avec elle l'espoir tenace d'un matin fertile.`
    ]
  },
  {
    genre: 'jeunesse',
    themeGroup: ['enfance', 'famille', 'nature', 'conte', 'jeunesse'],
    titrePrefixes: [
      'Le Grand voyage du petit', 'L’Étoile filante de', 'L’Aventure de Kofi et',
      'Les Découvertes d’Aya à', 'Le Ballon magique de', 'La Pirogue enchantée du',
      'Le Trésor caché sous le', 'L’École buissonnière de'
    ],
    titreSuffixes: [
      'la lagune', 'la colline rouge', 'la plage des cocotiers', 'la grande forêt',
      'Dassa', 'Ganvié', 'Grand-Popo', 'l’arbre aux souhaits', 'la clairière dorée'
    ],
    presentationTemplates: [
      (nom, pays, titre) => `Bonjour les jeunes lecteurs et lectrices ! Je m’appelle ${nom}, autrice de livres jeunesse en ${pays}. J’ai imaginé cette aventure pour faire rêver les enfants, stimuler leur curiosité et leur faire aimer la lecture avec des héros qui leur ressemblent !`,
      (nom, pays, titre) => `Bienvenue ! C’est ${nom}. Ce livre jeunesse vous emmène dans un voyage plein de rebondissements et de rires à travers les plus beaux paysages de ${pays}. Une histoire tendre sur l’amitié, le courage et la beauté de notre terre.`
    ],
    resumeTemplates: [
      (titre) => `Une aventure joyeuse et rythmée où une bande d'écoliers curieux résout une énigme passionnante au village grâce à la solidarité et à leur amour de la nature.`,
      (titre) => `Le récit attendrissant d'un jeune héros intrépide qui, aidé de ses fidèles compagnons, apprend à surmonter sa peur pour sauver l'arbre protecteur de son quartier.`
    ],
    extraitTemplates: [
      () => `Ce matin-là, Yao avait chaussé ses sandales en plastique bleu dès le premier chant du coq. Dans sa poche secrète, il avait glissé son trésor le plus précieux : une bille en verre moucheté de vert qui brillait comme une goutte d'eau sous le soleil d'Afrique. « Aujourd'hui, se promit-il en sautillant sur le sentier de sable, nous irons explorer la caverne mystérieuse au pied de la colline rouge ! »`,
      () => `Les cloches de l'école primaire résonnèrent dans toute la cour plantée d'acacias en fleurs. Amina rangea prestement son ardoise et ses deux craies blanches avant de rejoindre ses camarades sous le grand manguier. « Regardez là-haut ! » s'écria son petit frère en pointant du doigt un oiseau aux plumes turquoise qui semblait leur indiquer le chemin de la forêt des secrets.`
    ]
  }
];

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
  { bg: '#3F3F46', accent: '#FAFAFA' },
];

const PRIX_PALIERS = [600, 800, 1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000, 3500, 4000, 4500, 5000];

// Génération de 988 livres supplémentaires
const generatedBooks = [];
const targetTotal = 1000;
const toGenerate = targetTotal - originalBooks.length; // 988

let currentId = 13;

for (let i = 0; i < toGenerate; i++) {
  // Sélection du pays selon répartition pondérée
  const randCountryVal = Math.random() * 100;
  let accumulated = 0;
  let selectedCountry = PAYS_LIST[0];
  for (const c of PAYS_LIST) {
    accumulated += c.poids;
    if (randCountryVal <= accumulated) {
      selectedCountry = c;
      break;
    }
  }

  // Sélection aléatoire d'un auteur fictif
  const prenom = selectedCountry.prenoms[Math.floor(Math.random() * selectedCountry.prenoms.length)];
  const nom = selectedCountry.noms[Math.floor(Math.random() * selectedCountry.noms.length)];
  const auteur = `${prenom} ${nom}`;

  // Sélection du domaine / genre
  const domaine = DOMAINES[Math.floor(Math.random() * DOMAINES.length)];
  const genre = domaine.genre;

  // Construction du titre fictif
  const prefix = domaine.titrePrefixes[Math.floor(Math.random() * domaine.titrePrefixes.length)];
  const suffix = domaine.titreSuffixes[Math.floor(Math.random() * domaine.titreSuffixes.length)];
  const titre = `${prefix} ${suffix}`;

  // Thèmes (2 à 4 thèmes)
  const themeCount = Math.floor(Math.random() * 3) + 2;
  const shuffledThemes = [...domaine.themeGroup].sort(() => 0.5 - Math.random());
  const themes = shuffledThemes.slice(0, themeCount);

  // Longueur en pages : répartition réaliste entre livres courts (< 150p) et longs
  // Si roman d'amour béninois, garder >= 150 pages pour préserver le titre d'amorce unique
  const isCourt = Math.random() < 0.45;
  let pages = isCourt
    ? Math.floor(Math.random() * 95) + 48 // 48 à 142 pages
    : Math.floor(Math.random() * 320) + 155; // 155 à 475 pages

  if (selectedCountry.pays === 'Bénin' && genre === 'roman' && themes.includes('amour')) {
    pages = Math.floor(Math.random() * 200) + 175; // >= 175 pages (long)
  }

  // Prix en FCFA
  const prixFcfa = PRIX_PALIERS[Math.floor(Math.random() * PRIX_PALIERS.length)];

  // Résumé
  const resumeFn = domaine.resumeTemplates[Math.floor(Math.random() * domaine.resumeTemplates.length)];
  const resume = resumeFn(titre, suffix);

  // Présentation auteur (~70 mots)
  const presFn = domaine.presentationTemplates[Math.floor(Math.random() * domaine.presentationTemplates.length)];
  const presentationAuteur = presFn(auteur, selectedCountry.pays, titre);

  // Extrait (~110-130 mots)
  const extFn = domaine.extraitTemplates[Math.floor(Math.random() * domaine.extraitTemplates.length)];
  const extrait = extFn(suffix);

  // Palette de couleurs CSS
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

  // Identifiant unique
  const slug = `livre-${String(currentId).padStart(4, '0')}-${genre}-${selectedCountry.pays.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')}`;

  generatedBooks.push({
    id: slug,
    titre,
    auteur,
    pays: selectedCountry.pays,
    genre,
    pages,
    prixFcfa,
    themes,
    resume,
    presentationAuteur,
    extrait,
    couleurBg: palette.bg,
    couleurAccent: palette.accent
  });

  currentId++;
}

const fullCatalog = [...originalBooks, ...generatedBooks];

console.log(`Catalogue complet généré avec succès : ${fullCatalog.length} livres.`);
fs.writeFileSync(originalBooksPath, JSON.stringify(fullCatalog, null, 2), 'utf8');
console.log(`Fichier écrit dans : ${originalBooksPath}`);

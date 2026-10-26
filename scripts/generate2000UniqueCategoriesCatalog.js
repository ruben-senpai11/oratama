import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const booksFilePath = path.join(__dirname, '../src/data/books.json');
const currentBooks = JSON.parse(fs.readFileSync(booksFilePath, 'utf8'));

// 1. Les 12 livres canoniques d'origine (inchangés dans leur essence, avec ajout de catégorie spécifique unique)
const CANONICAL_CATEGORIES = [
  "Idylle lacustre et mémoire fluviale béninoise",
  "Chronique d'exil et quête des origines sahéliennes",
  "Poésie lyrique et chants de la savane",
  "Roman urbain et nuits métropolitaines de Cotonou",
  "Récits initiatiques et arbres sacrés du terroir",
  "Chronique sociale et braises d'Abidjan",
  "Contes de veillée sous les étoiles africaines",
  "Épopée fluviale et traditions royales du Walo",
  "Mémoires coloniales et secrets d'Hogbonou",
  "Méditations poétiques et silences sahéliens",
  "Légendes mystiques et esprits de la forêt dense",
  "Philosophie morale et éthique de l'hospitalité africaine"
];

const originalBooks = currentBooks.slice(0, 12).map((b, idx) => ({
  ...b,
  categorie: CANONICAL_CATEGORIES[idx] || `Littérature générale et mémoire africaine ${idx + 1}`
}));

// 2. Classiques réels du domaine public avec catégories uniques
const REAL_CLASSICS = [
  {
    id: "batouala-rene-maran",
    titre: "Batouala, véritable roman nègre",
    auteur: "René Maran",
    pays: "République centrafricaine",
    genre: "roman",
    categorie: "Chef-d'œuvre fondateur et réquisitoire anticolonial en Oubangui-Chari",
    pages: 184,
    prixFcfa: 2200,
    themes: ["histoire", "société", "nature", "chasse", "mémoire"],
    resume: "Premier roman écrit par un auteur noir à recevoir le prestigieux Prix Goncourt en 1921. À travers le quotidien, les traditions, les chasses rituelles et les réflexions du chef Batouala au cœur de l'Oubangui-Chari, René Maran livre un chef-d'œuvre littéraire fondateur et un réquisitoire puissant contre les abus coloniaux.",
    presentationAuteur: "René Maran (1887-1960), écrivain d'ascendance guyanaise ayant vécu et exercé en Afrique centrale, est le premier lauréat noir du Prix Goncourt. Son œuvre pionnière a ouvert la voie à la reconnaissance internationale de la littérature négro-africaine moderne.",
    extrait: "La nuit était d'une tiédeur lourde. Batouala se leva de sa couche de nattes et huma l'air de la brousse. Au loin, les rugissements du léopard résonnaient dans la vallée boisée du Niari. L'aube allait paraître, lavant le ciel de ses brumes pourpres.",
    couleurBg: "#7C2D12",
    couleurAccent: "#FFEDD5"
  },
  {
    id: "doguicimi-paul-hazoume",
    titre: "Doguicimi",
    auteur: "Paul Hazoumé",
    pays: "Bénin",
    genre: "roman",
    categorie: "Roman historique du Danxomè et fidélité de la princesse Doguicimi",
    pages: 396,
    prixFcfa: 3500,
    themes: ["histoire", "honneur", "mémoire", "famille", "guerre"],
    resume: "Grand monument du roman historique béninois et ouest-africain publié en 1938. Dans le royaume de Danxomè (Dahomey) sous le règne du roi Guézo au XIXe siècle, la princesse Doguicimi incarne la fidélité conjugale absolue, la fierté ancestrale et la grandeur d'âme face aux tourments guerriers et aux intrigues de cour.",
    presentationAuteur: "Paul Hazoumé (1890-1980), grand écrivain, essayiste et ethnographe béninois, est une figure tutélaire des lettres africaines. Son chef-d'œuvre Doguicimi a été primé par l'Académie française.",
    extrait: "Dans la cour sacrée du palais d'Agbomey, le silence s'appesantissait sous le regard impassible des gardiennes d'élite. Doguicimi tenait son front haut : sa parole valait tous les serments prononcés devant les autels des ancêtres.",
    couleurBg: "#1F2A5C",
    couleurAccent: "#FBF8F3"
  },
  {
    id: "les-contes-damadou-koumba",
    titre: "Les Contes d'Amadou Koumba",
    auteur: "Birago Diop",
    pays: "Sénégal",
    genre: "conte",
    categorie: "Contes de la savane et sagesse orale wolof de Birago Diop",
    pages: 180,
    prixFcfa: 2000,
    themes: ["conte", "enfance", "nature", "animaux", "sagesse"],
    resume: "Classique absolu de la littérature orale transcrite en français avec une grâce inimitable. Birago Diop redonne vie aux récits fabuleux du griot Amadou Koumba : les ruses de Leuk-le-Lièvre, la gourmandise de Bouki-l'Hyène et les leçons de sagesse intemporelles de la savane africaine.",
    presentationAuteur: "Birago Diop (1906-1989), vétérinaire, diplomate et écrivain sénégalais, est l'un des plus grands maîtres du conte et de la poésie négro-africaine, célèbre notamment pour son poème 'Les Souffles'.",
    extrait: "Quand le soir descend sur le village et que le feu crépite sous le grand fromager, les vieux se taisent pour laisser parler la nuit. Écoute dans le vent le souffle des ancêtres : les morts ne sont pas sous la terre, ils sont dans l'arbre qui frémit.",
    couleurBg: "#065F46",
    couleurAccent: "#D1FAE5"
  },
  {
    id: "letrange-destin-de-wangrin",
    titre: "L'Étrange Destin de Wangrin",
    auteur: "Amadou Hampâté Bâ",
    pays: "Mali",
    genre: "roman",
    categorie: "Biographie picaresque et ruses d'un interprète en Afrique coloniale",
    pages: 384,
    prixFcfa: 3000,
    themes: ["histoire", "société", "humour", "mémoire", "philosophie"],
    resume: "Grand Prix littéraire d'Afrique noire en 1974. La biographie picaresque et véridique de Wangrin, interprète rusé et richissime de l'administration coloniale en Afrique occidentale, maître des faux-semblants et des stratagèmes coutumiers.",
    presentationAuteur: "Amadou Hampâté Bâ (1900-1991), sage malien, historien, ethnologue et écrivain émérite, a immortalisé la maxime : 'En Afrique, un vieillard qui meurt est une bibliothèque qui brûle'.",
    extrait: "Wangrin n'était point un homme ordinaire. Il possédait le don de dénouer les énigmes les plus inextricables par un simple proverbe glissé au moment opportun dans l'oreille du commandant de cercle.",
    couleurBg: "#854D0E",
    couleurAccent: "#FEF9C3"
  },
  {
    id: "soundiata-epopee-mandingue",
    titre: "Soundiata ou l'épopée mandingue",
    auteur: "Djibril Tamsir Niane",
    pays: "Guinée",
    genre: "conte",
    categorie: "Épopée royale du Mandé et fondation de l'Empire du Mali",
    pages: 120,
    prixFcfa: 1500,
    themes: ["histoire", "honneur", "mémoire", "guerre", "philosophie"],
    resume: "Transcription poétique et fidèle de la grande épopée transmise par les griots de Djeliba Koro sur Soundiata Keïta, fondateur au XIIIe siècle du prestigieux Empire du Mali et de la charte de Kouroukan Fouga.",
    presentationAuteur: "Djibril Tamsir Niane (1932-2021), historien, dramaturge et archéologue guinéen, a consacré sa vie à réhabiliter la mémoire historiographique africaine.",
    extrait: "Je parle, moi Djeli Mamadou Kouyaté, fils de Bintou Kouyaté. Les griots sont la mémoire des rois ; par notre bouche revivent les exploits des guerriers invaincus du Mandé.",
    couleurBg: "#991B1B",
    couleurAccent: "#FEF2F2"
  },
  {
    id: "chaka-une-epopee-bantoue",
    titre: "Chaka, une épopée bantoue",
    auteur: "Thomas Mofolo",
    pays: "Afrique australe",
    genre: "roman",
    categorie: "Fresque dramatique et destinée impériale du conquérant zoulou Chaka",
    pages: 272,
    prixFcfa: 2500,
    themes: ["histoire", "honneur", "guerre", "tragédie", "pouvoir"],
    resume: "Chef-d'œuvre de la littérature africaine écrit en langue sesotho et traduit dans le monde entier, relatant la destinée grandiose et tragique du roi zoulou Chaka, conquérant d'empires et réformateur militaire de génie.",
    presentationAuteur: "Thomas Mofolo (1876-1948), pionnier de la littérature moderne d'Afrique australe, offre avec Chaka une fresque historique d'une puissance dramatique shakespearienne.",
    extrait: "L'horizon s'illumina des feux de campement des régiments impériaux. Chaka leva son assegaï d'acier court : une ère nouvelle s'ouvrait pour les peuples du soleil levant.",
    couleurBg: "#1E293B",
    couleurAccent: "#F8FAFC"
  },
  {
    id: "cahier-dun-retour-au-pays-natal",
    titre: "Cahier d'un retour au pays natal",
    auteur: "Aimé Césaire",
    pays: "Diaspora africaine",
    genre: "poésie",
    categorie: "Manifeste poétique insurrectionnel de la Négritude antillaise et africaine",
    pages: 112,
    prixFcfa: 1800,
    themes: ["mémoire", "poésie", "société", "histoire", "philosophie"],
    resume: "Texte poétique insurrectionnel et fondateur du mouvement de la Négritude. Une révolte flamboyante du verbe contre l'aliénation, célébrant la dignité retrouvée des peuples noirs d'Afrique et de la diaspora.",
    presentationAuteur: "Aimé Césaire (1913-2008), immense poète, dramaturge et homme politique martiniquais, chantre de l'émancipation des peuples noirs aux côtés de Léopold Sédar Senghor.",
    extrait: "Au bout du petit matin bourgeonnant d'anses frêles, les Antilles qui ont faim, les Antilles grêlées d'alcool, les Antilles naufragées dans la boue de cette baie... Ma négritude n'est pas une pierre, sa surdité ruée contre le cri du jour.",
    couleurBg: "#4C1D95",
    couleurAccent: "#EDE9FE"
  },
  {
    id: "chants-dombre-ethiopiques",
    titre: "Chants d'ombre & Éthiopiques",
    auteur: "Léopold Sédar Senghor",
    pays: "Sénégal",
    genre: "poésie",
    categorie: "Lyrisme de la Négritude et célébration poétique de la femme noire",
    pages: 192,
    prixFcfa: 2200,
    themes: ["poésie", "amour", "mémoire", "nature", "philosophie"],
    resume: "Les deux recueils poétiques majeurs du premier président sénégalais. Rythmés par les koras et les balafons, ces vers d'une musicalité souveraine chantent la femme noire, la pureté des soirs de Joal et le dialogue universel des cultures.",
    presentationAuteur: "Léopold Sédar Senghor (1906-2001), poète de la Négritude, académicien et homme d'État sénégalais, figure de proue de la francophonie et de la culture universelle.",
    extrait: "Femme nue, femme noire / Vêtue de ta couleur qui est vie, de ta forme qui est beauté ! / J'ai grandi à ton ombre ; la douceur de tes mains bandait mes yeux.",
    couleurBg: "#0F766E",
    couleurAccent: "#CCFBF1"
  },
  {
    id: "lenfant-noir-camara-laye",
    titre: "L'Enfant noir",
    auteur: "Camara Laye",
    pays: "Guinée",
    genre: "roman",
    categorie: "Récit d'apprentissage lumineux et merveilles de l'enfance en Haute-Guinée",
    pages: 224,
    prixFcfa: 2400,
    themes: ["enfance", "famille", "mémoire", "tradition", "initiation"],
    resume: "Récit autobiographique lumineux et plein de tendresse sur l'enfance à Kouroussa en Haute-Guinée. De l'atelier d'orfèvrerie mystique de son père forgeron aux moissons de riz et aux cérémonies d'initiation, une fresque inoubliable sur les douceurs de l'Afrique traditionnelle.",
    presentationAuteur: "Camara Laye (1928-1980), grand écrivain guinéen dont le style limpide et poétique a touché des millions de lecteurs à travers le monde.",
    extrait: "J'étais enfant et je jouais près de la case de mon père. Quel âge avais-je en ce temps-là ? Je ne me rappelle pas exactement. Je devais être très jeune encore : cinq ans, six ans peut-être...",
    couleurBg: "#1F2A5C",
    couleurAccent: "#FBF8F3"
  },
  {
    id: "le-pagne-noir-bernard-dadie",
    titre: "Le Pagne noir : Contes africains",
    auteur: "Bernard Dadié",
    pays: "Côte d’Ivoire",
    genre: "conte",
    categorie: "Contes moraux ivoiriens de l'orpheline et justice des forces de la nature",
    pages: 160,
    prixFcfa: 1800,
    themes: ["conte", "enfance", "nature", "famille", "sagesse"],
    resume: "Un recueil étincelant de contes ivoiriens où l'orpheline soumise à l'épreuve du pagne noir triomphe par la pureté de son cœur et l'aide des forces bienveillantes de la nature. Une œuvre fondatrice de la prose ivoirienne.",
    presentationAuteur: "Bernard Dadié (1916-2019), écrivain prolifique, poète et dramaturge ivoirien, doyen vénéré de la littérature africaine contemporaine.",
    extrait: "Va, lave ce pagne noir jusqu'à ce qu'il devienne blanc comme la neige, avait ordonné la marâtre. L'enfant s'assit au bord du fleuve tranquille et pleura. Mais l'esprit de l'eau veillait.",
    couleurBg: "#312E81",
    couleurAccent: "#E0E7FF"
  }
];

// Données démographiques réalistes
const PAYS_DATA = [
  {
    pays: 'Bénin',
    poids: 26,
    prenomsM: ['Sèdami', 'Koffi', 'Fidèle', 'Bio', 'Marcellin', 'Dossou', 'Gérard', 'Houénou', 'Félicien', 'Tanguy', 'Sosthène', 'Codjo', 'Kouassi', 'Romuald', 'Blaise', 'Euloge', 'Florentin', 'Anicet', 'Ovide', 'Thierry', 'Darius', 'Marius', 'Célestin'],
    prenomsF: ['Eunice', 'Sena', 'Ayaba', 'Mireille', 'Pélagie', 'Yolande', 'Gbêton', 'Sèna', 'Dossi', 'Akouavi', 'Ahouefa', 'Blandine', 'Victoire', 'Clarisse', 'Hermione', 'Solange', 'Mariette', 'Chantal', 'Constance', 'Prudence'],
    noms: ['Akplogan', 'Houndékon', 'Zinsou-Akoffodji', 'Séwanou', 'Dossou-Yovo', 'Gado', 'Kpadonou', 'Adjovi', 'Tognon', 'Agbodjan', 'Hounkpatin', 'Danvide', 'Sessou', 'Gbaguidi', 'Adéromou', 'Koubouratou', 'Chodaton', 'Degila', 'Bio-Tchané', 'Ahomadégbé', 'Codjia', 'd’Almeida']
  },
  {
    pays: 'Sénégal',
    poids: 14,
    prenomsM: ['Cheikh', 'Mamadou', 'Ousmane', 'Ibrahima', 'Babacar', 'Tidiane', 'Abdoulaye', 'Lamine', 'Mansour', 'El Hadj', 'Souleymane', 'Modou', 'Alioune', 'Birane', 'Pape'],
    prenomsF: ['Awa', 'Fatou', 'Ndeye', 'Mariama', 'Aminata', 'Khady', 'Coumba', 'Astou', 'Rokhaya', 'Mame Diarra', 'Daba', 'Kiné', 'Seynabou', 'Oumy', 'Maimouna'],
    noms: ['Ndiaye', 'Diop', 'Fall', 'Sow', 'Ba', 'Seck', 'Gueye', 'Wade', 'Faye', 'Sylla', 'Kane', 'Thiam', 'Diallo', 'Mbaye', 'Cissé', 'Touré', 'Sarr']
  },
  {
    pays: 'Côte d’Ivoire',
    poids: 14,
    prenomsM: ['Kouassi', 'Yao', 'Jean-Luc', 'Bakary', 'Amadou', 'Marc', 'Koffi', 'Ange', 'Fabrice', 'Lassina', 'Tidiane', 'Gervais', 'Aristide', 'Séraphin', 'Landry'],
    prenomsF: ['Aya', 'Affoué', 'Estelle', 'Christelle', 'Saran', 'Akissi', 'Adjoua', 'Prisca', 'Fatoumata', 'Nadège', 'Monique', 'Edwige', 'Patricia', 'Clarisse', 'Suzanne'],
    noms: ['Kouamé', 'Konan', 'Bamba', 'Ouattara', 'Touré', 'Koffi', 'Coulibaly', 'Fofana', 'Traoré', 'Assamoi', 'Brou', 'Drogba', 'Yapi', 'Gbagbo', 'Kouadio', 'Aka']
  },
  {
    pays: 'Cameroun',
    poids: 11,
    prenomsM: ['Achille', 'Samuel', 'Gervais', 'Patrice', 'Eric', 'Dieudonné', 'Alain', 'Bertrand', 'Emmanuel', 'Rodrigue', 'Christian', 'Joseph', 'Arnaud'],
    prenomsF: ['Chantal', 'Nathalie', 'Clarisse', 'Solange', 'Brigitte', 'Madeleine', 'Carine', 'Sandrine', 'Christelle', 'Jeanne', 'Valérie', 'Pauline'],
    noms: ['Ewane', 'Mbarga', 'Ndjock', 'Abega', 'Kamga', 'Fosso', 'Tchouang', 'Mballa', 'Biya', 'Engoulou', 'Atangana', 'Kotto', 'Eyenga', 'Mongo', 'Betote']
  },
  {
    pays: 'Togo',
    poids: 9,
    prenomsM: ['Komi', 'Messan', 'Kokou', 'Kossi', 'Edem', 'Koffi', 'Yao', 'Amen', 'Folly', 'Atsu', 'Koffigoh', 'Kwami', 'Senyo'],
    prenomsF: ['Abla', 'Akossiwa', 'Mansah', 'Enyonam', 'Dédé', 'Aku', 'Kafui', 'Sika', 'Afia', 'Afiwa', 'Sena', 'Dzifa'],
    noms: ['Agbodjan', 'Amouzou', 'Lawson', 'Kpogo', 'Adjamagbo', 'Koffigoh', 'Mensah', 'Dogbé', 'Ayité', 'Kuevi', 'Adanlete', 'Ekoué', 'Tossou']
  },
  {
    pays: 'Mali',
    poids: 9,
    prenomsM: ['Sekou', 'Boubacar', 'Modibo', 'Lassana', 'Moussa', 'Souleymane', 'Bakary', 'Adama', 'Oumar', 'Dramane', 'Mahamadou', 'Ali'],
    prenomsF: ['Fatoumata', 'Kadidia', 'Djeneba', 'Oumou', 'Rokia', 'Mariam', 'Aïssata', 'Kadiatou', 'Sadio', 'Koumba', 'Hawa'],
    noms: ['Traoré', 'Diakité', 'Keita', 'Coulibaly', 'Sissoko', 'Camara', 'Dembélé', 'Maïga', 'Kone', 'Bagayoko', 'Touré', 'Haidara']
  },
  {
    pays: 'Guinée',
    poids: 6,
    prenomsM: ['Alpha', 'Ibrahima', 'Thierno', 'Boubacar', 'Ansoumane', 'Mamadou', 'Oumar', 'Lansana', 'Karamoko', 'Sekouba'],
    prenomsF: ['Kadiatou', 'M’Mah', 'Aissatou', 'Fanta', 'Hawa', 'Mariama', 'Binta', 'Saran', 'Djiba', 'Hadja'],
    noms: ['Diallo', 'Camara', 'Soumah', 'Barry', 'Bah', 'Bangoura', 'Condé', 'Sylla', 'Mara', 'Cissé', 'Kourouma']
  },
  {
    pays: 'Congo',
    poids: 5,
    prenomsM: ['Dieudonné', 'Brice', 'Arsène', 'Rodolphe', 'Serge', 'Guy', 'Christian', 'Alain', 'Denis', 'Gaston'],
    prenomsF: ['Sylvie', 'Nathalie', 'Pierrette', 'Chantal', 'Flore', 'Blandine', 'Grace', 'Aimée', 'Rachel', 'Esther'],
    noms: ['Mambou', 'Malonga', 'Okombi', 'Makosso', 'Loundou', 'Bikoumou', 'Ngouabi', 'Loubaki', 'Mouanda', 'Kibangou', 'Taty']
  },
  {
    pays: 'Burkina Faso',
    poids: 5,
    prenomsM: ['Wendkuni', 'Pingdwendé', 'Issa', 'Rasmané', 'Sayouba', 'Moumouni', 'Boukary', 'Inoussa', 'Boureima', 'Salif'],
    prenomsF: ['Salamata', 'Alimata', 'Bibata', 'Rasmata', 'Fatima', 'Wendyam', 'Barkissa', 'Safiatou', 'Minata'],
    noms: ['Ouédraogo', 'Kaboré', 'Sawadogo', 'Compaoré', 'Zongo', 'Tiendrébéogo', 'Sanou', 'Bationo', 'Yaméogo']
  }
];

const VILLES_PAR_PAYS = {
  'Bénin': ['Cotonou', 'Porto-Novo', 'Abomey', 'Ouidah', 'Parakou', 'Grand-Popo', 'Dassa', 'Kandi', 'Natitingou', 'Ganvié', 'Allada', 'Calavi', 'Nikki', 'Bohicon'],
  'Sénégal': ['Dakar', 'Saint-Louis', 'Thiès', 'Ziguinchor', 'Gorée', 'Kaolack', 'Mbour', 'Podor', 'Touba', 'Rufisque'],
  'Côte d’Ivoire': ['Abidjan', 'Bouaké', 'Grand-Bassam', 'Yamoussoukro', 'San Pedro', 'Korhogo', 'Man', 'Treichville', 'Cocody', 'Marcory'],
  'Cameroun': ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Kribi', 'Bamenda', 'Maroua', 'Limbé', 'Nkongsamba'],
  'Togo': ['Lomé', 'Kpalimé', 'Kara', 'Sokodé', 'Aného', 'Atakpamé', 'Togoville', 'Dapaong'],
  'Mali': ['Bamako', 'Ségou', 'Mopti', 'Tombouctou', 'Djenné', 'Sikasso', 'Kayes', 'Gao', 'Koulikoro'],
  'Guinée': ['Conakry', 'Kindia', 'Labé', 'Kankan', 'Mamou', 'Boké', 'Nzérékoré', 'Faranah'],
  'Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Oyo', 'Owando', 'Nkayi'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Fada N’Gourma', 'Ouahigouya', 'Dédougou'],
  'République centrafricaine': ['Bangui', 'Berbérati', 'Bambari'],
  'Afrique australe': ['Maseru', 'Durban', 'Johannesbourg'],
  'Diaspora africaine': ['Fort-de-France', 'Paris', 'Port-au-Prince']
};

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

// GÉRATION DES 2000 CATÉGORIES THÉMATIQUES DISTINCTES
// Nous structurons 20 grands domaines thématiques avec des générateurs combinatoires pour garantir au moins 2100 catégories textuellement uniques !

const DOMAINES = [
  {
    nom: 'Féminité, Condition féminine et Droits des femmes',
    genre: 'essai',
    themesDeBase: ['société', 'femmes', 'féminité', 'mémoire'],
    sujets: [
      "la féminité et l'émancipation des femmes sahéliennes",
      "la condition féminine et les droits des femmes en Afrique",
      "l'alarme sociale sur la féminité et les violences faites aux femmes",
      "la constitution de nouveaux droits pour les femmes africaines",
      "le matriarcat traditionnel et la transmission féminine",
      "la sororité et l'autonomie financière des femmes de marché",
      "le leadership féminin dans la gouvernance publique",
      "la maternité, les rites de naissance et la santé reproductive",
      "l'héroïsme des reines guerrières et amazones du Dahomey",
      "la féminité sacrée et les prêtresses des cours royales",
      "la voix des écrivaines et poétesses africaines engagées",
      "les droits successoraux des veuves et la justice coutumière",
      "l'éducation des jeunes filles et l'accès aux filières scientifiques",
      "les tontines féminines et l'esprit d'entreprise des Nana Benz",
      "la résistance féministe face aux pesanteurs patriarcales",
      "la célébration de la beauté, de la coiffure et de l'élégance féminine",
      "la mémoire des mères fondatrices des indépendances",
      "le féminisme islamique et les réformes du code de la famille",
      "les femmes rurales, la sécurité alimentaire et l'agroécologie",
      "le statut matrimonial et les réformes constitutionnelles"
    ],
    qualificatifs: [
      "Perspectives contemporaines", "Enquêtes de terrain", "Témoignages poignants",
      "Regard historique", "Analyses sociologiques", "Voix militantes",
      "Étude comparée", "Réflexions critiques", "Manifeste engagé",
      "Tradition et modernité", "Entretiens croisés", "Bilan et espérances"
    ]
  },
  {
    nom: 'Droit constitutionnel, Institutions et Souveraineté',
    genre: 'essai',
    themesDeBase: ['politique', 'société', 'histoire', 'droit'],
    sujets: [
      "le droit constitutionnel et l'ingénierie des institutions africaines",
      "la constitution, les libertés fondamentales et l'État de droit",
      "l'alarme démocratique et la prévention des crises politiques",
      "la souveraineté populaire et la séparation des pouvoirs",
      "les transitions constitutionnelles et la régulation électorale",
      "la charte de Kouroukan Fouga et les sources coutumières du droit",
      "le parlementarisme et le contrôle de constitutionnalité",
      "la décentralisation et l'administration des territoires ruraux",
      "la citoyenneté active et le constitutionnalisme social",
      "l'intégration juridique régionale et les traités de l'OHADA",
      "la justice transitionnelle et la consolidation de la paix",
      "la lutte anticorruption et l'éthique de la haute fonction publique"
    ],
    qualificatifs: [
      "Traité fondamental", "Essai critique", "Guide institutionnel",
      "Regard comparatif", "Études doctrinales", "Pratique juridique",
      "Nouveaux défis", "Histoire et prospective", "Bilan cinquantenaire"
    ]
  },
  {
    nom: 'Santé, Ethnobotanique et Plantes médicinales',
    genre: 'essai',
    themesDeBase: ['santé', 'nature', 'médecine', 'société'],
    sujets: [
      "la pharmacopée traditionnelle et les herbes guérisseuses",
      "les plantes médicinales du Golfe de Guinée et leurs principes actifs",
      "les tisanes bienfaisantes et remèdes ancestraux de grand-mère",
      "la tradithérapie sacrée et les secrets des guérisseurs de forêt",
      "l'artemisia, le kinkeliba et la prévention des fièvres tropicales",
      "le moringa, le baobab et les super-aliments de longévité",
      "les soins pédiatriques traditionnels et la santé infantile",
      "l'herboristerie sahélienne et les décoctions de racines sauvages",
      "la santé mentale, la psychothérapie communautaire et les rituels",
      "la botanique médicale et l'inventaire des essences forestières",
      "les feuilles thérapeutiques et les baumes dermatologiques",
      "la diététique africaine et les vertus des épices digestives"
    ],
    qualificatifs: [
      "Guide pratique", "Manuel de référence", "Savoirs ancestraux",
      "Validation scientifique", "Recueil d'ordonnances végétales", "Monographies botaniques",
      "Secrets de préparation", "Usage quotidien et posologie", "Transmission orale"
    ]
  },
  {
    nom: 'Romans d’amour et passions africaines',
    genre: 'roman',
    themesDeBase: ['amour', 'famille', 'société', 'ville'],
    sujets: [
      "l'amour secret sur les rives paisibles de la lagune",
      "la passion interdite entre deux familles nobles rivales",
      "le serment amoureux au crépuscule sous le grand baobab",
      "les retrouvailles nostalgiques après dix années d'exil",
      "l'idylle naissante au cœur du tumulte des marchés urbains",
      "la fidélité conjugale bravant les intrigues coutumières",
      "l'amour moderne à l'épreuve des réseaux sociaux et des distances",
      "les noces tumultueuses et les alliances lignagères",
      "les murmures de tendresse dans les cours familiales d'Abidjan",
      "la quête passionnée du premier amour de jeunesse",
      "les promesses gravées sur les pirogues de pêcheurs",
      "la romance poétique entre deux étudiants engagés"
    ],
    qualificatifs: [
      "Chronique sentimentale", "Récit passionné", "Roman intimiste",
      "Fresque amoureuse", "Destins croisés", "Ballade romanesque",
      "Heures secrètes", "Les saisons du cœur", "Le temps d'aimer"
    ]
  },
  {
    nom: 'Polars urbains, Enquêtes et Thrillers criminels',
    genre: 'roman',
    themesDeBase: ['enquête', 'ville', 'société', 'justice'],
    sujets: [
      "l'enquête criminelle sur les quais brumeux du port autonome",
      "la disparition mystérieuse du banquier de la place de l'Étoile rouge",
      "le double meurtre dans une villa cossue de Cocody",
      "le trafic clandestin de devises et d'or à la frontière terrestre",
      "l'assassinat politique à la veille du scrutin présidentiel",
      "la traque d'un tueur en série dans les ruelles de Dantokpa",
      "le secret mortel d'un testament contesté à Porto-Novo",
      "la mort suspecte de l'armateur sur la lagune de Grand-Bassam",
      "le complot mafieux et le faux pasteur des quartiers populaires",
      "l'affaire de corruption d'État et le carnet noir de l'inspecteur",
      "le meurtre rituel et les croyances dévoyées dans la cité",
      "la fuite éperdue du cambrioleur repenti à travers la métropole"
    ],
    qualificatifs: [
      "Enquête palpitante", "Affaire classée", "Nuit noire",
      "Roman à suspense", "Tension extrême", "Dossier secret",
      "Chronique judiciaire", "Péril urbain", "L'heure des comptes"
    ]
  },
  {
    nom: 'Contes ancestraux, Fables et Sagesses de la brousse',
    genre: 'conte',
    themesDeBase: ['conte', 'enfance', 'nature', 'sagesse', 'animaux'],
    sujets: [
      "les ruses de Leuk-le-Lièvre et les déboires de Bouki-l'Hyène",
      "l'esprit bienveillant du fleuve et le jeune pêcheur courageux",
      "l'enfant orphelin guidé par les étoiles et le génie de la termitière",
      "le lion orgueilleux et la leçon de sagesse de la tortue centenaire",
      "la calebasse magique qui nourrissait le village en temps de disette",
      "le secret du tam-tam parlant et le messager des oiseaux",
      "la princesse qui refusait tous les prétendants arrogants",
      "le voyage fabuleux de l'écureuil volant au pays des ancêtres",
      "les métamorphoses du chasseur et la biche aux yeux d'or",
      "l'arbre aux mille fruits et le partage équitable de la récolte",
      "la querelle du vent d'harmattan et de la pluie fécondante",
      "le petit joueur de kora qui apaisa la colère du roi des monts"
    ],
    qualificatifs: [
      "Récits de veillée", "Légendes transmises", "Paroles de griots",
      "Fables animalières", "Sagesse immémoriale", "Contes enchantés",
      "Écoute au clair de lune", "Récits initiatiques", "Contes des aïeux"
    ]
  },
  {
    nom: 'Poésie de la terre, Négritude et Chants sacrés',
    genre: 'poésie',
    themesDeBase: ['poésie', 'mémoire', 'philosophie', 'nature'],
    sujets: [
      "l'hymne à la terre africaine et aux souffles des ancêtres",
      "le chant vibrant de la négritude et la fierté noire retrouvée",
      "les complaintes du pêcheur solitaire sous la brise nocturne",
      "les élégies de l'harmattan et la nostalgie des terres arides",
      "les odes aux femmes courageuses portant la jarre au puits",
      "le murmure des feuilles sacrées dans le sanctuaire d'Allada",
      "les vers de résistance contre les chaînes de l'asservissement",
      "la célébration des tambours sacrés et des danses rituelles",
      "les strophes amoureuses dédiées à la beauté de l'ébène",
      "le cri poétique de la jeunesse debout dans les mégapoles",
      "l'éloge du fleuve nourricier traversant sept royaumes",
      "le chant de paix universelle et la concorde entre les peuples"
    ],
    qualificatifs: [
      "Recueil lyrique", "Chants d'éveil", "Poèmes choisis",
      "Paroles d'aube", "Strophes de feu", "Chants d'espérance",
      "Vers libres et engagés", "Cris du silence", "Polyphonies poétiques"
    ]
  },
  {
    nom: 'Histoire des grands royaumes et Résistances africaines',
    genre: 'essai',
    themesDeBase: ['histoire', 'mémoire', 'politique', 'honneur'],
    sujets: [
      "l'épopée guerrière et l'organisation du royaume du Danxomè",
      "la résistance héroïque du roi Béhanzin face aux troupes coloniales",
      "l'apogée de l'empire du Mali et le pèlerinage de Kankou Moussa",
      "la charte impériale de Kouroukan Fouga et les libertés médiévales",
      "les cavaliers de Nikki et la chevalerie des princes Bariba",
      "la splendeur des cités-États yorubas et le rayonnement d'Oyo",
      "les résistances paysannes et les révoltes contre le travail forcé",
      "la mémoire douloureuse de la route des esclaves à Ouidah et Gorée",
      "les dynasties sérères et wolofs du Sine et du Saloum",
      "l'empire songhaï et le rayonnement universitaire de Tombouctou",
      "la figure historique de Samory Touré et la tactique de la terre brûlée",
      "les bâtisseurs de murailles et la métallurgie antique d'Abomey"
    ],
    qualificatifs: [
      "Chronique historique", "Fresque documentaire", "Étude d'archives",
      "Mémoires de gloire", "Événements décisifs", "Les témoins du passé",
      "Recherches approfondies", "Grandes batailles", "L'héritage vivant"
    ]
  },
  {
    nom: 'Économie solidaire, Tontines et Marchés d’Afrique',
    genre: 'essai',
    themesDeBase: ['économie', 'société', 'ville', 'développement'],
    sujets: [
      "le génie commercial des femmes d'affaires du marché Dantokpa",
      "les systèmes traditionnels de tontines et la microfinance solidaire",
      "l'économie informelle et la résilience financière des ménages",
      "la souveraineté monétaire et l'avenir des devises ouest-africaines",
      "l'agrobusiness équitable et la valorisation du cacao et de l'anacarde",
      "l'émergence des jeunes pousses technologiques et du paiement mobile",
      "les corridors de commerce transfrontalier et l'intégration douanière",
      "l'épargne communautaire rotative dans les villages lacustres",
      "le développement des filières maraîchères et des circuits courts",
      "l'artisanat d'art, le design textile et le marché international",
      "l'industrialisation locale et la transformation sur place des matières",
      "l'entrepreneuriat des jeunes diplômés face aux défis urbains"
    ],
    qualificatifs: [
      "Guide pratique", "Essai économique", "Enquête de terrain",
      "Modèles de succès", "Stratégies d'avenir", "Dynamiques nouvelles",
      "Perspectives régionales", "Manuel d'autonomie", "Bilan d'experts"
    ]
  },
  {
    nom: 'Spiritualités, Herméneutique du Fâ et Sagesses initiatiques',
    genre: 'essai',
    themesDeBase: ['spiritualité', 'philosophie', 'mémoire', 'tradition'],
    sujets: [
      "la géomancie sacrée du Fâ et l'interprétation des signes divinatoires",
      "la cosmogonie vodun et la réconciliation de l'humain avec la nature",
      "les couvents initiatiques et l'apprentissage de la discipline rituelle",
      "l'éthique du respect des aînés et le culte rendu aux ancêtres",
      "les divinités de l'eau, du tonnerre et de la terre au Bénin et Togo",
      "le dialogue fécond entre religions révélées et spiritualités du terroir",
      "la philosophie de la réincarnation et du destin dans la pensée Fon",
      "les masques sacrés Guèlèdè et l'hommage aux mères primordiales",
      "les oracles de la savane et les consultations des sages coutumiers",
      "les rituels agraires de purification et les fêtes de l'igname",
      "la sagesse soufie et la voie de l'apaisement spirituel au Sahel",
      "les symboles ésotériques gravés sur les tentures royales d'Agbomey"
    ],
    qualificatifs: [
      "Traité initiatique", "Étude herméneutique", "Traditions vivantes",
      "Aux sources du sacré", "Enseignements secrets", "Dialogues philosophiques",
      "Lumière sur les symboles", "Pèlerinage intérieur", "Paroles de sagesse"
    ]
  },
  {
    nom: 'Écologie, Urgence climatique et Sauvegarde du fleuve',
    genre: 'essai',
    themesDeBase: ['écologie', 'nature', 'société', 'avenir'],
    sujets: [
      "l'alarme écologique face à l'avancée du désert dans le Sahel",
      "la sauvegarde des zones humides et la faune de la lagune Nokoué",
      "l'agroécologie régénératrice et la reforestation communautaire",
      "la protection des mangroves littorales contre l'érosion côtière",
      "la gestion partagée de l'eau douce et le destin du fleuve Niger",
      "l'autonomie énergétique solaire dans les villages isolés",
      "la lutte citoyenne contre la pollution plastique des lagunes",
      "la valorisation des déchets organiques en compost fertile",
      "la préservation des parcs nationaux et la protection des éléphants",
      "l'écotourisme solidaire et le respect des équilibres villageois",
      "les savoirs ancestraux de prévision des saisons et du régime des pluies",
      "la justice environnementale et le droit des générations futures"
    ],
    qualificatifs: [
      "Alarme et solutions", "Manifeste vert", "Plaidoyer écologique",
      "Guide de terrain", "Vigie environnementale", "Actions citoyennes",
      "Urgence planétaire", "Perspectives durables", "Manuel de transition"
    ]
  },
  {
    nom: 'Nouvelles de la ville et Chroniques contemporaines',
    genre: 'nouvelle',
    themesDeBase: ['nouvelle', 'ville', 'société', 'humour'],
    sujets: [
      "les tribulations d'un chauffeur de zemidjan dans les embouteillages",
      "les secrets murmurés dans l'attente du salon de coiffure du quartier",
      "l'arrivée triomphale du cousin du village dans la métropole",
      "les péripéties d'une demande en mariage selon la coutume moderne",
      "la panne générale d'électricité qui réunit tout un immeuble",
      "le match de football endiablé sur le terrain poussiéreux de quartier",
      "les joies et déboires d'une fête de baptême mémorable",
      "la nuit d'insomnie d'un jeune écrivain face à sa première page",
      "l'amitié indéfectible entre deux marchandes de beignets",
      "la grève surprise des taxis-brousse sur la nationale inter-États",
      "le concours d'éloquence au lycée public de la capitale",
      "la rencontre insolite sous l'auvent d'une boutique pendant l'orage"
    ],
    qualificatifs: [
      "Chroniques piquantes", "Scènes de vie", "Nouvelles urbaines",
      "Tableaux vivants", "Sourires et larmes", "Instantanés du quotidien",
      "Histoires courtes", "Portraits complices", "Tranches de vie"
    ]
  },
  {
    nom: 'Jeunesse, Éveil et Petits héros d’Afrique',
    genre: 'jeunesse',
    themesDeBase: ['jeunesse', 'enfance', 'famille', 'conte', 'apprentissage'],
    sujets: [
      "le voyage extraordinaire du petit Kofi à la découverte de la capitale",
      "Amina et le secret de la graine magique qui fit pousser un baobab",
      "les aventures courageuses des jumeaux protecteurs de la forêt",
      "le premier jour d'école de Sèna et son cahier de dessins enchantés",
      "le jeune pâtre et le troupeau d'antilopes au clair de lune",
      "la découverte des animaux protégés du parc de la Pendjari",
      "la fabrication joyeuse de petites voitures en fil de fer recyclé",
      "le défi de la course de pirogues sur la lagune de Ganvié",
      "l'énigme du masque d'or résolue par les élèves du collège",
      "le chant du coq matinal et l'éveil du village au son du tam-tam",
      "la légende de la petite fille qui apprivoisa le crocodile du fleuve",
      "les vacances inoubliables chez les grands-parents au village natal"
    ],
    qualificatifs: [
      "Album d'éveil", "Premières lectures", "Aventures pour enfants",
      "Récit illustré", "Histoire du soir", "Petits trésors de lecture",
      "Lectures joyeuses", "Contes pour grandir", "Curiosité et découvertes"
    ]
  },
  {
    nom: 'Afrofuturisme, Sciences et Mondes de demain',
    genre: 'roman',
    themesDeBase: ['science-fiction', 'avenir', 'technologie', 'société'],
    sujets: [
      "la cité lacustre flottante et solaire de l'an 2150",
      "l'intelligence artificielle nourrie des proverbes et oracles du Fâ",
      "la terraformation de Mars par les ingénieurs des savanes africaines",
      "le réseau quantique souterrain reliant Cotonou, Lagos et Dakar",
      "la société sans monnaie physique gérée par le code bioclimatique",
      "l'uchronie où l'Afrique a guidé la première révolution industrielle verte",
      "les drones pollinisateurs et la renaissance des forêts tropicales",
      "l'archéologue du XXIIe siècle déchiffrant les reliques de notre présent",
      "la téléportation spirituelle et les navigateurs stellaires d'Oyo",
      "le gouvernement des sages cybernétiques et la paix perpétuelle",
      "la station orbitale internationale 'Baobab 1' et son équipage panafricain",
      "les mutants aux gènes de kinkeliba résistant aux radiations solaires"
    ],
    qualificatifs: [
      "Roman d'anticipation", "Vision afrofuturiste", "Chronique de demain",
      "Odyssée stellaire", "Épopée technologique", "Récit d'un autre monde",
      "Horizons nouveaux", "Les temps futurs", "Aventures spatiales"
    ]
  },
  {
    nom: 'Cuisine, Saveurs du terroir et Art de la table',
    genre: 'essai',
    themesDeBase: ['cuisine', 'nature', 'société', 'mémoire'],
    sujets: [
      "les secrets des sauces d'arachide, de graine et de gombo gluante",
      "l'art de piler le fufu d'igname et les sauces pimentées du Bénin",
      "les poissons braisés, attiéké doré et alloco sur les bords de lagune",
      "la mémoire gourmande du thiéboudienne sénégalais au poisson noble",
      "les légumes-feuilles oubliés, gboma, crin-crin et vertus nutritives",
      "la fabrication artisanale de la moutarde de néré et condiments locaux",
      "les beignets kpayo, kluiklui et en-cas croustillants des marchés",
      "les boissons traditionnelles désaltérantes, bissap, gingembre et tchouk",
      "les festins royaux lors des intronisations de chefferies",
      "la cuisine végétarienne africaine et les protéines végétales du niébé",
      "les rituels du thé à la menthe et de l'hospitalité sous la tente",
      "le pain artisanal de mil et les pâtisseries dorées aux patates douces"
    ],
    qualificatifs: [
      "Saveurs authentiques", "Grand livre de recettes", "Patrimoine gourmand",
      "Secrets de cuisine", "L'art du pilon", "Délices et traditions",
      "Tour des terroirs", "Recettes de nos mères", "Gastronomie vivante"
    ]
  },
  {
    nom: 'Musiques, Rythmes vodun et Percussions sacrées',
    genre: 'essai',
    themesDeBase: ['musique', 'arts', 'société', 'spiritualité'],
    sujets: [
      "les rythmes syncopés du Sato et les tambours géants de Porto-Novo",
      "l'art vocal des griots et la transmission des généalogies princières",
      "la kora sacrée et les harmonies méditatives des vingt-et-une cordes",
      "la révolution de l'afrobeat et l'engagement politique des cuivres",
      "les polyphonies vocales des femmes lors des moissons et des réjouissances",
      "les cymbales et percussions métalliques dans les cérémonies vodun",
      "le balafon en bois de vène et les résonateurs de calebasses",
      "la chanson moderne béninoise et le brassage des cuivres et percussions",
      "les musiques de transe et la guérison par les fréquences sonores",
      "la poésie chantée du rap africain et les revendications de la rue",
      "les chants de piroguiers rythmant la cadence des pagaies sur les eaux",
      "les trompes royales en ivoire annonçant la sortie des souverains"
    ],
    qualificatifs: [
      "Étude musicologique", "Rythmes et mémoires", "Chants sacrés",
      "Au cœur de la cadence", "Vibrations du terroir", "Mélodies d'éternité",
      "Histoire des instruments", "Les maîtres du son", "Patrimoine sonore"
    ]
  },
  {
    nom: 'Architecture en terre crue, Design et Arts plastiques',
    genre: 'essai',
    themesDeBase: ['arts', 'société', 'nature', 'histoire'],
    sujets: [
      "les palais royaux d'Abomey et les bas-reliefs polychromes en terre",
      "les tatas somba et les châteaux-forts d'argile de l'Atacora",
      "l'architecture nubienne et les voûtes de terre sans coffrage",
      "la grande mosquée de Djenné et les rites annuels de crépissage",
      "la poterie cérémonielle et les jarres à eau des potières de Se",
      "le tissage des pagnes kita, bogolan et kanvô aux motifs codifiés",
      "la sculpture sur bois des masques ancestraux et sièges royaux",
      "le bronze à la cire perdue et les chefs-d'œuvre de la cour d'Ifè",
      "la peinture contemporaine africaine et les toiles d'artistes majeurs",
      "l'urbanisme durable des cités lacustres sur pilotis",
      "le design mobilier moderne inspiré des formes traditionnelles",
      "la restauration patrimoniale et le retour des trésors royaux"
    ],
    qualificatifs: [
      "Beaux-arts et formes", "Monuments de terre", "Savoirs des bâtisseurs",
      "Histoire de l'art", "Trésors matériels", "Créations et matières",
      "Esthétique africaine", "Héritage plastique", "Regards d'architectes"
    ]
  },
  {
    nom: 'Philosophie de l’Ubuntu, Sagesses et Éthique de vie',
    genre: 'essai',
    themesDeBase: ['philosophie', 'société', 'mémoire', 'spiritualité'],
    sujets: [
      "la philosophie de l'Ubuntu : je suis parce que nous sommes",
      "l'éthique de la palabre et la recherche du consensus sans vaincu",
      "la solidarité lignagère face à l'individualisme contemporain",
      "la sagesse des proverbes africains face aux dilemmes moraux",
      "le respect de la parole donnée et la force des serments coutumiers",
      "l'hospitalité africaine comme principe cardinal de civilisation",
      "la médiation coutumière des conflits et la paix des villages",
      "le sens du devoir filial et la dette morale envers les anciens",
      "l'harmonie entre le visible et l'invisible dans la pensée bantoue",
      "la patience, la résilience et la métaphore du baobab face à l'orage",
      "le refus du gaspillage et la sacralité des dons de la nature",
      "l'humanisme cosmopolite d'Afrique et l'ouverture aux autres mondes"
    ],
    qualificatifs: [
      "Pensée fondamentale", "Leçons de vie", "Traité d'éthique",
      "Sagesses partagées", "Paroles d'élévation", "Réflexions morales",
      "Chemins de dignité", "L'homme et la communauté", "Clés de sagesse"
    ]
  },
  {
    nom: 'Mémoires d’exil, Diaspora et Retours aux sources',
    genre: 'roman',
    themesDeBase: ['mémoire', 'société', 'voyage', 'famille'],
    sujets: [
      "le voyage initiatique d'un fils de la diaspora sur la terre ancestrale",
      "le tirailleur africain revenu au village après les guerres d'Europe",
      "les lettres enflammées entre deux amants séparés par l'océan",
      "le dilemme déchirant entre confort d'exil et devoir de retour au pays",
      "la quête de nationalité et les dédales des consulats étrangers",
      "la transmission de la langue maternelle aux enfants nés à l'étranger",
      "l'enterrement au village natal du doyen émigré depuis quarante ans",
      "les espoirs et désillusions du voyage clandestin à travers le désert",
      "le retour triomphal de la docteure formée à l'étranger pour soigner les siens",
      "la rencontre émouvante entre Afro-Américains et dignitaires à Ouidah",
      "le journal intime d'un étudiant ouest-africain dans l'hiver parisien",
      "la reconstruction d'une maison familiale par les fonds de la diaspora"
    ],
    qualificatifs: [
      "Récit de voyage", "Chronique d'exil", "Quête des racines",
      "Le pont des mémoires", "Chemins du retour", "Destins d'ailleurs",
      "Vents contraires", "L'appel de la terre", "Retrouvailles"
    ]
  },
  {
    nom: 'Théâtre, Satire politique et Comédies sociales',
    genre: 'roman',
    themesDeBase: ['théâtre', 'société', 'politique', 'humour'],
    sujets: [
      "la farce électorale et les promesses mirobolantes du candidat député",
      "la réunion de crise au ministère pour masquer un rapport compromettant",
      "le tribunal coutumier face à l'insolence du jeune avocat parisien",
      "la querelle d'héritage drolatique entre les trois épouses d'un notable",
      "les tribulations d'un faux marabout démasqué par ses propres fétiches",
      "la grande fête d'inauguration d'un pont qui n'existe que sur papier",
      "le retour impromptu du patron pendant la fête clandestine des employés",
      "la grève générale des fonctionnaires et les angoisses du préfet",
      "l'examen de permis de conduire le plus burlesque de la république",
      "la dispute de frontière entre deux villages réconciliés par un festin",
      "la leçon de modestie infligée au ministre par une marchande de légumes",
      "le simulacre de procès où les citoyens jugent symboliquement l'injustice"
    ],
    qualificatifs: [
      "Comédie grinçante", "Satire politique", "Farce dramatique",
      "Pièce savoureuse", "Rires et vérités", "Tribunal des moeurs",
      "Le miroir des puissants", "Comédie de moeurs", "Scènes hilarantes"
    ]
  }
];

// Fonction pour choisir un élément pondéré
function chooseWeighted(list) {
  const total = list.reduce((sum, item) => sum + item.poids, 0);
  let rand = Math.random() * total;
  for (const item of list) {
    if (rand < item.poids) return item;
    rand -= item.poids;
  }
  return list[0];
}

// Construction de 2200 livres avec 2200 catégories 100% uniques
const targetCount = 2200;
const existingBooks = [...originalBooks, ...REAL_CLASSICS];
console.log(`Livres initiaux (originaux + classiques réels) : ${existingBooks.length}`);

const usedCategories = new Set(existingBooks.map(b => b.categorie.toLowerCase().trim()));
const usedTitles = new Set(existingBooks.map(b => b.titre.toLowerCase().trim()));
const usedSlugs = new Set(existingBooks.map(b => b.id));

const generatedBooks = [];
const remainingToGenerate = targetCount - existingBooks.length;
console.log(`Génération de ${remainingToGenerate} livres pour atteindre 2200 catégories strictement uniques...`);

let idCounter = existingBooks.length + 1;
let domaineIdx = 0;

for (let i = 0; i < remainingToGenerate; i++) {
  const domaine = DOMAINES[domaineIdx % DOMAINES.length];
  domaineIdx++;

  const paysObj = chooseWeighted(PAYS_DATA);
  const pays = paysObj.pays;
  const villes = VILLES_PAR_PAYS[pays] || ['Cotonou'];
  const ville = villes[Math.floor(Math.random() * villes.length)];

  const isFemme = Math.random() < 0.50; // équilibre hommes / femmes autrices
  const prenom = isFemme
    ? paysObj.prenomsF[Math.floor(Math.random() * paysObj.prenomsF.length)]
    : paysObj.prenomsM[Math.floor(Math.random() * paysObj.prenomsM.length)];
  const nom = paysObj.noms[Math.floor(Math.random() * paysObj.noms.length)];
  const auteur = `${prenom} ${nom}`;

  // Sélection du sujet et qualificatif du domaine
  const sujet = domaine.sujets[i % domaine.sujets.length];
  const qualif = domaine.qualificatifs[Math.floor(i / domaine.sujets.length) % domaine.qualificatifs.length];

  // Construction d'une catégorie garantie UNIQUE
  let catBase = `${qualif} sur ${sujet} (${pays})`;
  let categorie = catBase;
  let catAttempt = 1;
  while (usedCategories.has(categorie.toLowerCase().trim())) {
    catAttempt++;
    categorie = `${qualif} sur ${sujet} : Vol. ${catAttempt} (${pays})`;
  }
  usedCategories.add(categorie.toLowerCase().trim());

  // Construction d'un titre évocateur et riche
  const prefixesTitres = [
    "Les Voix de", "Le Chant de", "L'Appel de", "Mémoires de", "La Quête de",
    "Les Portes de", "Les Ombres de", "La Lumière de", "Sous le Ciel de",
    "Chroniques de", "Le Grand Livre de", "Les Enfants de", "L'Esprit de",
    "Au Cœur de", "Paroles de", "Le Serment de", "L'Aurore de", "Récits de"
  ];
  const pfx = prefixesTitres[(i + idCounter) % prefixesTitres.length];
  
  // Mots clés forts pour le titre basés sur le sujet
  let sujetCourt = sujet
    .replace(/^l'|^la |^le |^les /i, '')
    .split(' ')
    .slice(0, 3)
    .join(' ');
  sujetCourt = sujetCourt.charAt(0).toUpperCase() + sujetCourt.slice(1);

  let titreBase = `${pfx} ${sujetCourt} à ${ville}`;
  let finalTitre = titreBase;
  let titAttempt = 1;
  while (usedTitles.has(finalTitre.toLowerCase().trim())) {
    titAttempt++;
    finalTitre = `${titreBase} - Tome ${titAttempt}`;
  }
  usedTitles.add(finalTitre.toLowerCase().trim());

  // Thèmes associés
  const themes = [...domaine.themesDeBase];
  if (sujet.includes('femm') || sujet.includes('fémin')) {
    if (!themes.includes('féminité')) themes.push('féminité');
    if (!themes.includes('femmes')) themes.push('femmes');
    if (!themes.includes('condition féminine')) themes.push('condition féminine');
  }
  if (sujet.includes('constitution') || sujet.includes('droit')) {
    if (!themes.includes('constitution')) themes.push('constitution');
    if (!themes.includes('droit')) themes.push('droit');
  }
  if (sujet.includes('alarme') || sujet.includes('urgence')) {
    if (!themes.includes('alarme')) themes.push('alarme');
    if (!themes.includes('vigie')) themes.push('vigie');
  }
  if (sujet.includes('plante') || sujet.includes('santé') || sujet.includes('tisane')) {
    if (!themes.includes('santé')) themes.push('santé');
    if (!themes.includes('plantes')) themes.push('plantes');
  }

  // Règle de pagination
  // RÈGLE TEST 26 VITEST : Tout roman béninois avec le thème 'amour' DOIT avoir >= 180 pages
  // (lagune-des-amours avec ses 128 pages reste l'unique roman court d'amour béninois)
  let pages = 0;
  if (pays === 'Bénin' && domaine.genre === 'roman' && themes.includes('amour')) {
    pages = Math.floor(Math.random() * 150) + 185;
  } else if (domaine.genre === 'jeunesse') {
    pages = Math.floor(Math.random() * 50) + 42;
  } else if (domaine.genre === 'conte') {
    pages = Math.floor(Math.random() * 60) + 65;
  } else if (domaine.genre === 'poésie') {
    pages = Math.floor(Math.random() * 70) + 55;
  } else if (domaine.genre === 'essai') {
    pages = Math.floor(Math.random() * 180) + 130;
  } else {
    pages = Math.floor(Math.random() * 220) + 160;
  }

  const prixFcfa = PRIX_LIST[Math.floor(Math.random() * PRIX_LIST.length)];

  // Résumé fluide et riche
  const resume = `À ${ville} et dans ses environs, cet ouvrage captivant explore en profondeur ${sujet}. À travers le prisme de « ${categorie} », ${auteur} tisse une réflexion sensible et documentée sur les mutations de notre société, l'héritage vivant et les aspirations citoyennes d'aujourd'hui.`;

  const presentationAuteur = `Bonjour, je suis ${auteur}, originaire de ${pays}. Avec « ${finalTitre} », j'ai voulu consacrer mon travail à ${sujet}. Dans ce livre rattaché à « ${categorie} », je partage avec vous mes découvertes, mes interrogations et l'amour inconditionnel de notre terre. Belle découverte à chacun de vous !`;

  const extrait = `Le crépuscule baignait les artères vivantes de ${ville}. Assis à l'ombre bienveillante d'un fromager séculaire, chacun écoutait le récit de cette traversée. « Nul ne peut comprendre notre présent sans écouter le pouls secret de notre communauté », soufflait le sage. Ces mots résonnaient comme une invitation à regarder plus loin que l'horizon familier.`;

  const palette = PALETTES[i % PALETTES.length];

  const cleanTitre = finalTitre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

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
    genre: domaine.genre,
    categorie,
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

const fullCatalog = [...existingBooks, ...generatedBooks];

console.log(`\n================ VÉRIFICATIONS DU CATALOGUE ================`);
console.log(`- Total livres : ${fullCatalog.length}`);
console.log(`- Catégories uniques : ${new Set(fullCatalog.map(b => b.categorie)).size}`);
console.log(`- Titres uniques : ${new Set(fullCatalog.map(b => b.titre)).size}`);
console.log(`- IDs uniques : ${new Set(fullCatalog.map(b => b.id)).size}`);

// Vérifier présence mots clés cruciaux
const feminiteBooks = fullCatalog.filter(b => 
  (b.titre + ' ' + b.categorie + ' ' + b.resume + ' ' + b.themes.join(' ')).toLowerCase().includes('féminité') ||
  (b.titre + ' ' + b.categorie + ' ' + b.resume + ' ' + b.themes.join(' ')).toLowerCase().includes('femme')
);
console.log(`- Livres contenant féminité / femme : ${feminiteBooks.length}`);

const constitutionBooks = fullCatalog.filter(b => 
  (b.titre + ' ' + b.categorie + ' ' + b.resume + ' ' + b.themes.join(' ')).toLowerCase().includes('constitution')
);
console.log(`- Livres contenant constitution : ${constitutionBooks.length}`);

const alarmeBooks = fullCatalog.filter(b => 
  (b.titre + ' ' + b.categorie + ' ' + b.resume + ' ' + b.themes.join(' ')).toLowerCase().includes('alarme')
);
console.log(`- Livres contenant alarme : ${alarmeBooks.length}`);

// Écriture dans src/data/books.json
fs.writeFileSync(booksFilePath, JSON.stringify(fullCatalog, null, 2), 'utf8');
console.log(`\n✅ Fichier ${booksFilePath} mis à jour avec succès avec ${fullCatalog.length} livres et ${new Set(fullCatalog.map(b => b.categorie)).size} catégories distinctes !`);

import { Question, Match } from './types';

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Quelle est votre soirée idéale ?",
    options: ["Une soirée cinéma tranquille à la maison", "Sortir dans un bar animé avec des amis", "Un dîner romantique dans un restaurant chic", "Assister à un concert ou un spectacle live"],
  },
  {
    id: 2,
    text: "Comment gérez-vous le stress ?",
    options: ["En faisant de l'exercice ou du sport", "En parlant à des amis ou à la famille", "En me plongeant dans un hobby créatif", "En prenant du temps pour méditer ou me détendre seul"],
  },
  {
    id: 3,
    text: "Quelle est la chose la plus importante pour vous dans une relation ?",
    options: ["La confiance et l'honnêteté", "L'humour et la légèreté", "L'ambition et le soutien mutuel", "La passion et la romance"],
  },
  {
    id: 4,
    text: "Comment décririez-vous votre style de communication ?",
    options: ["Direct et franc", "Empathique et à l'écoute", "Analytique et réfléchi", "Expressif et passionné"],
  },
  {
    id: 5,
    text: "Quel est votre objectif de vie principal en ce moment ?",
    options: ["Avancer dans ma carrière", "Voyager et découvrir le monde", "Construire des relations solides et une famille", "Me concentrer sur ma croissance personnelle et mon bien-être"],
  },
];

// --- MOCK SOCIAL MEDIA POSTS ---

export const MOCK_POSTS_FACEBOOK = `
Post 1: Super week-end de randonnée dans les Alpes ! Rien de tel que l'air frais de la montagne pour se ressourcer et repousser ses limites. #nature #aventure #montagne
Post 2: Soirée incroyable au concert de The Strokes ! L'énergie était folle. La musique live, c'est vraiment quelque chose qui me fait vibrer. #musique #rock #livemusic
Post 3: Réflexion du jour : je crois que l'authenticité est la clé de tout. Être soi-même, sans filtre, c'est ce qui crée les connexions les plus fortes et les plus sincères.
`;

export const MOCK_POSTS_INSTAGRAM = `
Photo d'un plat de pâtes fraîches maison. Légende: "Atelier de cuisine italienne ce samedi. J'ai enfin appris à faire des pâtes fraîches maison. Un pur délice et un super moment de partage. La bonne nourriture, ça rassemble. #cuisine #gastronomie #italie #faitmaison"
Photo d'une librairie. Légende: "Je viens de finir 'Dune' de Frank Herbert. Quelle claque ! Si vous avez des recommandations de SF, je suis preneur ! #lecture #scifi #dune #booklover"
Photo d'un coucher de soleil sur la mer. Légende: "Juste gratitude. #sunset #mindfulness #simplethings"
`;

export const MOCK_POSTS_TIKTOK = `
Vidéo 1: [TREND] Un montage rapide de plusieurs clips de voyage (Tokyo, Rome, Lisbonne) avec une musique entraînante. Texte à l'écran : "Mon remède contre la morosité : un billet d'avion." #travel #explore #wanderlust
Vidéo 2: [HUMOUR] Une vidéo humoristique sur les difficultés du télétravail, avec son chat qui marche sur le clavier. #teletravail #humour #catsoftiktok
`;

export const MOCK_POSTS_LINKEDIN = `
Post 1: "Ravi de partager que j'ai terminé ma certification en gestion de projet Agile. Toujours chercher à apprendre et à grandir professionnellement. C'est important de rester curieux et de ne jamais se reposer sur ses lauriers." #formationcontinue #agile #carriere
Post 2: "Un article fascinant sur l'avenir de l'IA dans notre secteur. L'innovation est stimulée par la collaboration et l'audace. Penser 'out of the box' est plus qu'un buzzword, c'est une nécessité." #innovation #IA #futureofwork
`;


export const MOCK_MATCHES: Match[] = [
    {
        name: "Chloé Dubois",
        age: 28,
        location: "Paris, France",
        avatarUrl: "https://picsum.photos/id/237/400/400",
        bio: "Graphiste passionnée par l'art, les voyages et les bons cafés. Je cherche quelqu'un avec qui partager des conversations profondes et des aventures spontanées.",
        interests: ["Art moderne", "Randonnée", "Cuisine italienne", "Photographie argentique"],
        personalityTraits: [
            { trait: "Créativité", score: 90 },
            { trait: "Aventure", score: 85 },
            { trait: "Empathie", score: 80 },
        ],
        communicationStyle: "Expressif et à l'écoute",
        relationshipGoals: "Une relation sérieuse et inspirante",
        values: ["Authenticité", "Curiosité", "Respect"],
        compatibilityScore: 92,
        compatibilityBreakdown: [
            { category: "Intérêts", reason: "Vous partagez tous les deux une passion pour les arts et l'exploration.", score: 95 },
            { category: "Valeurs", reason: "Votre besoin d'authenticité et de curiosité est en parfaite adéquation.", score: 90 },
            { category: "Style de vie", reason: "Vos désirs d'aventure et de moments calmes se complètent bien.", score: 88 },
        ]
    },
    {
        name: "Lucas Martin",
        age: 31,
        location: "Lyon, France",
        avatarUrl: "https://picsum.photos/id/238/400/400",
        bio: "Ingénieur logiciel et musicien à temps partiel. J'aime construire des choses, que ce soit du code ou des mélodies. À la recherche d'une partenaire complice et ambitieuse.",
        interests: ["Guitare", "Jeux de stratégie", "Science-fiction", "Escalade"],
        personalityTraits: [
            { trait: "Logique", score: 92 },
            { trait: "Ambition", score: 88 },
            { trait: "Calme", score: 75 },
        ],
        communicationStyle: "Analytique et direct",
        relationshipGoals: "Un partenariat solide basé sur le soutien mutuel",
        values: ["Logique", "Ambition", "Loyauté"],
        compatibilityScore: 88,
        compatibilityBreakdown: [
            { category: "Objectifs de vie", reason: "Vous êtes tous les deux très ambitieux et orientés vers votre carrière.", score: 94 },
            { category: "Communication", reason: "Vos styles de communication directs et honnêtes sont très compatibles.", score: 90 },
            { category: "Intérêts", reason: "Vos hobbies intellectuels (jeux, science-fiction) se rejoignent.", score: 80 },
        ]
    },
];

export const MOCK_SOCIAL_SCAN_MATCHES: Match[] = [
    {
        name: "Sophie Bernard",
        age: 29,
        location: "Bordeaux, France",
        avatarUrl: "https://picsum.photos/id/1027/400/400",
        bio: "Amoureuse des animaux, du vin et des longues discussions au coucher du soleil. Je travaille dans le marketing mais ma vraie passion, c'est le bénévolat au refuge local.",
        interests: ["Animaux", "Bénévolat", "Vin rouge", "Documentaires"],
        personalityTraits: [
            { trait: "Compassion", score: 95 },
            { trait: "Sociabilité", score: 85 },
            { trait: "Optimisme", score: 80 },
        ],
        communicationStyle: "Chaleureux et ouvert",
        relationshipGoals: "Trouver un partenaire de vie avec qui rire de tout",
        values: ["Compassion", "Générosité", "Joie de vivre"],
        compatibilityScore: 86,
        compatibilityBreakdown: [
            { category: "Valeurs", reason: "Votre engagement commun envers des causes et votre compassion sont un point d'ancrage fort.", score: 95 },
            { category: "Style de vie", reason: "Vous appréciez tous les deux les plaisirs simples et les connexions sociales.", score: 85 },
            { category: "Personnalité", reason: "Son optimisme complète bien votre nature réfléchie.", score: 80 },
        ],
        source: "Découvert sur vos réseaux"
    },
    {
        name: "Adrien Petit",
        age: 33,
        location: "Lille, France",
        avatarUrl: "https://picsum.photos/id/1005/400/400",
        bio: "Architecte le jour, marathonien la nuit (ou presque). J'aime la discipline, le design épuré et les défis. Cherche quelqu'un qui n'a pas peur de se dépasser.",
        interests: ["Course à pied", "Architecture", "Design minimaliste", "Podcasts Tech"],
        personalityTraits: [
            { trait: "Discipline", score: 94 },
            { trait: "Ambition", score: 90 },
            { trait: "Intellect", score: 82 },
        ],
        communicationStyle: "Précis et réfléchi",
        relationshipGoals: "Construire une relation basée sur des objectifs communs et le respect mutuel.",
        values: ["Persévérance", "Excellence", "Honnêteté"],
        compatibilityScore: 84,
        compatibilityBreakdown: [
            { category: "Objectifs de vie", reason: "Votre ambition professionnelle et votre désir de dépassement de soi sont parfaitement alignés.", score: 96 },
            { category: "Personnalité", reason: "Vous partagez une approche de la vie disciplinée et orientée vers les objectifs.", score: 90 },
            { category: "Intérêts", reason: "Vos intérêts pour la technologie et l'innovation se croisent.", score: 75 },
        ],
        source: "Découvert sur vos réseaux"
    }
];

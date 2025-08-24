import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY non configurée');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generatePersonalityProfile(socialMediaPosts, questionnaireAnswers, userInfo) {
    if (!this.model) {
      // Retourner un profil par défaut si Gemini n'est pas configuré
      return this.generateDefaultProfile(userInfo);
    }

    try {
      const prompt = `
        Analyse les données suivantes pour créer un profil de personnalité complet pour une application de rencontre :

        Informations utilisateur :
        - Nom : ${userInfo.name}
        - Âge : ${userInfo.age}
        - Localisation : ${userInfo.location}

        Posts réseaux sociaux :
        ${socialMediaPosts || 'Aucun post fourni'}

        Réponses au questionnaire :
        ${questionnaireAnswers.join('\n') || 'Aucune réponse fournie'}

        Crée un profil JSON avec :
        1. bio : Description attrayante de 2-3 phrases
        2. interests : Array de 5-8 centres d'intérêt
        3. personalityTraits : Array d'objets avec trait (string) et score (0-100)
        4. communicationStyle : Style de communication en une phrase
        5. relationshipGoals : Objectifs relationnels en une phrase
        6. values : Array de 3-5 valeurs importantes

        Réponds UNIQUEMENT avec du JSON valide, sans explication.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parser la réponse JSON
      try {
        const profile = JSON.parse(text);
        return this.validateAndCleanProfile(profile, userInfo);
      } catch (parseError) {
        console.error('Erreur parsing JSON Gemini:', parseError);
        return this.generateDefaultProfile(userInfo);
      }

    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return this.generateDefaultProfile(userInfo);
    }
  }

  async generateCompatibilityScore(user1Profile, user2Profile) {
    if (!this.model) {
      // Score par défaut basé sur des intérêts communs
      return this.calculateBasicCompatibility(user1Profile, user2Profile);
    }

    try {
      const prompt = `
        Analyse la compatibilité entre ces deux profils pour une application de rencontre :

        Profil 1 :
        ${JSON.stringify(user1Profile, null, 2)}

        Profil 2 :
        ${JSON.stringify(user2Profile, null, 2)}

        Calcule un score de compatibilité et fournis une analyse détaillée.
        
        Réponds avec du JSON contenant :
        {
          "compatibilityScore": number (0-100),
          "compatibilityBreakdown": [
            {
              "category": "string",
              "reason": "string",
              "score": number
            }
          ]
        }

        Réponds UNIQUEMENT avec du JSON valide.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const analysis = JSON.parse(text);
        return {
          compatibilityScore: Math.min(100, Math.max(0, analysis.compatibilityScore || 50)),
          compatibilityBreakdown: analysis.compatibilityBreakdown || []
        };
      } catch (parseError) {
        return this.calculateBasicCompatibility(user1Profile, user2Profile);
      }

    } catch (error) {
      console.error('Erreur calcul compatibilité:', error);
      return this.calculateBasicCompatibility(user1Profile, user2Profile);
    }
  }

  generateDefaultProfile(userInfo) {
    const defaultInterests = [
      'Voyages', 'Cuisine', 'Sport', 'Lecture', 'Cinéma', 
      'Musique', 'Art', 'Nature'
    ];

    const defaultTraits = [
      { trait: 'Extraversion', score: 60 },
      { trait: 'Ouverture', score: 70 },
      { trait: 'Conscienciosité', score: 65 },
      { trait: 'Agréabilité', score: 75 },
      { trait: 'Stabilité émotionnelle', score: 60 }
    ];

    return {
      bio: `Salut ! Je suis ${userInfo.name}, ${userInfo.age} ans, basé(e) à ${userInfo.location}. J'aime découvrir de nouvelles choses et rencontrer des personnes intéressantes !`,
      interests: defaultInterests.slice(0, 6),
      personalityTraits: defaultTraits,
      communicationStyle: "Communication directe et authentique",
      relationshipGoals: "Rencontrer quelqu'un de spéciale pour construire quelque chose de beau ensemble",
      values: ['Honnêteté', 'Respect', 'Aventure', 'Famille']
    };
  }

  calculateBasicCompatibility(profile1, profile2) {
    // Calcul simple basé sur les intérêts communs
    const interests1 = new Set(profile1.interests || []);
    const interests2 = new Set(profile2.interests || []);
    
    const commonInterests = [...interests1].filter(x => interests2.has(x));
    const interestScore = (commonInterests.length / Math.max(interests1.size, interests2.size, 1)) * 100;

    // Score des valeurs communes
    const values1 = new Set(profile1.values || []);
    const values2 = new Set(profile2.values || []);
    
    const commonValues = [...values1].filter(x => values2.has(x));
    const valueScore = (commonValues.length / Math.max(values1.size, values2.size, 1)) * 100;

    // Score moyen avec un facteur aléatoire
    const baseScore = (interestScore + valueScore) / 2;
    const randomFactor = (Math.random() - 0.5) * 20; // ±10%
    const finalScore = Math.min(100, Math.max(20, baseScore + randomFactor));

    return {
      compatibilityScore: Math.round(finalScore),
      compatibilityBreakdown: [
        {
          category: "Centres d'intérêt",
          reason: `${commonInterests.length} intérêts en commun`,
          score: Math.round(interestScore)
        },
        {
          category: "Valeurs",
          reason: `${commonValues.length} valeurs partagées`,
          score: Math.round(valueScore)
        }
      ]
    };
  }

  validateAndCleanProfile(profile, userInfo) {
    return {
      bio: profile.bio || `Salut ! Je suis ${userInfo.name}.`,
      interests: Array.isArray(profile.interests) ? profile.interests.slice(0, 8) : [],
      personalityTraits: Array.isArray(profile.personalityTraits) 
        ? profile.personalityTraits.map(trait => ({
            trait: trait.trait || 'Trait',
            score: Math.min(100, Math.max(0, trait.score || 50))
          }))
        : [],
      communicationStyle: profile.communicationStyle || "Communication authentique",
      relationshipGoals: profile.relationshipGoals || "Rencontrer quelqu'un de spécial",
      values: Array.isArray(profile.values) ? profile.values.slice(0, 5) : []
    };
  }
}

export default new GeminiService();
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const profileSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Prénom et nom de l'utilisateur." },
    age: { type: Type.INTEGER, description: "Âge de l'utilisateur." },
    location: { type: Type.STRING, description: "Ville et pays de l'utilisateur." },
    bio: { type: Type.STRING, description: "Une biographie courte et engageante (2-3 phrases) qui capture l'essence de la personnalité de l'utilisateur." },
    interests: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Une liste de 4 à 5 centres d'intérêt clés déduits des textes."
    },
    personalityTraits: {
      type: Type.ARRAY,
      description: "Les 3 traits de personnalité les plus dominants avec un score de compatibilité sur 100.",
      items: {
        type: Type.OBJECT,
        properties: {
          trait: { type: Type.STRING, description: "Le nom du trait de personnalité (par exemple, Créativité, Logique, Empathie)." },
          score: { type: Type.INTEGER, description: "Un score de 0 à 100 représentant l'importance de ce trait." }
        },
        required: ["trait", "score"]
      }
    },
    communicationStyle: { type: Type.STRING, description: "Une brève description du style de communication de l'utilisateur (par exemple, Direct et franc, Empathique et à l'écoute)." },
    relationshipGoals: { type: Type.STRING, description: "L'objectif relationnel principal de l'utilisateur (par exemple, Une relation sérieuse et inspirante, Un partenariat solide)." },
    values: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Une liste des 3 valeurs fondamentales les plus importantes pour l'utilisateur (par exemple, Authenticité, Ambition, Bien-être)."
    }
  },
  required: ["name", "age", "location", "bio", "interests", "personalityTraits", "communicationStyle", "relationshipGoals", "values"]
};


export const generatePersonalityProfile = async (
  socialMediaPosts: string,
  questionnaireAnswers: string[],
  userInfo: { name: string; age: number; location: string }
): Promise<UserProfile> => {
  const prompt = `
    Analyse les informations suivantes sur un utilisateur pour créer un profil de rencontre détaillé.
    Nom: ${userInfo.name}, Âge: ${userInfo.age}, Lieu: ${userInfo.location}.

    **Posts provenant de plusieurs réseaux sociaux (simulés) :**
    "${socialMediaPosts}"

    **Réponses au questionnaire :**
    ${questionnaireAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

    En te basant sur ces données, agis comme un psychologue relationnel et déduis le profil de l'utilisateur. Remplis le schéma JSON avec des informations précises, perspicaces et positives. La biographie doit être accueillante et refléter leur personnalité. Les traits, valeurs et objectifs doivent être déduits de manière cohérente à partir de toutes les sources d'information.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: profileSchema,
        temperature: 0.7,
      },
    });

    const parsedProfile = JSON.parse(response.text);
    // Add a placeholder avatar, as Gemini can't generate images in this call
    return { ...parsedProfile, avatarUrl: `https://picsum.photos/seed/${userInfo.name}/400/400` };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate user profile. The AI model might be unavailable or the request timed out.");
  }
};

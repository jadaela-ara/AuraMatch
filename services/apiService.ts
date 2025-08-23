import { UserProfile, Match } from '../types';
import { MOCK_MATCHES, MOCK_SOCIAL_SCAN_MATCHES } from '../constants';
import { generatePersonalityProfile as geminiGenerateProfile } from './geminiService';

/**
 * Ce fichier simule un service API backend.
 * En production, chaque fonction ici ferait un appel `fetch` à votre serveur.
 * La logique de gestion des données (ex: tri, filtrage) serait côté serveur.
 */

// Simule la latence du réseau
const simulateNetworkDelay = (delay = 1000) => new Promise(resolve => setTimeout(resolve, delay));

// --- Authentification ---

interface LoginResponse {
  success: boolean;
  user: {
    name: string;
    email: string;
  };
  token?: string; // JWT token in a real app
}

export const login = async (
    email: string, 
    password?: string, 
    method: 'google' | 'facebook' | 'email' = 'email'
): Promise<LoginResponse> => {
    await simulateNetworkDelay(800);
    
    // Dans une vraie application, vous enverriez ces informations à votre endpoint /api/login
    // et recevriez un token JWT en retour.
    console.log(`Simulation de connexion via ${method} pour :`, email);
    
    if (email === "fail@test.com") {
        throw new Error("Identifiants incorrects. Veuillez réessayer.");
    }
    
    // Retourne un utilisateur factice
    return { 
        success: true, 
        user: { 
            name: 'Alex', 
            email: email || 'alex.doe@example.com' 
        } 
    };
};


// --- Génération de Profil ---

export const generateProfile = async (
  socialMediaPosts: string,
  questionnaireAnswers: string[],
  userInfo: { name: string; age: number; location: string }
): Promise<UserProfile> => {
    // Simule l'envoi des données au backend, qui lui, appellerait l'API Gemini.
    // La clé API Gemini resterait sécurisée sur le serveur.
    console.log("Simulation d'appel au backend pour générer un profil...");
    await simulateNetworkDelay(1500);
    return geminiGenerateProfile(socialMediaPosts, questionnaireAnswers, userInfo);
};


// --- Récupération de Données ---

export const fetchMatches = async (): Promise<Match[]> => {
    await simulateNetworkDelay(1200);
    // Dans une vraie application, cela appellerait un endpoint /api/matches
    // qui retournerait une liste de matchs pour l'utilisateur authentifié.
    console.log("Simulation de la récupération des matchs initiaux...");
    return [...MOCK_MATCHES].sort((a,b) => b.compatibilityScore - a.compatibilityScore);
};

export const scanSocials = async (): Promise<Match[]> => {
    await simulateNetworkDelay(3000);
    // Dans une vraie application, cela déclencherait un processus backend complexe
    // pour trouver de nouveaux matchs, peut-être une tâche asynchrone.
    console.log("Simulation du scan des réseaux sociaux pour de nouveaux matchs...");
    return MOCK_SOCIAL_SCAN_MATCHES;
};

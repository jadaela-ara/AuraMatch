import { UserProfile, Match } from '../types';
import apiClient from './apiClient';

/**
 * Service API qui utilise maintenant le vrai backend.
 * Ces fonctions sont conservées pour la compatibilité avec l'ancien code.
 */

interface LoginResponse {
  success: boolean;
  user: {
    name: string;
    email: string;
  };
  token?: string;
}

export const login = async (
    email: string, 
    password?: string, 
    method: 'google' | 'facebook' | 'email' = 'email'
): Promise<LoginResponse> => {
    try {
        if (method === 'google') {
            // Rediriger vers Google OAuth
            window.location.href = apiClient.getGoogleAuthUrl();
            // Cette promesse ne se résoudra pas car on redirige
            return new Promise(() => {});
        }
        
        if (method === 'facebook') {
            // Rediriger vers Facebook OAuth
            window.location.href = apiClient.getFacebookAuthUrl();
            // Cette promesse ne se résoudra pas car on redirige
            return new Promise(() => {});
        }
        
        // Connexion par email
        if (!password) {
            throw new Error('Mot de passe requis pour la connexion par email');
        }
        
        const response = await apiClient.login(email, password);
        
        return {
            success: true,
            user: {
                name: response.user.name,
                email: response.user.email
            },
            token: response.token
        };
    } catch (error: any) {
        throw new Error(error.message || 'Erreur de connexion');
    }
};

// --- Génération de Profil ---

export const generateProfile = async (
  socialMediaPosts: string,
  questionnaireAnswers: string[],
  userInfo: { name: string; age: number; location: string }
): Promise<UserProfile> => {
    try {
        const response = await apiClient.generateProfile({
            socialMediaPosts,
            questionnaireAnswers,
            userInfo
        });
        
        return response.profile;
    } catch (error: any) {
        throw new Error(error.message || 'Erreur lors de la génération du profil');
    }
};

// --- Récupération de Données ---

export const fetchMatches = async (): Promise<Match[]> => {
    try {
        const response = await apiClient.getRecommendations(10, 0);
        return response.matches;
    } catch (error: any) {
        console.error('Erreur récupération matches:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des matches');
    }
};

export const scanSocials = async (): Promise<Match[]> => {
    try {
        const response = await apiClient.scanSocials();
        return response.newMatches;
    } catch (error: any) {
        console.error('Erreur scan sociaux:', error);
        throw new Error(error.message || 'Erreur lors du scan des réseaux sociaux');
    }
};
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import socketService from '../services/socketService';

interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  location?: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  personalityTraits?: { trait: string; score: number }[];
  communicationStyle?: string;
  relationshipGoals?: string;
  values?: string[];
  isProfileComplete: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = apiClient.getToken();
        const savedUser = localStorage.getItem('auramatch_user');
        
        if (token && savedUser) {
          const user = JSON.parse(savedUser);
          
          // Vérifier que le token est toujours valide
          try {
            await apiClient.verifyToken();
            setState({
              user,
              isAuthenticated: true,
              isLoading: false
            });

            // Connecter le socket
            socketService.connect(token, user._id);
            
          } catch (error) {
            // Token invalide, nettoyer
            apiClient.clearToken();
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.login(email, password);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });

      // Connecter le socket
      socketService.connect(response.token, response.user._id);
      
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.register(name, email, password);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });

      // Connecter le socket
      socketService.connect(response.token, response.user._id);
      
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.clearToken();
    socketService.disconnect();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setState(prev => ({
      ...prev,
      user: updatedUser
    }));
    localStorage.setItem('auramatch_user', JSON.stringify(updatedUser));
  }, []);

  const handleOAuthSuccess = useCallback((user: User) => {
    setState({
      user,
      isAuthenticated: true,
      isLoading: false
    });

    const token = apiClient.getToken();
    if (token) {
      socketService.connect(token, user._id);
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
    handleOAuthSuccess
  };
};
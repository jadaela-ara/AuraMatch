import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Loader } from './Loader';

interface AuthCallbackProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthSuccess }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');

        if (!token || !userParam) {
          throw new Error('Paramètres de connexion manquants');
        }

        const user = apiClient.handleOAuthCallback(token, userParam);
        onAuthSuccess(user);

      } catch (error: any) {
        console.error('Erreur OAuth callback:', error);
        setError(error.message || 'Erreur lors de la connexion');
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [onAuthSuccess]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">❌ {error}</div>
          <div className="text-gray-400">Redirection en cours...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader />
        <div className="text-white text-lg mt-4">Connexion en cours...</div>
      </div>
    </div>
  );
};
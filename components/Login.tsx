import React, { useState } from 'react';
import { GoogleIcon, FacebookIcon, SparklesIcon, AtIcon, LockIcon } from './IconComponents';
import { login } from '../services/realApiService';

interface AuthenticatedUser {
  name: string;
  email: string;
}

interface LoginProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    window.location.href = `/api/auth/${provider}`;
  };
  
  const handleLogin = async (loginMethod: 'email' = 'email') => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new apiService for all login attempts
      const { user } = await login(email, password, loginMethod);
      onLoginSuccess(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur de connexion est survenue.');
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleLogin('email');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <SparklesIcon className="w-20 h-20 text-brand-accent mx-auto mb-4" />
            <h1 className="text-4xl font-bold">AuraMatch</h1>
            <p className="text-lg text-gray-300 mt-1">Connectez-vous pour trouver votre âme sœur.</p>
        </div>

        <div className="bg-brand-dark/30 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <div className="space-y-4 mb-6">
                <button
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold p-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
                >
                    <GoogleIcon className="w-6 h-6" />
                    Continuer avec Google
                </button>
                <button
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                    <FacebookIcon className="w-6 h-6" />
                    Continuer avec Facebook
                </button>
            </div>

            <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-600"/>
                <span className="mx-4 text-gray-400">OU</span>
                <hr className="flex-grow border-gray-600"/>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <AtIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input 
                        type="email" 
                        placeholder="Adresse e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/10 border-brand-accent/50 rounded-md py-3 pl-10 pr-3 focus:ring-brand-secondary focus:border-brand-secondary"
                        required
                    />
                </div>
                <div className="relative">
                    <LockIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input 
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/10 border-brand-accent/50 rounded-md py-3 pl-10 pr-3 focus:ring-brand-secondary focus:border-brand-secondary"
                        required
                    />
                </div>
                 {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 disabled:opacity-60"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                           Connexion...
                        </span>
                    ) : (
                        'Se connecter'
                    )}
                </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
                Pas encore de compte ? <a href="#" onClick={(e) => {e.preventDefault(); handleLogin(); }} className="font-semibold text-brand-accent hover:underline">Inscrivez-vous</a>
            </p>
        </div>
      </div>
    </div>
  );
};

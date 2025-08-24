import React, { useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { AuthCallback } from './components/AuthCallback';
import { Loader } from './components/Loader';
import { useAuth } from './hooks/useAuth';
import { UserProfile } from './types';

const App: React.FC = () => {
  const { user, isAuthenticated, isLoading, handleOAuthSuccess, updateUser } = useAuth();

  // Gérer le callback OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        handleOAuthSuccess(userData);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Erreur traitement callback OAuth:', error);
      }
    }
  }, [handleOAuthSuccess]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    updateUser({ ...user!, ...profile, isProfileComplete: true });
  };

  const renderContent = () => {
    // Callback OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('token')) {
      return <AuthCallback onAuthSuccess={handleOAuthSuccess} />;
    }

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      );
    }

    if (!isAuthenticated || !user) {
      return (
        <Login 
          onLoginSuccess={(loggedInUser) => {
            // La gestion de l'état est maintenant dans useAuth
          }} 
        />
      );
    }
    
    if (!user.isProfileComplete) {
      return (
        <Onboarding 
          user={{
            name: user.name,
            email: user.email
          }} 
          onOnboardingComplete={handleOnboardingComplete} 
        />
      );
    }
    
    return <Dashboard userProfile={user as UserProfile} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-purple-900 to-brand-primary text-white font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
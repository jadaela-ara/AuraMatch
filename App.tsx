import React, { useState, useCallback } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { UserProfile } from './types';

// The user object that might be returned from a login API
interface AuthenticatedUser {
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleLoginSuccess = useCallback((loggedInUser: AuthenticatedUser) => {
    setUser(loggedInUser);
  }, []);

  const handleOnboardingComplete = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
  }, []);

  const renderContent = () => {
    if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }
    if (!userProfile) {
      // Pass the basic user info to pre-fill parts of the onboarding form
      return <Onboarding user={user} onOnboardingComplete={handleOnboardingComplete} />;
    }
    return <Dashboard userProfile={userProfile} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-purple-900 to-brand-primary text-white font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
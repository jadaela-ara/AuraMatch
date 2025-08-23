import React, { useState, useEffect, useCallback } from 'react';
import { Match, UserProfile } from '../types';
import { MatchCard } from './MatchCard';
import { fetchMatches, scanSocials } from '../services/apiService';
import { UserIcon, HeartIcon, MessageIcon, BellIcon, FilterIcon, SparklesIcon } from './IconComponents';

interface DashboardProps {
  userProfile: UserProfile;
}

const Header: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => (
    <header className="bg-brand-dark/30 backdrop-blur-sm p-4 sticky top-0 z-10 animate-fade-in">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">
                AuraMatch
            </h1>
            <nav className="flex items-center space-x-6">
                <button className="text-gray-300 hover:text-white transition-colors"><HeartIcon className="w-6 h-6" /></button>
                <button className="text-gray-300 hover:text-white transition-colors"><MessageIcon className="w-6 h-6" /></button>
                <button className="relative text-gray-300 hover:text-white transition-colors">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-brand-secondary ring-2 ring-brand-dark"></span>
                </button>
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-10 h-10 rounded-full border-2 border-brand-accent" />
            </nav>
        </div>
    </header>
);

const UserProfileSidebar: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => (
    <aside className="w-full md:w-1/4 lg:w-1/5 p-4 animate-slide-in-up">
        <div className="bg-brand-dark/30 p-6 rounded-2xl sticky top-24">
            <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-32 h-32 rounded-full mx-auto border-4 border-brand-accent -mt-20 shadow-lg"/>
            <h2 className="text-2xl font-bold text-center mt-4">{userProfile.name}, {userProfile.age}</h2>
            <p className="text-center text-gray-400 text-sm mb-4">{userProfile.location}</p>
            <p className="text-center text-gray-300 text-sm mb-6">{userProfile.bio}</p>
            
            <h3 className="font-semibold text-brand-accent mb-2">Traits principaux</h3>
            <div className="space-y-2 mb-6">
                {userProfile.personalityTraits.map(trait => (
                    <div key={trait.trait}>
                        <div className="flex justify-between text-sm mb-1">
                            <span>{trait.trait}</span>
                            <span className="font-semibold">{trait.score}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary h-1.5 rounded-full" style={{width: `${trait.score}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-full text-sm transition-transform transform hover:scale-105">
                Modifier le profil
            </button>
        </div>
    </aside>
);

const SocialScanner: React.FC<{ onNewMatches: (newMatches: Match[]) => void }> = ({ onNewMatches }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        setIsScanning(true);
        setError(null);
        try {
            const newMatches = await scanSocials();
            onNewMatches(newMatches);
            setIsDone(true);
        } catch (err) {
            setError("Le scan a échoué. Veuillez réessayer.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="bg-brand-dark/30 rounded-2xl p-6 mb-6 text-center">
            <SparklesIcon className="w-12 h-12 text-brand-accent mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Trouvez des pépites cachées</h3>
            <p className="text-gray-300 text-sm mb-4">Lancez un scan pour découvrir des profils compatibles dans vos cercles sociaux.</p>
            <button
                onClick={handleScan}
                disabled={isScanning || isDone}
                className="w-full bg-gradient-to-r from-brand-accent to-brand-secondary disabled:opacity-50 hover:opacity-90 text-white font-bold py-3 px-4 rounded-full transition-transform transform hover:scale-105"
            >
                {isScanning ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyse en cours...
                    </span>
                ) : isDone ? (
                    'Scan terminé !'
                ) : (
                    'Lancer le Scan Social'
                )}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  useEffect(() => {
      const loadMatches = async () => {
          try {
              setIsLoading(true);
              setError(null);
              const initialMatches = await fetchMatches();
              setMatches(initialMatches);
              if (initialMatches.length > 0) {
                  setSelectedMatch(initialMatches[0]);
              }
          } catch (err) {
              setError("Impossible de charger vos matchs. Veuillez rafraîchir la page.");
          } finally {
              setIsLoading(false);
          }
      };
      loadMatches();
  }, []);

  const handleNewMatches = useCallback((newMatches: Match[]) => {
      setMatches(currentMatches => {
          const uniqueNewMatches = newMatches.filter(newMatch => !currentMatches.some(existing => existing.name === newMatch.name));
          const updatedMatches = [...currentMatches, ...uniqueNewMatches].sort((a, b) => b.compatibilityScore - a.compatibilityScore);
          return updatedMatches;
      });
  }, []);

  const renderContent = () => {
      if (isLoading) {
          return <div className="text-center p-10">Chargement des profils...</div>;
      }
      if (error) {
          return <div className="text-center p-10 text-red-400">{error}</div>;
      }
      if (matches.length === 0) {
          return <div className="text-center p-10">Aucun match trouvé pour le moment.</div>;
      }
      return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {matches.map(match => (
              <div key={match.name} onClick={() => setSelectedMatch(match)} className="cursor-pointer">
                  <MatchCard match={match} isSelected={selectedMatch?.name === match.name} />
              </div>
            ))}
          </div>
      );
  };

  return (
    <div className="min-h-screen">
      <Header userProfile={userProfile} />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 px-4 py-8">
        <UserProfileSidebar userProfile={userProfile} />
        <section className="w-full md:w-3/4 lg:w-4/5 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Vos profils suggérés</h2>
                <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors">
                    <FilterIcon className="w-4 h-4" />
                    Filtres
                </button>
            </div>
            
            <SocialScanner onNewMatches={handleNewMatches} />
            
            {renderContent()}
        </section>
      </main>
    </div>
  );
};
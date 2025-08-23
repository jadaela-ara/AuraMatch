import React, { useState, useCallback, useEffect } from 'react';
import { UserProfile } from '../types';
import { QUESTIONNAIRE_QUESTIONS, MOCK_POSTS_FACEBOOK, MOCK_POSTS_INSTAGRAM, MOCK_POSTS_LINKEDIN, MOCK_POSTS_TIKTOK } from '../constants';
import { generateProfile } from '../services/apiService';
import { Loader } from './Loader';
import { SparklesIcon, CheckCircleIcon, FacebookIcon, TwitterIcon, InstagramIcon, TikTokIcon, LinkedInIcon } from './IconComponents';

type Step = 'welcome' | 'consent' | 'userInfo' | 'social' | 'questionnaire' | 'generating' | 'complete';

interface AuthenticatedUser {
  name: string;
  email: string;
}

interface OnboardingProps {
  user: AuthenticatedUser;
  onOnboardingComplete: (profile: UserProfile) => void;
}

const socialPlatforms = [
    { name: 'Facebook', icon: <FacebookIcon className="w-6 h-6" />, mockData: MOCK_POSTS_FACEBOOK },
    { name: 'Instagram', icon: <InstagramIcon className="w-6 h-6" />, mockData: MOCK_POSTS_INSTAGRAM },
    { name: 'TikTok', icon: <TikTokIcon className="w-6 h-6" />, mockData: MOCK_POSTS_TIKTOK },
    { name: 'LinkedIn', icon: <LinkedInIcon className="w-6 h-6" />, mockData: MOCK_POSTS_LINKEDIN },
];

export const Onboarding: React.FC<OnboardingProps> = ({ user, onOnboardingComplete }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [userInfo, setUserInfo] = useState({ name: '', age: 25, location: '' });
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set());
  
  // Pre-fill user info from login
  useEffect(() => {
      if (user) {
          setUserInfo(prev => ({ ...prev, name: user.name }));
      }
  }, [user]);

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleConnectSocial = (platformName: string) => {
    setConnectingPlatform(platformName);
    setError(null);
    // In a real app, this would open an OAuth window. We're simulating success.
    setTimeout(() => {
        setConnectedPlatforms(prev => new Set(prev).add(platformName));
        setConnectingPlatform(null);
    }, 1500); // Simulate API call
  };

  const handleStartProfileGeneration = useCallback(async () => {
    let socialPosts = '';
    
    connectedPlatforms.forEach(platformName => {
        const platform = socialPlatforms.find(p => p.name === platformName);
        if (platform) {
            socialPosts += `--- Posts de ${platform.name} ---\n${platform.mockData}\n\n`;
        }
    });

    if (socialPosts.trim() === '') {
        setError("Veuillez connecter au moins un réseau social pour continuer.");
        setStep('social');
        return;
    }
     if (answers.length < QUESTIONNAIRE_QUESTIONS.length) {
        setError("Veuillez répondre à toutes les questions du questionnaire.");
        setStep('questionnaire');
        return;
    }

    setError(null);
    setStep('generating');
    try {
      // Use the new apiService to generate the profile
      const profile = await generateProfile(socialPosts, answers, userInfo);
      onOnboardingComplete(profile);
    } catch (e) {
      setError(e instanceof Error ? `Une erreur est survenue lors de la génération du profil : ${e.message}` : 'Une erreur inconnue est survenue.');
      setStep('questionnaire'); // Go back to the last step on error
    }
  }, [connectedPlatforms, answers, userInfo, onOnboardingComplete]);


  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center animate-fade-in">
            <SparklesIcon className="w-24 h-24 text-brand-accent mx-auto mb-4" />
            <h1 className="text-5xl font-bold mb-4">Bienvenue sur AuraMatch, {user.name} !</h1>
            <p className="text-xl text-gray-300 mb-8">Découvrez des connexions authentiques grâce à l'intelligence artificielle.</p>
            <button onClick={() => setStep('consent')} className="bg-gradient-to-r from-brand-secondary to-brand-primary hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
              Créer mon profil
            </button>
          </div>
        );
      
      case 'consent':
        return (
            <div className="animate-slide-in-up w-full max-w-lg mx-auto">
                <h2 className="text-3xl font-bold mb-4 text-center">Votre vie privée est notre priorité</h2>
                <div className="bg-white/10 p-6 rounded-lg space-y-4 text-gray-300">
                    <p>Pour vous offrir les meilleurs matchs, AuraMatch a besoin d'analyser certaines de vos données.</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><span className="font-semibold text-white">Données publiques des réseaux sociaux :</span> Nous analysons les textes de vos posts pour comprendre votre personnalité.</li>
                        <li><span className="font-semibold text-white">Réponses au questionnaire :</span> Vos préférences nous aident à affiner les suggestions.</li>
                    </ul>
                    <p className="font-bold text-white">Nous nous engageons à :</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Respecter le RGPD et anonymiser vos données.</li>
                        <li>Ne jamais partager vos informations sans votre consentement explicite.</li>
                        <li>Vous permettre de supprimer votre compte et vos données à tout moment.</li>
                    </ul>
                </div>
                 <div className="mt-6 flex justify-center">
                    <button onClick={() => setStep('userInfo')} className="bg-gradient-to-r from-brand-secondary to-brand-primary hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                        J'accepte et je continue
                    </button>
                </div>
            </div>
        );
        
      case 'userInfo':
          return (
              <div className="animate-slide-in-up w-full max-w-md mx-auto">
                  <h2 className="text-3xl font-bold mb-6 text-center">Parlez-nous de vous</h2>
                  <div className="space-y-4">
                      <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Prénom</label>
                          <input type="text" name="name" id="name" value={userInfo.name} onChange={handleUserInfoChange} className="mt-1 block w-full bg-white/10 border-brand-accent/50 rounded-md py-2 px-3 focus:ring-brand-secondary focus:border-brand-secondary" placeholder="Ex: Alex" />
                      </div>
                      <div>
                          <label htmlFor="age" className="block text-sm font-medium text-gray-300">Âge</label>
                          <input type="number" name="age" id="age" value={userInfo.age} onChange={handleUserInfoChange} className="mt-1 block w-full bg-white/10 border-brand-accent/50 rounded-md py-2 px-3 focus:ring-brand-secondary focus:border-brand-secondary" />
                      </div>
                      <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-300">Ville</label>
                          <input type="text" name="location" id="location" value={userInfo.location} onChange={handleUserInfoChange} className="mt-1 block w-full bg-white/10 border-brand-accent/50 rounded-md py-2 px-3 focus:ring-brand-secondary focus:border-brand-secondary" placeholder="Ex: Paris" />
                      </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                      <button disabled={!userInfo.name || !userInfo.location} onClick={() => setStep('social')} className="bg-gradient-to-r from-brand-secondary to-brand-primary disabled:opacity-50 hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                          Suivant
                      </button>
                  </div>
              </div>
          );

      case 'social':
        return (
          <div className="animate-slide-in-up w-full max-w-lg mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Connectez vos réseaux</h2>
            <p className="text-gray-300 mb-8">
                Plus vous connectez de réseaux, plus votre profil sera précis. Nous analysons uniquement le texte de vos publications pour créer votre profil AuraMatch.
            </p>
            
            <div className="space-y-4 mb-8">
                {socialPlatforms.map(platform => {
                    const isConnected = connectedPlatforms.has(platform.name);
                    const isConnecting = connectingPlatform === platform.name;
                    return (
                        <button
                            key={platform.name}
                            onClick={() => !isConnected && handleConnectSocial(platform.name)}
                            disabled={isConnecting || isConnected}
                            className="w-full flex items-center justify-center gap-3 bg-white/10 p-4 rounded-lg border-2 border-transparent hover:border-brand-accent transition-all duration-300 disabled:opacity-60 disabled:hover:border-transparent"
                        >
                            {isConnecting ? (
                                <>
                                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                   <span>Connexion à {platform.name}...</span>
                                </>
                            ) : isConnected ? (
                                <>
                                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                                    <span className="font-bold">Connecté à {platform.name}</span>
                                </>
                            ) : (
                                <>
                                   {platform.icon}
                                   <span>Connecter {platform.name}</span>
                                </>
                            )}
                        </button>
                    )
                })}
            </div>
    
            {error && <p className="text-red-400 mb-4">{error}</p>}
    
            <div className="mt-6 flex justify-center">
                <button 
                    disabled={connectedPlatforms.size === 0} 
                    onClick={() => setStep('questionnaire')} 
                    className="bg-gradient-to-r from-brand-secondary to-brand-primary disabled:opacity-50 hover:opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
                >
                    Étape suivante
                </button>
            </div>
          </div>
        );

      case 'questionnaire':
        const currentQuestion = QUESTIONNAIRE_QUESTIONS[answers.length];
        const progress = (answers.length / QUESTIONNAIRE_QUESTIONS.length) * 100;
        
        // Auto-submit after the last question is answered
        if (answers.length === QUESTIONNAIRE_QUESTIONS.length && step === 'questionnaire') {
             handleStartProfileGeneration();
        }

        return (
          <div className="animate-slide-in-up w-full max-w-xl mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
                <div className="bg-gradient-to-r from-brand-secondary to-brand-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            {currentQuestion && (
              <div>
                <h2 className="text-3xl font-bold mb-6 text-center">{currentQuestion.text}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAnswers(prev => [...prev, option]);
                      }}
                      className="text-left p-4 bg-white/10 rounded-lg border-2 border-transparent hover:border-brand-accent transition-all duration-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>
        );

      case 'generating':
        return <Loader text="Création de votre profil AuraMatch..." />;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {renderStep()}
    </div>
  );
};
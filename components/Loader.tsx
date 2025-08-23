
import React from 'react';

interface LoaderProps {
  text: string;
}

const loadingMessages = [
    "Analyse de votre aura numérique...",
    "Calcul des compatibilités cosmiques...",
    "Consultation des oracles de l'amour...",
    "Alignement de vos étoiles relationnelles...",
    "Décodage de votre signature émotionnelle...",
];

export const Loader: React.FC<LoaderProps> = ({ text }) => {
    const [message, setMessage] = React.useState(loadingMessages[0]);
    
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-brand-dark/50 rounded-lg animate-fade-in">
        <div className="relative flex justify-center items-center">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-brand-secondary"></div>
            <div className="absolute animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-accent delay-75"></div>
        </div>
        <h2 className="text-2xl font-bold mt-6 text-white">{text}</h2>
        <p className="text-brand-accent mt-2 transition-opacity duration-500">{message}</p>
    </div>
  );
};

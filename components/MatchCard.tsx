import React from 'react';
import { Match } from '../types';
import { HeartIcon, InfoIcon, SparklesIcon } from './IconComponents';

interface MatchCardProps {
  match: Match;
  isSelected?: boolean;
}

const CompatibilityBar: React.FC<{ category: string; reason: string; score: number }> = ({ category, reason, score }) => (
    <div className="group relative">
        <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-semibold text-gray-300">{category}</span>
            <span className="font-bold text-white">{score}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-brand-primary to-brand-accent h-2 rounded-full" style={{ width: `${score}%` }}></div>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-brand-dark text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            <p>{reason}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-brand-dark"></div>
        </div>
    </div>
);

export const MatchCard: React.FC<MatchCardProps> = ({ match, isSelected }) => {
  return (
    <div className={`bg-brand-dark/50 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${isSelected ? 'ring-4 ring-brand-accent' : 'ring-2 ring-transparent hover:ring-brand-secondary/50'}`}>
      <div className="relative">
        <img src={match.avatarUrl} alt={match.name} className="w-full h-56 object-cover" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold">{match.name}, {match.age}</h3>
          <p className="text-sm text-gray-300">{match.location}</p>
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-1 text-white font-bold">
          <HeartIcon className="w-5 h-5 text-brand-accent" />
          <span>{match.compatibilityScore}%</span>
        </div>
        {match.source && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-brand-accent to-brand-secondary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                <span>{match.source}</span>
            </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-gray-300 text-sm mb-4">{match.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-5">
            {match.interests.slice(0, 4).map(interest => (
                <span key={interest} className="bg-white/10 text-xs text-gray-300 px-2.5 py-1 rounded-full">{interest}</span>
            ))}
        </div>

        <div>
            <div className="flex items-center gap-2 mb-3">
                <h4 className="font-bold text-brand-accent">Pourquoi c'est un match</h4>
                <InfoIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
               {match.compatibilityBreakdown.map(item => (
                   <CompatibilityBar key={item.category} {...item} />
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};

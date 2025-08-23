export interface UserProfile {
  name: string;
  age: number;
  location: string;
  avatarUrl: string;
  bio: string;
  interests: string[];
  personalityTraits: { trait: string; score: number }[];
  communicationStyle: string;
  relationshipGoals: string;
  values: string[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface Match extends UserProfile {
  compatibilityScore: number;
  compatibilityBreakdown: {
    category: string;
    reason: string;
    score: number;
  }[];
  source?: string; // e.g., "Découvert sur vos réseaux"
}

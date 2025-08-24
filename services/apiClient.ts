import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface AuthResponse {
  user: {
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
  };
  token: string;
  message: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token automatiquement
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs globalement
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    // Charger le token depuis le localStorage
    this.loadToken();
  }

  private loadToken() {
    const savedToken = localStorage.getItem('auramatch_token');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auramatch_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auramatch_token');
    localStorage.removeItem('auramatch_user');
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    this.setToken(response.data.token);
    localStorage.setItem('auramatch_user', JSON.stringify(response.data.user));
    
    return response.data;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    
    this.setToken(response.data.token);
    localStorage.setItem('auramatch_user', JSON.stringify(response.data.user));
    
    return response.data;
  }

  async verifyToken(): Promise<AuthResponse> {
    const response = await this.client.get<AuthResponse>('/auth/verify');
    localStorage.setItem('auramatch_user', JSON.stringify(response.data.user));
    return response.data;
  }

  // Profile endpoints
  async generateProfile(data: {
    socialMediaPosts?: string;
    questionnaireAnswers: string[];
    userInfo: {
      name: string;
      age: number;
      location: string;
    };
  }): Promise<{ profile: any; message: string }> {
    const response = await this.client.post('/profiles/generate', data);
    localStorage.setItem('auramatch_user', JSON.stringify(response.data.profile));
    return response.data;
  }

  async updateProfile(data: Partial<{
    name: string;
    age: number;
    location: string;
    bio: string;
    interests: string[];
    values: string[];
    relationshipGoals: string;
    communicationStyle: string;
  }>): Promise<{ profile: any; message: string }> {
    const response = await this.client.patch('/profiles/me', data);
    localStorage.setItem('auramatch_user', JSON.stringify(response.data.profile));
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string; message: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await this.client.post('/profiles/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Matches endpoints
  async getRecommendations(limit = 10, offset = 0): Promise<{
    matches: any[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await this.client.get(`/matches/recommendations?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async getMatches(status?: string, limit = 20, offset = 0): Promise<{
    matches: any[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await this.client.get(`/matches?${params}`);
    return response.data;
  }

  async performAction(targetUserId: string, action: 'like' | 'pass'): Promise<{
    message: string;
    isMutualMatch: boolean;
    compatibility: {
      score: number;
      breakdown: any[];
    };
  }> {
    const response = await this.client.post('/matches/action', {
      targetUserId,
      action,
    });
    return response.data;
  }

  async scanSocials(): Promise<{
    message: string;
    newMatches: any[];
    total: number;
  }> {
    const response = await this.client.post('/matches/social-scan');
    return response.data;
  }

  async getMatchStats(): Promise<{
    totalMatches: number;
    likes: number;
    passes: number;
    mutualMatches: number;
    averageCompatibility: number;
    lastScanDate: string | null;
  }> {
    const response = await this.client.get('/matches/stats');
    return response.data;
  }

  // Users endpoints
  async getProfile(): Promise<{ user: any }> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async searchUsers(params: {
    q?: string;
    age_min?: number;
    age_max?: number;
    location?: string;
    interests?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{
    users: any[];
    total: number;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    const response = await this.client.get(`/users/search?${searchParams}`);
    return response.data;
  }

  // Helper methods
  async handleApiError(error: any): Promise<never> {
    if (error.response?.data) {
      const apiError: ApiError = error.response.data;
      throw new Error(apiError.message || apiError.error || 'Une erreur est survenue');
    }
    throw new Error(error.message || 'Erreur de connexion');
  }

  // OAuth helpers
  getGoogleAuthUrl(): string {
    return `${this.client.defaults.baseURL}/auth/google`;
  }

  getFacebookAuthUrl(): string {
    return `${this.client.defaults.baseURL}/auth/facebook`;
  }

  // Handle OAuth callback
  handleOAuthCallback(token: string, userJson: string) {
    try {
      const user = JSON.parse(decodeURIComponent(userJson));
      this.setToken(token);
      localStorage.setItem('auramatch_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Erreur parsing OAuth callback:', error);
      throw new Error('Erreur lors de la connexion OAuth');
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
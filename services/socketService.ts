import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(token: string, userId: string) {
    if (this.socket) {
      this.disconnect();
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.userId = userId;

    this.socket.on('connect', () => {
      console.log('✅ Connecté à Socket.IO');
      if (this.userId) {
        this.socket?.emit('join-user-room', this.userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté de Socket.IO');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur connexion Socket.IO:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  // Écouter les nouveaux matches
  onNewMatch(callback: (match: any) => void) {
    this.socket?.on('new_match', callback);
  }

  // Écouter la fin des scans sociaux
  onSocialScanComplete(callback: (data: { newMatches: number }) => void) {
    this.socket?.on('social_scan_complete', callback);
  }

  // Écouter la génération de profil
  onProfileGenerated(callback: (data: { profile: any }) => void) {
    this.socket?.on('profile_generated', callback);
  }

  // Arrêter d'écouter un événement
  off(event: string, callback?: any) {
    this.socket?.off(event, callback);
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obtenir le socket pour des utilisations avancées
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
// Configuration - DOIT être en premier
import './config/env.js';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/matches.js';
import profileRoutes from './routes/profiles.js';

// Middlewares
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticateToken } from './middlewares/auth.js';

const app = express();
const server = createServer(app);

// Socket.IO pour les notifications en temps réel
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Base de données
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auramatch')
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB:', err));

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Initialisation de Passport - AJOUTEZ CETTE LIGNE ICI !
app.use(passport.initialize()); 

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use(limiter);

// Parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/matches', authenticateToken, matchRoutes);
app.use('/api/profiles', authenticateToken, profileRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AuraMatch API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('👤 Utilisateur connecté:', socket.id);
  
  // Rejoindre une room pour les notifications personnalisées
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Utilisateur ${userId} a rejoint sa room`);
  });

  socket.on('disconnect', () => {
    console.log('👤 Utilisateur déconnecté:', socket.id);
  });
});

// Rendre io accessible dans les routes
app.set('io', io);

// Middleware de gestion des erreurs
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur AuraMatch démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📝 Documentation API: http://localhost:${PORT}/api/health`);
});

export default app;

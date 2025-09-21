// Serveur minimal pour déploiement Cloud Run
import './config/env.js';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Démarrage du serveur AuraMatch (version minimale)');
console.log(`📦 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔌 PORT: ${PORT}`);

// Middlewares basiques
app.use(cors());
app.use(express.json());

// Route de santé simple
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AuraMatch API is running (minimal version)',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV
  });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Test endpoint working',
    server: 'minimal version'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

// Démarrer le serveur sur 0.0.0.0 pour Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur AuraMatch (minimal) démarré avec succès`);
  console.log(`🌐 Écoute sur: 0.0.0.0:${PORT}`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/api/health`);
});

export default app;
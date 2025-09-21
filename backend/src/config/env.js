import dotenv from 'dotenv';

// Charger les variables d'environnement en premier
dotenv.config();

// Vérifier les variables essentielles
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars);
  console.error('Copiez backend/.env.example vers backend/.env et configurez les variables');
  if (process.env.NODE_ENV === 'production') {
    // En production, utiliser des valeurs par défaut pour permettre le démarrage
    console.warn('⚠️ Variables manquantes en production, utilisation de valeurs temporaires');
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'temp-jwt-secret-configure-immediately';
  } else {
    process.exit(1);
  }
}

export default process.env;
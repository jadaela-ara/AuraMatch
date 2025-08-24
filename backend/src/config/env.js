import dotenv from 'dotenv';

// Charger les variables d'environnement en premier
dotenv.config();

// Vérifier les variables essentielles
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars);
  console.error('Copiez backend/.env.example vers backend/.env et configurez les variables');
  process.exit(1);
}

export default process.env;
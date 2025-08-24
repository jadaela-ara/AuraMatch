# AuraMatch - Assistant Dating IA 💖

AuraMatch est une application de rencontre intelligente qui utilise l'IA pour créer des profils de personnalité détaillés et trouver des correspondances compatibles.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Connexion par email/mot de passe** avec JWT
- **OAuth Google** - Connexion rapide avec Google
- **OAuth Facebook** - Connexion avec Facebook
- **Gestion de session sécurisée** avec refresh tokens

### 👤 Gestion de Profil
- **Génération de profil IA** avec Gemini AI
- **Analyse de personnalité** basée sur les réponses et réseaux sociaux
- **Upload d'avatar** avec Cloudinary
- **Profil complet** avec centres d'intérêt, valeurs, objectifs

### 💕 Matching Intelligent
- **Algorithme de compatibilité IA** 
- **Score de compatibilité détaillé** avec explications
- **Recommandations personnalisées**
- **Scan des réseaux sociaux** pour découvrir de nouveaux profils
- **Actions Like/Pass** avec détection de matches mutuels

### 🔄 Temps Réel
- **Notifications instantanées** avec Socket.IO
- **Nouveaux matches en temps réel**
- **Statut de génération de profil**

### 🛡️ Sécurité
- **Authentification JWT sécurisée**
- **Rate limiting** et protection CORS
- **Validation des données** côté serveur
- **Upload d'images sécurisé**

## 🏗️ Architecture

```
AuraMatch/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Logique métier
│   │   ├── models/         # Modèles MongoDB/Mongoose
│   │   ├── routes/         # Routes API
│   │   ├── middlewares/    # Middlewares (auth, validation)
│   │   ├── services/       # Services (Gemini AI, etc.)
│   │   └── server.js       # Point d'entrée
│   ├── config/            # Configuration (Passport, MongoDB)
│   └── uploads/           # Stockage temporaire fichiers
│
├── components/            # Composants React
├── services/             # Services frontend (API, Socket)
├── hooks/               # Hooks React personnalisés
├── types.ts            # Types TypeScript
└── constants.ts        # Constantes et données mock
```

## 🚀 Installation et Déploiement

### Prérequis
- **Node.js** 18+ et npm
- **MongoDB** (local ou Atlas)
- **PM2** pour la gestion des processus
- Comptes développeur **Google** et **Facebook** (optionnel)
- Compte **Cloudinary** (optionnel, pour upload images)
- Clé API **Gemini** (Google AI)

### 1. Configuration Backend

```bash
cd backend
cp .env.example .env
```

Configurez les variables dans `backend/.env`:

```bash
# Base de données
MONGODB_URI=mongodb://localhost:27017/auramatch

# JWT (générez une clé sécurisée)
JWT_SECRET=your_super_secret_jwt_key_here

# OAuth Google (https://console.developers.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth Facebook (https://developers.facebook.com)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Gemini AI (https://makersuite.google.com)
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Configuration Frontend

```bash
cp .env.local.example .env.local
```

Configurez `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Déploiement Automatique

```bash
# Déploiement en développement
./deploy.sh development

# Déploiement en production
./deploy.sh production
```

### 4. Déploiement Manuel

#### Backend
```bash
cd backend
npm install
pm2 start ecosystem.config.js
```

#### Frontend
```bash
npm install
npm run build
npm run dev  # ou servir dist/ avec nginx
```

### 5. Avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 🔧 Configuration OAuth

### Google OAuth
1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez existant
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URLs de redirection:
   - `http://localhost:3001/api/auth/google/callback` (dev)
   - `https://votre-domaine.com/api/auth/google/callback` (prod)

### Facebook OAuth
1. Allez sur [Facebook Developers](https://developers.facebook.com)
2. Créez une nouvelle app
3. Ajoutez Facebook Login
4. Configurez les URLs de redirection valides
5. Ajoutez les domaines autorisés

### Cloudinary Setup
1. Créez un compte sur [Cloudinary](https://cloudinary.com)
2. Récupérez vos identifiants dans le Dashboard
3. Configurez les variables d'environnement

## 📱 Utilisation

### 1. Inscription/Connexion
- Créez un compte avec email/mot de passe
- Ou connectez-vous avec Google/Facebook

### 2. Onboarding
- Remplissez vos informations de base
- (Optionnel) Connectez vos réseaux sociaux
- Répondez au questionnaire de personnalité
- L'IA génère votre profil automatiquement

### 3. Découverte
- Parcourez les profils recommandés
- Consultez les scores de compatibilité
- Likez ou passez les profils
- Recevez des notifications de matches

### 4. Matches
- Consultez vos matches mutuels
- Lancez des conversations
- Découvrez de nouveaux profils via le scan social

## 🛠️ Commandes Utiles

```bash
# Gestion des services
pm2 status                    # Statut des services
pm2 logs auramatch-backend   # Logs du backend
pm2 restart auramatch-backend # Redémarrer le backend
pm2 stop auramatch-backend   # Arrêter le backend

# Base de données
mongosh auramatch            # Accéder à la DB
docker-compose up -d mongodb # Démarrer MongoDB

# Développement
npm run dev                  # Serveur de dev frontend
npm run build               # Build de production
npm run preview             # Preview du build
```

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend  
npm run test
```

## 📈 Monitoring

- **Health check**: `GET /api/health`
- **Logs PM2**: `pm2 logs --nostream`
- **MongoDB**: Utilisez MongoDB Compass ou CLI

## 🚢 Déploiement en Production

### Variables d'Environnement
```bash
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret
MONGODB_URI=your_production_mongodb_uri
FRONTEND_URL=https://your-domain.com
```

### SSL/HTTPS
Configurez un proxy inverse (nginx) avec SSL:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- 📧 Email: support@auramatch.com  
- 💬 Discord: [Serveur AuraMatch](https://discord.gg/auramatch)
- 📖 Documentation: [docs.auramatch.com](https://docs.auramatch.com)

---

Fait avec ❤️ par l'équipe AuraMatch
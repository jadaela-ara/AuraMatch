# AuraMatch - Assistant Dating IA 💖

AuraMatch est une application de rencontre intelligente qui utilise l'IA pour créer des profils de personnalité détaillés et trouver des correspondances compatibles.

## 🚀 Démarrage Rapide

**Vous voulez démarrer en 5 minutes ?** → Consultez **[QUICK_SETUP.md](./QUICK_SETUP.md)**

**Configuration complète avec OAuth et Cloudinary ?** → Consultez **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)**

### Démarrage Ultra-Rapide

```bash
# 1. Configurez backend/.env avec MongoDB et Gemini API Key
# 2. Lancez l'application
./start-dev.sh

# Ouvrez http://localhost:5173
```

C'est tout ! 🎉

---

## ✨ Fonctionnalités

### 🔐 Authentification
- **Connexion par email/mot de passe** avec JWT
- **OAuth Google** - Connexion rapide avec Google (optionnel)
- **OAuth Facebook** - Connexion avec Facebook (optionnel)
- **Gestion de session sécurisée** avec refresh tokens

### 👤 Gestion de Profil
- **Génération de profil IA** avec Gemini AI
- **Analyse de personnalité** basée sur les réponses et réseaux sociaux
- **Upload d'avatar** avec Cloudinary (optionnel)
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
│   └── .env               # Variables d'environnement
│
├── components/            # Composants React
├── services/             # Services frontend (API, Socket)
├── hooks/               # Hooks React personnalisés
├── types.ts            # Types TypeScript
└── constants.ts        # Constantes et données mock
```

## 📋 Prérequis

- **Node.js** 18+ et npm
- **MongoDB** (local ou Atlas)
- Clé API **Gemini** (Google AI) - **REQUIS**
- Comptes développeur **Google** et **Facebook** (optionnel pour OAuth)
- Compte **Cloudinary** (optionnel pour upload images)

## ⚙️ Configuration Minimale

### 1. MongoDB

**Option A : Local**
```bash
# Installation
sudo apt-get install mongodb  # Ubuntu/Debian
brew install mongodb-community  # macOS

# Démarrage
sudo systemctl start mongodb
```

**Option B : Atlas (gratuit)**
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Récupérez l'URI de connexion

### 2. Gemini AI (Gratuit)

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une clé API
3. Copiez la clé

### 3. Configuration Backend

Éditez `backend/.env` :

```bash
# REQUIS
MONGODB_URI=mongodb://localhost:27017/auramatch
JWT_SECRET=votre_secret_unique_ici
GEMINI_API_KEY=votre_cle_gemini

# OPTIONNEL
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

## 🚀 Démarrage

### Méthode 1 : Script Automatique (Recommandé)

```bash
./start-dev.sh
```

### Méthode 2 : Manuel

**Terminal 1 - Backend :**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend :**
```bash
npm install
npm run dev
```

Ouvrez `http://localhost:5173`

## 🧪 Test de l'Application

1. **Santé du backend** : `curl http://localhost:3001/api/health`
2. **Créez un compte** sur http://localhost:5173
3. **Complétez l'onboarding** :
   - Informations personnelles
   - Connexion réseaux sociaux (simulé)
   - Questionnaire de personnalité
4. **L'IA génère votre profil** automatiquement
5. **Découvrez vos matches** avec scores de compatibilité !

## 🛠️ Commandes Utiles

```bash
# Gestion des services (avec PM2)
pm2 status                    # Statut des services
pm2 logs auramatch-backend   # Logs du backend
pm2 restart auramatch-backend # Redémarrer le backend
pm2 stop auramatch-backend   # Arrêter le backend

# Base de données
mongosh auramatch            # Accéder à la DB
docker-compose up -d mongodb # Démarrer MongoDB avec Docker

# Développement
npm run dev                  # Serveur de dev frontend
npm run build               # Build de production
npm run preview             # Preview du build
```

## 🔧 Dépannage

### MongoDB ne se connecte pas
```bash
# Vérifier si MongoDB est actif
sudo systemctl status mongodb

# Démarrer MongoDB
sudo systemctl start mongodb
```

### Gemini API ne fonctionne pas
1. Vérifiez que `GEMINI_API_KEY` est dans `backend/.env`
2. Testez la clé sur [Google AI Studio](https://makersuite.google.com)
3. Redémarrez le backend

### Port déjà utilisé
```bash
lsof -i :3001  # Trouver le processus
kill -9 <PID>  # Le terminer
```

## 🚢 Déploiement en Production

Consultez le guide de déploiement pour :
- Configuration SSL/HTTPS
- Variables d'environnement de production
- Utilisation de MongoDB Atlas
- Configuration OAuth pour production
- Optimisation des performances

## 📖 Documentation

- **[QUICK_SETUP.md](./QUICK_SETUP.md)** - Démarrage en 5 minutes
- **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)** - Configuration complète
- **[CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md)** - Déploiement Google Cloud

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

**Prêt à trouver votre âme sœur avec l'IA ? Lancez `./start-dev.sh` maintenant !** 🚀

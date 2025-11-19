# 🚀 Guide de Configuration AuraMatch

Ce guide vous accompagne pour configurer et démarrer AuraMatch, l'application de rencontre intelligente avec IA.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js 18+** et npm installés
- ✅ **MongoDB** (local ou Atlas) en cours d'exécution
- ✅ Un compte **Google Cloud** (pour Gemini AI et OAuth Google)
- ✅ (Optionnel) Un compte **Facebook Developers** (pour OAuth Facebook)
- ✅ (Optionnel) Un compte **Cloudinary** (pour l'upload d'images)

## 🔑 Étape 1 : Obtenir les Clés API

### 1.1 Gemini AI (REQUIS)

**Gemini AI est essentiel pour la génération de profils et le matching intelligent.**

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Get API Key" ou "Create API Key"
4. Copiez votre clé API Gemini
5. Ajoutez-la dans `backend/.env` : `GEMINI_API_KEY=votre_cle_ici`

### 1.2 MongoDB

**Option A : MongoDB Local (Développement)**

```bash
# Installation sur Ubuntu/Debian
sudo apt-get install mongodb

# Installation sur macOS avec Homebrew
brew install mongodb-community

# Démarrer MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

URI de connexion : `mongodb://localhost:27017/auramatch`

**Option B : MongoDB Atlas (Production)**

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte gratuit
3. Créez un cluster (Free Tier M0 suffit)
4. Cliquez sur "Connect" → "Connect your application"
5. Copiez l'URI de connexion (format : `mongodb+srv://...`)
6. Remplacez `<password>` par votre mot de passe
7. Ajoutez l'URI dans `backend/.env` : `MONGODB_URI=mongodb+srv://...`

### 1.3 OAuth Google (Optionnel mais recommandé)

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API"
4. Allez dans "APIs & Services" → "Credentials"
5. Cliquez sur "Create Credentials" → "OAuth 2.0 Client ID"
6. Configurez l'écran de consentement OAuth si demandé
7. Type d'application : "Web application"
8. Ajoutez les URIs de redirection autorisées :
   - `http://localhost:3001/api/auth/google/callback` (développement)
   - `https://votre-domaine.com/api/auth/google/callback` (production)
9. Copiez le "Client ID" et le "Client Secret"
10. Ajoutez-les dans `backend/.env` :
    ```
    GOOGLE_CLIENT_ID=votre_client_id
    GOOGLE_CLIENT_SECRET=votre_client_secret
    ```

### 1.4 OAuth Facebook (Optionnel)

1. Allez sur [Facebook Developers](https://developers.facebook.com)
2. Créez une nouvelle app
3. Ajoutez le produit "Facebook Login"
4. Dans les paramètres de Facebook Login :
   - Valid OAuth Redirect URIs : `http://localhost:3001/api/auth/facebook/callback`
   - Site Web URL : `http://localhost:3001`
5. Copiez l'App ID et l'App Secret
6. Ajoutez-les dans `backend/.env` :
   ```
   FACEBOOK_APP_ID=votre_app_id
   FACEBOOK_APP_SECRET=votre_app_secret
   ```

### 1.5 Cloudinary (Optionnel)

Pour l'upload d'images d'avatar :

1. Créez un compte sur [Cloudinary](https://cloudinary.com)
2. Dans le Dashboard, récupérez :
   - Cloud Name
   - API Key
   - API Secret
3. Ajoutez-les dans `backend/.env` :
   ```
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```

## ⚙️ Étape 2 : Configuration

### 2.1 Configuration Backend

Le fichier `backend/.env` est déjà configuré avec les valeurs par défaut. Mettez à jour les valeurs suivantes :

```bash
# REQUIS
MONGODB_URI=mongodb://localhost:27017/auramatch  # Ou votre URI MongoDB Atlas
JWT_SECRET=changez_cette_cle_secrete_en_production  # Clé de votre choix
GEMINI_API_KEY=votre_cle_gemini_ici  # Clé API Gemini

# OPTIONNEL - OAuth Google
GOOGLE_CLIENT_ID=votre_google_client_id_ici
GOOGLE_CLIENT_SECRET=votre_google_secret_ici

# OPTIONNEL - OAuth Facebook
FACEBOOK_APP_ID=votre_facebook_app_id_ici
FACEBOOK_APP_SECRET=votre_facebook_secret_ici

# OPTIONNEL - Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 2.2 Configuration Frontend

Le fichier `.env` frontend est configuré pour le développement local :

```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_NODE_ENV=development
```

Pas besoin de modifier ces valeurs pour le développement local.

## 🚀 Étape 3 : Installation et Démarrage

### 3.1 Installation des Dépendances

```bash
# Dépendances frontend
npm install

# Dépendances backend
cd backend
npm install
cd ..
```

### 3.2 Démarrage en Mode Développement

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
# Le backend démarre sur http://localhost:3001
```

**Terminal 2 - Frontend :**
```bash
npm run dev
# Le frontend démarre sur http://localhost:5173
```

Ouvrez votre navigateur sur `http://localhost:5173`

### 3.3 Démarrage en Mode Production (avec PM2)

```bash
# Déploiement automatique
./deploy.sh development  # Pour dev
./deploy.sh production   # Pour prod

# Ou manuellement
cd backend
npm install
pm2 start ecosystem.config.js

cd ..
npm install
npm run build
npm run preview  # Ou servir avec nginx
```

## 🧪 Étape 4 : Tester l'Application

### 4.1 Vérifier la Santé du Backend

```bash
curl http://localhost:3001/api/health
# Réponse attendue : {"status":"OK","message":"AuraMatch API is running"}
```

### 4.2 Tester la Connexion

1. Ouvrez `http://localhost:5173`
2. Créez un compte avec email/mot de passe
3. Ou connectez-vous avec Google (si configuré)

### 4.3 Tester la Génération de Profil

1. Complétez le onboarding :
   - Informations de base (nom, âge, localisation)
   - Connexion des réseaux sociaux (simulation)
   - Réponses au questionnaire
2. L'IA Gemini génère automatiquement votre profil
3. Accédez au Dashboard pour voir les matches

### 4.4 Tester les Fonctionnalités

- ✅ Voir les profils recommandés
- ✅ Liker ou passer des profils
- ✅ Voir les scores de compatibilité
- ✅ Recevoir des notifications de matches mutuels
- ✅ Scanner les réseaux sociaux pour de nouveaux profils

## 🔧 Dépannage

### Problème : MongoDB ne se connecte pas

**Solution :**
```bash
# Vérifier si MongoDB est en cours d'exécution
sudo systemctl status mongodb  # Linux
brew services list  # macOS

# Démarrer MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### Problème : Erreur "GEMINI_API_KEY non configurée"

**Solution :**
1. Vérifiez que vous avez ajouté `GEMINI_API_KEY` dans `backend/.env`
2. Redémarrez le serveur backend
3. Vérifiez que la clé est valide sur [Google AI Studio](https://makersuite.google.com)

### Problème : OAuth Google ne fonctionne pas

**Solution :**
1. Vérifiez que les URI de redirection sont corrects dans Google Cloud Console
2. Assurez-vous que l'API Google+ est activée
3. Vérifiez que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects dans `.env`

### Problème : Port 3001 ou 5173 déjà utilisé

**Solution :**
```bash
# Trouver le processus utilisant le port
lsof -i :3001  # ou :5173

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans les fichiers de configuration
```

## 📊 Architecture de l'Application

```
Frontend (React + Vite)  →  Backend (Express + Node.js)
     ↓                              ↓
  Port 5173                    Port 3001
                                   ↓
                           MongoDB (27017)
                                   ↓
                        Gemini AI (API externe)
```

## 🔐 Sécurité en Production

Avant de déployer en production :

1. **Changez JWT_SECRET** : Utilisez une clé forte et unique
2. **Utilisez HTTPS** : Configurez SSL/TLS avec nginx ou un reverse proxy
3. **Variables d'environnement** : Utilisez des services sécurisés (Secrets Manager)
4. **Rate Limiting** : Déjà configuré, mais ajustez selon vos besoins
5. **MongoDB** : Utilisez MongoDB Atlas avec authentification
6. **Mettez à jour les URL** : Frontend, callbacks OAuth, etc.

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du backend : `pm2 logs auramatch-backend` ou dans le terminal
2. Vérifiez la console du navigateur (F12)
3. Consultez la documentation officielle des services (Google, MongoDB, etc.)

## 🎉 Prêt à Démarrer !

Votre application AuraMatch est maintenant configurée et prête à l'emploi !

Pour démarrer rapidement :

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

Ouvrez http://localhost:5173 et commencez à matcher ! 💖

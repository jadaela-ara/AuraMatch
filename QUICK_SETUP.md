# ⚡ Démarrage Rapide AuraMatch

Guide ultra-rapide pour lancer AuraMatch en 5 minutes !

## 🎯 Prérequis Minimum

- ✅ Node.js 18+ installé
- ✅ MongoDB en cours d'exécution (local ou Atlas)
- ✅ Une clé API Gemini (gratuite) - [Obtenir ici](https://makersuite.google.com/app/apikey)

## 🚀 Étapes de Configuration (5 minutes)

### 1. Configurez MongoDB

**Option A : MongoDB Local (le plus simple)**
```bash
# Installation rapide
# Ubuntu/Debian: sudo apt-get install mongodb
# macOS: brew install mongodb-community

# Démarrer MongoDB
# Linux: sudo systemctl start mongodb
# macOS: brew services start mongodb-community
```

**Option B : MongoDB Atlas (gratuit, recommandé pour la production)**
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Récupérez l'URI de connexion (format: `mongodb+srv://...`)

### 2. Obtenez votre Clé Gemini AI

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec Google
3. Cliquez sur "Create API Key"
4. Copiez la clé

### 3. Configurez le Backend

Ouvrez `backend/.env` et modifiez :

```bash
# REQUIS
MONGODB_URI=mongodb://localhost:27017/auramatch  # Ou votre URI Atlas
JWT_SECRET=votre_secret_jwt_unique  # Changez cette valeur
GEMINI_API_KEY=votre_cle_gemini_ici  # Collez votre clé Gemini

# OPTIONNEL (pour OAuth social)
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_secret
```

### 4. Démarrage Automatique

```bash
# Rendre le script exécutable (une seule fois)
chmod +x start-dev.sh

# Lancer l'application
./start-dev.sh
```

Le script va :
- ✅ Vérifier les prérequis
- ✅ Installer les dépendances automatiquement
- ✅ Démarrer le backend (port 3001)
- ✅ Démarrer le frontend (port 5173)

### 5. Accédez à l'Application

Ouvrez votre navigateur : **http://localhost:5173**

C'est tout ! 🎉

## 🧪 Test Rapide

1. **Créez un compte** avec email/mot de passe
2. **Complétez le onboarding** :
   - Informations de base
   - Connectez les réseaux sociaux (simulation)
   - Répondez au questionnaire
3. **L'IA génère votre profil** automatiquement
4. **Découvrez vos matches** avec scores de compatibilité !

## 📝 Démarrage Manuel (Alternative)

Si vous préférez démarrer manuellement :

**Terminal 1 - Backend :**
```bash
cd backend
npm install  # Première fois seulement
npm run dev
```

**Terminal 2 - Frontend :**
```bash
npm install  # Première fois seulement
npm run dev
```

## 🔧 Commandes Utiles

```bash
# Vérifier la santé du backend
curl http://localhost:3001/api/health

# Voir les logs du backend
tail -f backend.log

# Voir les logs du frontend
tail -f frontend.log

# Arrêter les services
# Appuyez sur Ctrl+C dans le terminal où ./start-dev.sh est en cours
```

## 🆘 Problèmes Courants

### MongoDB ne se connecte pas
```bash
# Vérifier que MongoDB est en cours d'exécution
sudo systemctl status mongodb  # Linux
brew services list  # macOS

# Démarrer MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### Port déjà utilisé
```bash
# Trouver et tuer le processus sur le port 3001
lsof -i :3001
kill -9 <PID>

# Ou sur le port 5173
lsof -i :5173
kill -9 <PID>
```

### Gemini API ne fonctionne pas
1. Vérifiez que `GEMINI_API_KEY` est bien configuré dans `backend/.env`
2. Vérifiez que la clé est valide sur [Google AI Studio](https://makersuite.google.com)
3. Redémarrez le backend

## 📖 Documentation Complète

Pour une configuration plus avancée (OAuth, Cloudinary, etc.), consultez : **[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)**

## ✨ Fonctionnalités Disponibles

- ✅ **Authentification** : Email/mot de passe, Google OAuth*, Facebook OAuth*
- ✅ **Génération de profil IA** : Gemini analyse vos réponses et crée votre profil
- ✅ **Matching intelligent** : Algorithme de compatibilité avec IA
- ✅ **Scores détaillés** : Compatibilité expliquée par catégories
- ✅ **Notifications temps réel** : Socket.IO pour les nouveaux matches
- ✅ **Scan social** : Découvrir de nouveaux profils via simulation de scan
- ✅ **Likes & Matches** : Système complet de matching mutuel

*OAuth nécessite une configuration supplémentaire (voir CONFIGURATION_GUIDE.md)

## 🎊 Prêt à Matcher !

Votre application de rencontre intelligente est maintenant opérationnelle ! 💖

Pour toute question, consultez le guide complet ou les logs d'erreur.

Happy Matching! 🚀

# 🚀 Guide de déploiement AuraMatch sur Google Cloud Run

## Architecture séparée (Solution 1)

Cette solution résout le problème OAuth en séparant le frontend et le backend sur des services Cloud Run distincts.

### 📋 Prérequis

1. **Google Cloud SDK** installé et configuré
2. **Docker** installé et en cours d'exécution
3. **Projet Google Cloud** configuré avec facturation activée
4. **APIs activées** : Cloud Run, Container Registry, Cloud Build

### 🏗️ Architecture déployée

```
┌─────────────────────┐    ┌─────────────────────┐
│   Frontend Service  │────▶│   Backend Service   │
│  auramatch-frontend │    │  auramatch-backend  │
│  (nginx + React)    │    │  (Node.js + API)    │
│  Port: 8080         │    │  Port: 3001         │
└─────────────────────┘    └─────────────────────┘
```

### 🚀 Déploiement rapide

```bash
# Déploiement complet en une commande
./deploy-all.sh YOUR_PROJECT_ID europe-west1

# Ou déploiement étape par étape
./deploy-backend.sh YOUR_PROJECT_ID europe-west1
./deploy-frontend.sh YOUR_PROJECT_ID europe-west1
```

### 📝 Déploiement étape par étape

#### Étape 1: Configurer le projet Google Cloud

```bash
# Définir votre projet
export PROJECT_ID="your-project-id"
export REGION="europe-west1"

# Configurer gcloud
gcloud config set project $PROJECT_ID
gcloud auth configure-docker
```

#### Étape 2: Déployer le backend

```bash
./deploy-backend.sh $PROJECT_ID $REGION
```

**Le script va :**
- Build l'image Docker du backend
- La pousser vers Container Registry
- Déployer sur Cloud Run
- Sauvegarder l'URL du backend

#### Étape 3: Configurer les variables d'environnement backend

Via la **Console Cloud Run** ou **gcloud CLI** :

```bash
# Via gcloud CLI
gcloud run services update auramatch-backend \
  --region=$REGION \
  --set-env-vars="MONGODB_URI=mongodb+srv://..." \
  --set-env-vars="JWT_SECRET=your_secure_jwt_secret" \
  --set-env-vars="GOOGLE_CLIENT_ID=your_google_client_id" \
  --set-env-vars="GOOGLE_CLIENT_SECRET=your_google_client_secret"
```

**Variables requises (voir `.env.cloudrun`)** :
- `MONGODB_URI` : URI de votre base MongoDB
- `JWT_SECRET` : Clé secrète JWT sécurisée
- `GOOGLE_CLIENT_ID` : ID client Google OAuth
- `GOOGLE_CLIENT_SECRET` : Secret client Google OAuth
- `FRONTEND_URL` : URL du frontend (après déploiement)

#### Étape 4: Déployer le frontend

```bash
./deploy-frontend.sh $PROJECT_ID $REGION
```

**Le script va :**
- Utiliser l'URL du backend sauvegardée
- Build l'image Docker du frontend avec la bonne configuration
- Déployer sur Cloud Run

#### Étape 5: Configuration OAuth Google

1. **Google Cloud Console** : https://console.cloud.google.com/apis/credentials
2. **Créer/Modifier les identifiants OAuth 2.0** :
   
   ```
   URIs de redirection autorisées:
   https://auramatch-backend-XXXXXXXXX.run.app/api/auth/google/callback
   
   Origines JavaScript autorisées:
   https://auramatch-frontend-XXXXXXXXX.run.app
   ```

3. **Mettre à jour les variables d'environnement backend** avec les vraies clés

#### Étape 6: Mise à jour finale des variables

```bash
# Récupérer les URLs déployées
BACKEND_URL=$(gcloud run services describe auramatch-backend --region=$REGION --format="value(status.url)")
FRONTEND_URL=$(gcloud run services describe auramatch-frontend --region=$REGION --format="value(status.url)")

# Mettre à jour les variables d'environnement backend
gcloud run services update auramatch-backend \
  --region=$REGION \
  --set-env-vars="FRONTEND_URL=$FRONTEND_URL" \
  --set-env-vars="GOOGLE_CALLBACK_URL=$BACKEND_URL/api/auth/google/callback"
```

### 🔧 Scripts disponibles

| Script | Description |
|--------|-------------|
| `deploy-backend.sh` | Déploie uniquement le backend |
| `deploy-frontend.sh` | Déploie uniquement le frontend |
| `deploy-all.sh` | Déploiement complet automatique |

### 🌐 URLs de test

Après déploiement, vous aurez :

- **Frontend** : `https://auramatch-frontend-XXXXXXXXX.run.app`
- **Backend API** : `https://auramatch-backend-XXXXXXXXX.run.app/api`
- **Health Check** : `https://auramatch-backend-XXXXXXXXX.run.app/api/health`
- **OAuth Google** : `https://auramatch-backend-XXXXXXXXX.run.app/api/auth/google`

### 🛡️ Sécurité et bonnes pratiques

1. **Variables d'environnement** : Toujours via Cloud Run Security Management
2. **HTTPS** : Automatiquement géré par Cloud Run
3. **Authentification** : OAuth configuré avec les bonnes origines
4. **Scaling** : Configuré avec min/max instances
5. **Health checks** : Intégrés dans les Dockerfiles

### 🔍 Debugging

```bash
# Voir les logs du backend
gcloud run services logs tail auramatch-backend --region=$REGION

# Voir les logs du frontend
gcloud run services logs tail auramatch-frontend --region=$REGION

# Tester l'API backend
curl https://auramatch-backend-XXXXXXXXX.run.app/api/health

# Vérifier les variables d'environnement
gcloud run services describe auramatch-backend --region=$REGION
```

### 🎯 Résolution du problème OAuth

Cette architecture résout le problème original :

✅ **Avant** : Frontend et backend sur même URL → conflit routing `/api/auth/google`  
✅ **Après** : Services séparés → routing OAuth clair et fonctionnel

### 📊 Coûts estimés

- **Backend** : ~$5-15/mois (selon usage)
- **Frontend** : ~$1-5/mois (selon trafic)
- **Total** : ~$6-20/mois pour une utilisation normale

### 🚨 Après déploiement

1. **Testez OAuth** : Cliquez sur "Continuer avec Google"
2. **Vérifiez les logs** : Aucune erreur de redirection
3. **Configurez le domaine** : Optionnel via Cloud Run custom domains
4. **Monitoring** : Activez les alertes Cloud Run

---

🎉 **Votre application AuraMatch est maintenant déployée avec l'architecture recommandée !**
# 🌐 Déploiement depuis Google Cloud Shell

## 🎯 **Situation :** Vous êtes dans Google Cloud Shell et cherchez deploy-all.sh

Le fichier `deploy-all.sh` est dans votre repository GitHub, pas dans Cloud Shell. Voici comment procéder :

---

## ⚡ **Option 1 : Cloner votre repository (RECOMMANDÉ)**

### **Étape 1: Cloner votre projet**

```bash
# 1. Clonez votre repository AuraMatch
git clone https://github.com/jadaela-ara/AuraMatch.git

# 2. Naviguez dans le projet
cd AuraMatch

# 3. Vérifiez que les scripts sont présents
ls -la deploy-*.sh
```

### **Étape 2: Configuration automatique**

Cloud Shell a déjà `gcloud` configuré ! Vérifiez :

```bash
# Vérifiez l'authentification (déjà active dans Cloud Shell)
gcloud auth list

# Configurez le bon projet
gcloud config set project auramatch-470020

# Configurez Docker
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

### **Étape 3: Déploiement immédiat**

```bash
# Rendez le script exécutable
chmod +x deploy-all.sh

# LANCEZ LE DÉPLOIEMENT
./deploy-all.sh auramatch-470020 europe-west1
```

---

## ⚡ **Option 2 : Commandes manuelles (Alternative rapide)**

Si vous ne voulez pas cloner, voici les commandes équivalentes directement dans Cloud Shell :

### **Étape 1: Configuration**

```bash
# Configuration du projet
gcloud config set project auramatch-470020
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Activez les APIs nécessaires
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### **Étape 2: Clonez et déployez le backend**

```bash
# Clonez le repo pour accéder aux fichiers
git clone https://github.com/jadaela-ara/AuraMatch.git
cd AuraMatch

# Créez le repository Artifact Registry
gcloud artifacts repositories create auramatch-backend \
  --repository-format=docker \
  --location=europe-west1 \
  --description="AuraMatch Backend"

# Build et deploy backend
cd backend
gcloud builds submit --tag europe-west1-docker.pkg.dev/auramatch-470020/auramatch-backend/auramatch-backend:latest

gcloud run deploy auramatch-backend \
  --image europe-west1-docker.pkg.dev/auramatch-470020/auramatch-backend/auramatch-backend:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 3001 \
  --memory 1Gi \
  --set-env-vars NODE_ENV=production,PORT=3001

# Récupérez l'URL backend
BACKEND_URL=$(gcloud run services describe auramatch-backend --region=europe-west1 --format="value(status.url)")
echo "Backend URL: $BACKEND_URL"
```

### **Étape 3: Déployez le frontend**

```bash
# Retournez au répertoire racine
cd ..

# Créez le repository frontend
gcloud artifacts repositories create auramatch-frontend \
  --repository-format=docker \
  --location=europe-west1 \
  --description="AuraMatch Frontend"

# Préparez l'environnement frontend
cat > .env.production << EOF
VITE_API_BASE_URL=$BACKEND_URL
VITE_SOCKET_URL=$BACKEND_URL
VITE_NODE_ENV=production
EOF

# Copiez le dockerignore frontend
cp .dockerignore.frontend .dockerignore

# Build et deploy frontend
gcloud builds submit --tag europe-west1-docker.pkg.dev/auramatch-470020/auramatch-frontend/auramatch-frontend:latest -f Dockerfile.frontend

gcloud run deploy auramatch-frontend \
  --image europe-west1-docker.pkg.dev/auramatch-470020/auramatch-frontend/auramatch-frontend:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi

# Récupérez l'URL frontend
FRONTEND_URL=$(gcloud run services describe auramatch-frontend --region=europe-west1 --format="value(status.url)")

# Mettez à jour les variables backend
gcloud run services update auramatch-backend \
  --region=europe-west1 \
  --set-env-vars FRONTEND_URL=$FRONTEND_URL,GOOGLE_CALLBACK_URL=$BACKEND_URL/api/auth/google/callback,FACEBOOK_CALLBACK_URL=$BACKEND_URL/api/auth/facebook/callback

echo "🎉 Déploiement terminé!"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
```

---

## 🎯 **Recommandation : Utilisez l'Option 1**

**Pourquoi ?**
- ✅ Plus simple et automatisé
- ✅ Utilise les scripts optimisés
- ✅ Gère les erreurs automatiquement
- ✅ Même résultat qu'en local

**Commandes rapides :**
```bash
git clone https://github.com/jadaela-ara/AuraMatch.git
cd AuraMatch
gcloud config set project auramatch-470020
gcloud auth configure-docker europe-west1-docker.pkg.dev
chmod +x deploy-all.sh
./deploy-all.sh auramatch-470020 europe-west1
```

---

## 🔧 **Avantages de Cloud Shell**

✅ **gcloud pré-installé** et authentifié  
✅ **Docker pré-installé** et configuré  
✅ **Pas de setup local** nécessaire  
✅ **Accès direct** aux APIs Google Cloud  
✅ **Environnement cohérent** et fiable  

---

## 📋 **Après déploiement**

Vous obtiendrez les mêmes résultats :
- Frontend : `https://auramatch-frontend-xxxxx-ew.a.run.app`
- Backend : `https://auramatch-backend-xxxxx-ew.a.run.app`
- **Problème OAuth résolu** avec l'architecture séparée

---

## 🚀 **Démarrez maintenant dans Cloud Shell :**

```bash
# Commande complète pour Cloud Shell
git clone https://github.com/jadaela-ara/AuraMatch.git && cd AuraMatch && gcloud config set project auramatch-470020 && chmod +x deploy-all.sh && ./deploy-all.sh auramatch-470020 europe-west1
```

**Durée : 8-12 minutes dans Cloud Shell** ⏱️
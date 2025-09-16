# 🚀 Déploiement immédiat avec scripts bash

En attendant la fusion de la PR pour ajouter les workflows GitHub Actions, vous pouvez déployer immédiatement avec les scripts bash.

## ⚡ Déploiement rapide

### Option 1: Déploiement complet automatique

```bash
# Une seule commande pour tout déployer
./deploy-all.sh auramatch-470020 europe-west1
```

### Option 2: Déploiement étape par étape

```bash
# 1. Backend seulement
./deploy-backend.sh auramatch-470020 europe-west1

# 2. Configurer les variables d'environnement
./configure-env.sh auramatch-470020 europe-west1

# 3. Frontend avec l'URL du backend
./deploy-frontend.sh auramatch-470020 europe-west1
```

## 🔧 Configuration pré-requise

### 1. Vérifier gcloud

```bash
# Vérifier l'authentification
gcloud auth list

# Configurer le projet
gcloud config set project auramatch-470020

# Configurer Docker pour Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

### 2. APIs activées

Vos APIs sont probablement déjà activées, mais au cas où :

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com  
gcloud services enable artifactregistry.googleapis.com
```

## 📋 Processus de déploiement

### Étape 1: Backend (3-5 min)

```bash
./deploy-backend.sh auramatch-470020 europe-west1
```

**Ce script va :**
- ✅ Créer le repository Artifact Registry si nécessaire
- ✅ Build l'image Docker backend depuis `/backend`
- ✅ Push vers `europe-west1-docker.pkg.dev/auramatch-470020/auramatch-backend`
- ✅ Déployer sur Cloud Run service `auramatch-backend`
- ✅ Sauvegarder l'URL backend dans `.env.backend-url`

### Étape 2: Configuration variables (2 min)

```bash
./configure-env.sh auramatch-470020 europe-west1
```

**Le script va demander :**
- MongoDB URI
- JWT Secret  
- Google Client ID
- Google Client Secret
- Gemini API Key (optionnel)

### Étape 3: Frontend (3-5 min)

```bash  
./deploy-frontend.sh auramatch-470020 europe-west1
```

**Ce script va :**
- ✅ Utiliser l'URL backend sauvegardée
- ✅ Build l'image Docker frontend avec la bonne configuration
- ✅ Déployer sur Cloud Run service `auramatch-frontend`  
- ✅ Mettre à jour les variables d'environnement backend

## 🔍 URLs après déploiement

Vous obtiendrez :

```bash
Frontend:  https://auramatch-frontend-XXXXXXXXX-ew.a.run.app
Backend:   https://auramatch-backend-XXXXXXXXX-ew.a.run.app
```

## 🔧 Configuration OAuth Google

1. **Console Google Cloud** : https://console.cloud.google.com/apis/credentials
2. **Modifier vos identifiants OAuth 2.0** existants :

```
URIs de redirection autorisées:
https://auramatch-backend-XXXXXXXXX-ew.a.run.app/api/auth/google/callback

Origines JavaScript autorisées:
https://auramatch-frontend-XXXXXXXXX-ew.a.run.app
```

## 🎯 Test de validation

```bash
# Tester le backend
curl https://auramatch-backend-XXXXXXXXX-ew.a.run.app/api/health

# Ouvrir le frontend
open https://auramatch-frontend-XXXXXXXXX-ew.a.run.app

# Tester OAuth (après configuration)
# Cliquer sur "Continuer avec Google" → devrait fonctionner !
```

## 🔄 Redéploiement rapide

```bash
# Backend seulement
./deploy-backend.sh auramatch-470020 europe-west1

# Frontend seulement  
./deploy-frontend.sh auramatch-470020 europe-west1

# Ou tout redéployer
./deploy-all.sh auramatch-470020 europe-west1
```

## ❓ En cas de problème

### Voir les logs
```bash
# Logs backend
gcloud run services logs tail auramatch-backend --region=europe-west1

# Logs frontend  
gcloud run services logs tail auramatch-frontend --region=europe-west1
```

### Redémarrer les services
```bash
gcloud run services update auramatch-backend --region=europe-west1
gcloud run services update auramatch-frontend --region=europe-west1
```

---

🚀 **Lancez `./deploy-all.sh auramatch-470020 europe-west1` pour déployer maintenant !**
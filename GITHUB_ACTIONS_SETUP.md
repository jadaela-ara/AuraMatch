# 🚀 Configuration GitHub Actions pour Cloud Run

## Workflows créés

Trois workflows GitHub Actions ont été créés pour automatiser le déploiement :

1. **`deploy-backend.yml`** : Déploiement automatique du backend
2. **`deploy-frontend.yml`** : Déploiement automatique du frontend  
3. **`deploy-complete.yml`** : Déploiement complet (backend puis frontend)

## 🔧 Configuration requise

### Votre configuration existante (déjà configurée) ✅

D'après votre workflow existant, vous avez déjà :

- **Project ID** : `auramatch-470020`
- **Region** : `europe-west1`
- **Workload Identity Provider** : `projects/343501244023/locations/global/workloadIdentityPools/auramatch-pool/providers/github-oidc`

### Permissions IAM requises ✅

Votre Workload Identity doit avoir (probablement déjà configuré) :

- `Artifact Registry Administrator` (roles/artifactregistry.admin)
- `Cloud Run Developer` (roles/run.developer)
- `Service Account Token Creator` (pour l'authentification)

## 🚀 Utilisation des workflows

### Déploiement automatique

Les workflows se déclenchent automatiquement sur :

```bash
# Push sur la branche main
git push origin main

# Le backend se déploie si des fichiers dans /backend sont modifiés
# Le frontend se déploie si des fichiers hors /backend sont modifiés
```

### Déploiement manuel

Via l'interface GitHub :

1. Allez sur **Actions** dans votre repo GitHub
2. Sélectionnez le workflow désiré :
   - `Deploy Backend to Cloud Run`
   - `Deploy Frontend to Cloud Run` 
   - `Deploy Complete Application`
3. Cliquez sur **Run workflow**

### Déploiement via CLI

```bash
# Déclencher le déploiement complet
gh workflow run deploy-complete.yml

# Déclencher seulement le backend
gh workflow run deploy-backend.yml

# Déclencher seulement le frontend
gh workflow run deploy-frontend.yml
```

## 📋 Variables d'environnement Cloud Run

### Variables automatiquement configurées

Les workflows configurent automatiquement :

- `NODE_ENV=production`
- `PORT=3001` (backend) / `8080` (frontend)
- `FRONTEND_URL` (URL du frontend déployé)
- `GOOGLE_CALLBACK_URL` (URL de callback OAuth)
- `FACEBOOK_CALLBACK_URL` (URL de callback OAuth)

### Variables à configurer manuellement

Vous devez configurer ces variables dans la **Console Cloud Run** :

```bash
# Backend (auramatch-backend)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secure_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 🎯 Workflow de déploiement recommandé

1. **Push votre code** sur `main`
2. **Les workflows se déclenchent** automatiquement
3. **Backend se déploie** en premier
4. **Frontend se déploie** avec l'URL du backend
5. **Configurez les variables** sensibles via Console Cloud Run
6. **Testez l'application** déployée

## 🔍 Monitoring et debugging

### Voir les logs de déploiement

1. **GitHub Actions** : Onglet "Actions" de votre repo
2. **Cloud Run Logs** : Console Google Cloud > Cloud Run > Logs

### URLs de test après déploiement

```bash
# Frontend
https://auramatch-frontend-XXXXXXXXX.run.app

# Backend API
https://auramatch-backend-XXXXXXXXX.run.app/api/health

# OAuth Google
https://auramatch-backend-XXXXXXXXX.run.app/api/auth/google
```

## 🛡️ Sécurité

- **Workload Identity Federation** : Pas de clés JSON stockées
- **Variables sensibles** : Gérées via Cloud Run Security Management
- **HTTPS** : Automatiquement activé par Cloud Run
- **Images privées** : Artifact Registry privé

## 📊 Artefacts créés

### Artifact Registry

Les images Docker sont stockées dans :

```
europe-west1-docker.pkg.dev/auramatch-470020/auramatch-backend/
europe-west1-docker.pkg.dev/auramatch-470020/auramatch-frontend/
```

### Services Cloud Run

Deux services sont créés :

- `auramatch-backend` : API Node.js
- `auramatch-frontend` : Interface React + nginx

## 🎉 Prochaines étapes

1. **Testez le déploiement** : Push sur main
2. **Configurez OAuth** : Google Cloud Console
3. **Ajoutez les variables** : Cloud Run Console  
4. **Testez l'authentification** : Bouton "Continuer avec Google"

---

🚀 **Votre déploiement automatique est maintenant configuré !**
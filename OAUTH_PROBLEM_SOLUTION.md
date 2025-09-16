# Solution au problème OAuth Google - AuraMatch

## 🔍 Problème identifié

Le problème n'est PAS les variables d'environnement (correctement gérées dans Cloud Run Security Management), mais l'architecture de déploiement.

### Diagnostic :

1. **Frontend et Backend sur la même URL** : `https://auramatch-343501244023.europe-west1.run.app`
2. **Redirection OAuth problématique** : 
   - Click "Continuer avec Google" → `/api/auth/google`
   - Si seul le frontend est déployé → nginx redirige vers `/index.html` 
   - Résultat : boucle de redirection vers `/assets/index-BaP8Gd_e.js`

## 🔧 Solutions recommandées

### Solution 1 : Architecture séparée (RECOMMANDÉE)

**Déployez frontend et backend sur des services Cloud Run séparés :**

```bash
# Backend sur : auramatch-backend-xxxxx.europe-west1.run.app
# Frontend sur : auramatch-frontend-xxxxx.europe-west1.run.app (ou votre domaine principal)
```

**Avantages :**
- Séparation claire des responsabilités
- Scaling indépendant
- Debugging plus facile
- Configuration OAuth plus claire

**Configuration requise :**

1. **Backend .env** :
```bash
FRONTEND_URL=https://auramatch-frontend-xxxxx.europe-west1.run.app
GOOGLE_CALLBACK_URL=https://auramatch-backend-xxxxx.europe-west1.run.app/api/auth/google/callback
```

2. **Frontend .env** :
```bash
VITE_API_BASE_URL=https://auramatch-backend-xxxxx.europe-west1.run.app
```

3. **Google OAuth Console** :
```bash
Callback URI: https://auramatch-backend-xxxxx.europe-west1.run.app/api/auth/google/callback
Origines autorisées: https://auramatch-frontend-xxxxx.europe-west1.run.app
```

### Solution 2 : Service unique avec proxy (ALTERNATIVE)

**Utilisez nginx pour router les appels API :**

1. **Remplacez** `nginx/nginx.conf` par `nginx/nginx-proxy.conf`
2. **Modifiez** le Dockerfile pour inclure le backend :

```dockerfile
# Multi-stage build avec backend et frontend
FROM node:20-alpine as backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

FROM node:20-alpine as frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production - servir backend + frontend
FROM node:20-alpine
WORKDIR /app

# Install PM2
RUN npm install -g pm2

# Copy backend
COPY --from=backend-builder /app ./backend
# Copy frontend build
COPY --from=frontend-builder /app/dist ./public

# Install nginx
RUN apk add --no-cache nginx

# Copy nginx config
COPY nginx/nginx-proxy.conf /etc/nginx/conf.d/default.conf

# Start script
COPY start-services.sh ./
RUN chmod +x start-services.sh

EXPOSE 8080
CMD ["./start-services.sh"]
```

### Solution 3 : Correction immédiate (TEMPORAIRE)

**Pour tester rapidement, modifiez temporairement l'URL OAuth :**

Dans `components/Login.tsx` :
```javascript
const handleOAuthLogin = (provider: 'google' | 'facebook') => {
  // Utilisez une URL backend différente temporairement
  window.location.href = `https://votre-backend-service.run.app/api/auth/${provider}`;
};
```

## 🚨 Action recommandée

**Je recommande la Solution 1** (services séparés) car :
- Plus maintenable
- Meilleure séparation des préoccupations  
- Scaling indépendant
- Configuration OAuth plus claire
- Debugging plus simple

## 📋 Étapes pour implémenter la Solution 1

1. **Créer deux services Cloud Run** :
   - `auramatch-backend` (seulement le dossier `/backend`)
   - `auramatch-frontend` (build du frontend avec nginx)

2. **Mettre à jour les configurations d'environnement**

3. **Reconfigurer Google OAuth** avec les nouvelles URLs

4. **Tester le flux complet**

Voulez-vous que je vous aide à implémenter une de ces solutions ?
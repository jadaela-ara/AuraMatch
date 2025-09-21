# 🔧 Correction de l'erreur Docker build npm

## ❌ **Erreur rencontrée :**

```
ERROR: failed to build: process "/bin/sh -c npm ci --only=production && npm cache clean --force" did not complete successfully: exit code: 1
```

## 🎯 **Problèmes identifiés :**

1. **`--only=production` est obsolète** → Utiliser `--omit=dev`
2. **Dépendances natives manquantes** → Besoin de `python3`, `make`, `g++`
3. **Base image Alpine** peut causer des problèmes → Utiliser `node:slim`

## ✅ **Solutions (3 options) :**

---

### 🚀 **Solution 1 : Correction rapide (RECOMMANDÉE)**

Remplacez le Dockerfile backend :

```dockerfile
# Backend Dockerfile simple pour Cloud Run
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"]
```

### **Commandes pour appliquer :**

```bash
# Dans Cloud Shell, dans le répertoire AuraMatch
cd backend

# Sauvegardez l'ancien Dockerfile
cp Dockerfile Dockerfile.backup

# Remplacez par la version simple
cat > Dockerfile << 'EOF'
# Backend Dockerfile simple pour Cloud Run
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
EOF

# Retournez au répertoire parent et relancez
cd ..
./deploy-all.sh auramatch-470020 europe-west1
```

---

### 🔧 **Solution 2 : Correction Alpine (Alternative)**

Si vous préférez garder Alpine :

```dockerfile
# Backend Dockerfile pour Cloud Run - Version corrigée
FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache \
    dumb-init \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

COPY package*.json ./

# Use modern npm flag
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
```

---

### ⚡ **Solution 3 : Commandes manuelles Cloud Build (Debug)**

Si les Dockerfiles ne fonctionnent pas, utilisez Cloud Build directement :

```bash
# Dans le répertoire backend
cd backend

# Créez un cloudbuild.yaml personnalisé
cat > cloudbuild.yaml << 'EOF'
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'europe-west1-docker.pkg.dev/auramatch-470020/auramatch-backend/auramatch-backend:latest', '.']
  env:
  - 'DOCKER_BUILDKIT=1'
images:
- 'europe-west1-docker.pkg.dev/auramatch-470020/auramatch-backend/auramatch-backend:latest'
EOF

# Soumettez le build
gcloud builds submit --config cloudbuild.yaml
```

---

## 🎯 **Recommandation : Utilisez la Solution 1**

**Pourquoi ?**
- ✅ Plus compatible avec les dépendances natives
- ✅ `node:slim` plus stable que `alpine`
- ✅ Commandes npm standard
- ✅ Moins de problèmes de compatibilité

## 🚀 **Appliquez la correction maintenant :**

```bash
# Dans Cloud Shell, répertoire AuraMatch
cd backend

# Remplacez le Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
EOF

# Relancez le déploiement
cd ..
./deploy-all.sh auramatch-470020 europe-west1
```

## 🔍 **Si l'erreur persiste :**

### **Debug : Examinez les logs détaillés**

```bash
# Build manuel pour voir les erreurs détaillées
cd backend
gcloud builds submit --tag europe-west1-docker.pkg.dev/auramatch-470020/auramatch-backend/auramatch-backend:debug

# Ou testez localement
docker build -t test-backend .
```

### **Vérifiez package-lock.json**

```bash
# Régénérez package-lock.json si nécessaire
rm package-lock.json
npm install
```

---

## 📋 **Après correction :**

Le déploiement devrait continuer normalement :

```
🏗️ Build de l'image Docker backend
✅ Build réussi
📤 Push de l'image vers Container Registry
🚀 Déploiement sur Cloud Run
✅ Backend déployé avec succès!
```

---

🔧 **Appliquez la Solution 1 maintenant pour corriger l'erreur !**
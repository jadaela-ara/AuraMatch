# 📖 Guide détaillé : Lancer deploy-all.sh

## 🔍 **Étape 1: Vérifications préalables (2 minutes)**

### A. **Vérifiez votre emplacement**

```bash
# 1. Assurez-vous d'être dans le bon répertoire
pwd
# Vous devez être dans le répertoire de votre projet AuraMatch

# 2. Si nécessaire, naviguez vers le projet
cd /chemin/vers/votre/projet/AuraMatch
```

### B. **Vérifiez les prérequis**

```bash
# 1. Vérifiez que gcloud est installé
gcloud --version
# Devrait afficher : Google Cloud SDK xxx.x.x

# 2. Vérifiez que Docker est installé et fonctionne
docker --version
# Devrait afficher : Docker version xx.xx.x

# 3. Vérifiez que Docker fonctionne
docker info
# Devrait afficher les informations Docker sans erreur
```

### C. **Vérifiez l'authentification Google Cloud**

```bash
# 1. Listez vos comptes authentifiés
gcloud auth list
# Vous devriez voir votre compte Google actif avec un *

# 2. Vérifiez le projet actuel
gcloud config get-value project
# Devrait afficher : auramatch-470020

# 3. Si le projet n'est pas correct, configurez-le
gcloud config set project auramatch-470020
```

---

## 🛠️ **Étape 2: Préparation de l'environnement (1 minute)**

### A. **Vérifiez les fichiers nécessaires**

```bash
# 1. Vérifiez que le script existe et est exécutable
ls -la deploy-all.sh
# Devrait afficher : -rwxr-xr-x ... deploy-all.sh

# 2. Vérifiez les autres scripts
ls -la deploy-*.sh
# Devrait afficher :
# deploy-all.sh
# deploy-backend.sh  
# deploy-frontend.sh
```

### B. **Configurez Docker pour Google Cloud**

```bash
# Configurez Docker pour utiliser Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

---

## 🚀 **Étape 3: Lancement du déploiement**

### A. **La commande exacte**

```bash
./deploy-all.sh auramatch-470020 europe-west1
```

**Décomposition :**
- `./deploy-all.sh` : Execute le script dans le répertoire courant
- `auramatch-470020` : Votre PROJECT_ID Google Cloud
- `europe-west1` : La région de déploiement

### B. **Commande alternative avec paramètres explicites**

```bash
# Si vous préférez être plus explicite
bash deploy-all.sh auramatch-470020 europe-west1
```

### C. **Avec des logs détaillés (debug)**

```bash
# Pour voir plus de détails pendant l'exécution
bash -x deploy-all.sh auramatch-470020 europe-west1
```

---

## 📊 **Étape 4: Que va-t-il se passer ? (8-12 minutes)**

### **Phase 1: Déploiement Backend (3-5 minutes)**

```
🚀 Déploiement du backend AuraMatch sur Cloud Run
🔧 Configuration du projet Google Cloud
🔌 Activation des APIs nécessaires
📦 Installation des dépendances backend...
🏗️ Build de l'image Docker backend
📤 Push de l'image vers Container Registry
🚀 Déploiement sur Cloud Run
⏳ Attente du démarrage du backend...
✅ Backend démarré avec succès
🌐 URL du backend: https://auramatch-backend-xxxxx-ew.a.run.app
💾 URL sauvegardée dans .env.backend-url
```

### **Phase 2: Configuration automatique (1 minute)**

Le script récupère automatiquement l'URL du backend et la configure pour le frontend.

### **Phase 3: Déploiement Frontend (3-5 minutes)**

```
🚀 Déploiement du frontend AuraMatch sur Cloud Run
📝 Configuration des variables d'environnement
🏗️ Build de l'image Docker frontend
📤 Push de l'image vers Container Registry
🚀 Déploiement sur Cloud Run
🔧 Updating backend environment variables...
✅ Backend environment variables updated
```

### **Phase 4: Résumé final**

```
🎉 Déploiement complet terminé avec succès!

📱 URLs d'accès:
  Frontend: https://auramatch-frontend-xxxxx-ew.a.run.app
  Backend:  https://auramatch-backend-xxxxx-ew.a.run.app

🔧 Configuration OAuth Google requise:
  Callback URL: https://auramatch-backend-xxxxx-ew.a.run.app/api/auth/google/callback
  Origines autorisées: https://auramatch-frontend-xxxxx-ew.a.run.app

✅ Votre application est maintenant déployée avec l'architecture recommandée!
```

---

## 🔍 **Étape 5: Monitoring pendant l'exécution**

### **Que surveiller :**

1. **Pas d'erreurs d'authentification**
2. **Build Docker réussis**  
3. **Push vers Container Registry réussis**
4. **Déploiement Cloud Run réussi**
5. **Health checks qui passent**

### **Si des erreurs apparaissent :**

```bash
# Pour les erreurs Docker
docker info
docker system prune -f

# Pour les erreurs gcloud
gcloud auth login
gcloud config set project auramatch-470020

# Pour redémarrer le déploiement
./deploy-all.sh auramatch-470020 europe-west1
```

---

## 📋 **Étape 6: Après le déploiement**

### A. **Vérifiez les services déployés**

```bash
# Listez vos services Cloud Run
gcloud run services list --region=europe-west1

# Vérifiez les URLs
curl https://auramatch-backend-xxxxx-ew.a.run.app/api/health
```

### B. **Configurez OAuth Google**

1. **Allez sur** : https://console.cloud.google.com/apis/credentials
2. **Modifiez vos identifiants OAuth** avec les nouvelles URLs
3. **Testez** l'authentification sur le frontend

---

## ⚠️ **Problèmes courants et solutions**

### **Problème 1: Permission denied**
```bash
# Solution
chmod +x deploy-all.sh
./deploy-all.sh auramatch-470020 europe-west1
```

### **Problème 2: Docker not running**
```bash
# Sur Linux/Mac
sudo systemctl start docker

# Sur Windows avec Docker Desktop
# Démarrez Docker Desktop depuis le menu
```

### **Problème 3: gcloud not authenticated**
```bash
# Solution
gcloud auth login
gcloud config set project auramatch-470020
```

### **Problème 4: Region not supported**
```bash
# Vérifiez les régions disponibles
gcloud run regions list

# Utilisez une région proche
./deploy-all.sh auramatch-470020 europe-west3
```

---

## 🎯 **Résumé : Commande à exécuter**

```bash
# Commande simple
./deploy-all.sh auramatch-470020 europe-west1

# Durée : 8-12 minutes
# Résultat : Application complètement déployée
# OAuth : Problème résolu définitivement
```

---

🚀 **Prêt ? Lancez la commande maintenant !**
# ✅ Checklist pré-déploiement : deploy-all.sh

## 🔍 **Vérifications rapides (2 minutes)**

### **1. Environnement**
```bash
# ✅ Vous êtes dans le bon répertoire ?
pwd
# Doit contenir votre projet AuraMatch avec deploy-all.sh

# ✅ Le script existe et est exécutable ?
ls -la deploy-all.sh
# Doit afficher : -rwxr-xr-x ... deploy-all.sh
```

### **2. Google Cloud**
```bash
# ✅ gcloud est installé ?
gcloud --version

# ✅ Vous êtes authentifié ?
gcloud auth list
# Votre compte doit avoir un * (actif)

# ✅ Bon projet configuré ?
gcloud config get-value project
# Doit afficher : auramatch-470020
```

### **3. Docker**
```bash
# ✅ Docker est installé ?
docker --version

# ✅ Docker fonctionne ?
docker info
# Ne doit pas afficher d'erreur de connexion
```

### **4. Configuration Docker + Google Cloud**
```bash
# ✅ Docker configuré pour Artifact Registry ?
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

---

## 🚀 **Si tout est ✅ : Lancez le déploiement**

```bash
./deploy-all.sh auramatch-470020 europe-west1
```

---

## 🔧 **Corrections rapides si ❌**

### **❌ Script pas exécutable**
```bash
chmod +x deploy-all.sh
```

### **❌ Pas authentifié gcloud**
```bash
gcloud auth login
gcloud config set project auramatch-470020
```

### **❌ Docker pas démarré**
```bash
# Linux/Mac
sudo systemctl start docker

# Windows : Démarrez Docker Desktop
```

### **❌ Mauvais répertoire**
```bash
# Naviguez vers votre projet
cd /chemin/vers/AuraMatch
```

---

## ⏱️ **Timeline du déploiement**

| Temps | Étape | Description |
|-------|-------|-------------|
| 0-2min | Setup | Validation environnement + APIs |
| 2-6min | Backend | Build + Push + Deploy backend |
| 6-7min | Config | Configuration variables auto |
| 7-12min | Frontend | Build + Push + Deploy frontend |
| 12min | Résumé | URLs finales + instructions OAuth |

---

## 📊 **Ce que vous verrez défiler**

### **Phase 1 : Initialisation**
```
🚀 Déploiement complet d'AuraMatch sur Google Cloud Run
Project ID: auramatch-470020
Region: europe-west1

🔍 Vérifications préalables
✅ gcloud CLI trouvé
✅ Docker en cours d'exécution
🔧 Configuration du projet Google Cloud
🔌 Activation des APIs nécessaires
```

### **Phase 2 : Backend**
```
👉 Étape 1: Déploiement du backend
📦 Installation des dépendances backend...
🏗️ Build de l'image Docker backend
📤 Push de l'image vers Container Registry
🚀 Déploiement sur Cloud Run
⏳ Attente du démarrage du backend...
✅ Backend démarré avec succès
📍 Backend URL: https://auramatch-backend-xxxxx-ew.a.run.app
```

### **Phase 3 : Frontend**  
```
👉 Étape 2: Déploiement du frontend
📝 Configuration des variables d'environnement
🏗️ Build de l'image Docker frontend
📤 Push de l'image vers Container Registry
🚀 Déploiement sur Cloud Run
🔧 Mise à jour des variables d'environnement backend...
✅ Variables d'environnement mises à jour
```

### **Phase 4 : Finalisation**
```
🎉 Déploiement complet terminé avec succès!

📱 URLs de vos services:
  Frontend: https://auramatch-frontend-xxxxx-ew.a.run.app
  Backend:  https://auramatch-backend-xxxxx-ew.a.run.app

🔧 Configuration OAuth Google requise:
  1. Allez sur: https://console.cloud.google.com/apis/credentials
  2. Callback URL: https://auramatch-backend-xxxxx-ew.a.run.app/api/auth/google/callback
  3. Origines autorisées: https://auramatch-frontend-xxxxx-ew.a.run.app

✅ Votre application est maintenant déployée avec l'architecture recommandée!
```

---

## 🎯 **Action : Vérifiez la checklist et lancez !**

1. ✅ **Cochez** toutes les vérifications ci-dessus
2. 🚀 **Lancez** : `./deploy-all.sh auramatch-470020 europe-west1`
3. ☕ **Attendez** 8-12 minutes
4. 🎉 **Profitez** de votre application déployée !

**Votre problème OAuth sera résolu définitivement !** 🎯
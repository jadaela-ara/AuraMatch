# ⚡ QUICK START : Déployez en 3 commandes

## 🎯 **Objectif :** Résoudre votre problème OAuth en 10 minutes

### **Commande 1 : Vérifiez l'environnement**
```bash
gcloud auth list && docker info && pwd
```
**✅ Vous devez voir :** Votre compte Google actif, Docker qui fonctionne, et être dans le répertoire du projet

### **Commande 2 : Configurez (si nécessaire)**
```bash
gcloud config set project auramatch-470020 && gcloud auth configure-docker europe-west1-docker.pkg.dev
```

### **Commande 3 : DÉPLOYEZ !**
```bash
./deploy-all.sh auramatch-470020 europe-west1
```

## ⏱️ **Attendez 8-12 minutes et c'est fini !**

---

## 🚨 **En cas d'erreur :**

### **Erreur "Permission denied" :**
```bash
chmod +x deploy-all.sh
./deploy-all.sh auramatch-470020 europe-west1
```

### **Erreur "gcloud not found" :**
```bash
# Installez Google Cloud SDK : https://cloud.google.com/sdk/docs/install
# Puis authentifiez-vous :
gcloud auth login
```

### **Erreur "Docker not running" :**
```bash
# Démarrez Docker Desktop (Windows/Mac) ou :
sudo systemctl start docker  # Linux
```

---

## 🎉 **Résultat :**

Vous obtiendrez :
- ✅ **Frontend** : https://auramatch-frontend-xxxxx.run.app
- ✅ **Backend** : https://auramatch-backend-xxxxx.run.app  
- ✅ **Problème OAuth RÉSOLU** définitivement !

## 🔧 **Après déploiement (2 minutes) :**

1. **Configurez OAuth Google** avec les URLs générées
2. **Ajoutez les variables d'environnement** dans Cloud Run Console
3. **Testez "Continuer avec Google"** → ça marche ! ✅

---

## 🚀 **DÉPLOYEZ MAINTENANT :**

```bash
./deploy-all.sh auramatch-470020 europe-west1
```

**C'est parti !** 🎯
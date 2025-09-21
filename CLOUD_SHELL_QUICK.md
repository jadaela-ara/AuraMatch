# ⚡ Cloud Shell : 3 commandes pour déployer AuraMatch

## 🎯 **Vous êtes dans Google Cloud Shell ? Parfait !**

### **Commande 1: Récupérer le projet**
```bash
git clone https://github.com/jadaela-ara/AuraMatch.git && cd AuraMatch
```

### **Commande 2: Configuration rapide**
```bash
gcloud config set project auramatch-470020 && chmod +x deploy-all.sh
```

### **Commande 3: DÉPLOYER !**
```bash
./deploy-all.sh auramatch-470020 europe-west1
```

## ⏱️ **Attendez 8-12 minutes et c'est terminé !**

---

## 🌐 **Pourquoi Cloud Shell est parfait ?**

✅ **Déjà authentifié** - Pas besoin de `gcloud auth login`  
✅ **Docker inclus** - Pas d'installation nécessaire  
✅ **gcloud configuré** - Prêt à l'emploi  
✅ **Accès direct** aux APIs Google Cloud  

---

## 🚨 **Si erreur "repository already exists" :**

```bash
# Supprimez et reclonez
rm -rf AuraMatch
git clone https://github.com/jadaela-ara/AuraMatch.git && cd AuraMatch
```

---

## 🎉 **Résultat attendu :**

```
🎉 Déploiement complet terminé avec succès!

📱 URLs d'accès:
  Frontend: https://auramatch-frontend-xxxxx-ew.a.run.app
  Backend:  https://auramatch-backend-xxxxx-ew.a.run.app

🔧 Configuration OAuth Google requise:
  Callback URL: https://auramatch-backend-xxxxx-ew.a.run.app/api/auth/google/callback
  Origines autorisées: https://auramatch-frontend-xxxxx-ew.a.run.app
```

## 🔧 **Après déploiement :**

1. **Configurez OAuth Google** avec les URLs générées
2. **Ajoutez les variables d'environnement** dans la Console Cloud Run
3. **Testez "Continuer avec Google"** → ✅ Ça marche !

---

## 🚀 **LANCEZ MAINTENANT (commande complète) :**

```bash
git clone https://github.com/jadaela-ara/AuraMatch.git && cd AuraMatch && gcloud config set project auramatch-470020 && chmod +x deploy-all.sh && ./deploy-all.sh auramatch-470020 europe-west1
```

**Votre problème OAuth sera résolu en 10-15 minutes !** 🎯
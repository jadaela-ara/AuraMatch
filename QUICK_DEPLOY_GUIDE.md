# ⚡ Guide de déploiement rapide - AuraMatch

## 🚀 Option 1: Workflows GitHub Actions (Recommandé)

### Étape 1: Installer les workflows (2 min)

1. **Copiez les 3 fichiers workflows** depuis `WORKFLOWS_INSTALLATION.md`
2. **Créez** `.github/workflows/deploy-backend.yml`
3. **Créez** `.github/workflows/deploy-frontend.yml`  
4. **Créez** `.github/workflows/deploy-complete.yml`
5. **Commit et push**

### Étape 2: Lancer le déploiement (1 clic)

1. **GitHub.com** → Votre repo → **Actions**
2. **"Deploy Complete Application"** → **"Run workflow"**
3. ☕ **Attendez 8-12 minutes**
4. ✅ **URLs générées dans les logs**

---

## 🛠️ Option 2: Scripts bash (Immédiat)

### Déploiement en une commande :

```bash
./deploy-all.sh auramatch-470020 europe-west1
```

### Ou étape par étape :

```bash
# 1. Backend (3-5 min)
./deploy-backend.sh auramatch-470020 europe-west1

# 2. Configuration variables (2 min)
./configure-env.sh auramatch-470020 europe-west1

# 3. Frontend (3-5 min)
./deploy-frontend.sh auramatch-470020 europe-west1
```

---

## 📋 Après déploiement (les deux options)

### 1. Récupérer les URLs

Vous obtiendrez :
```
Frontend: https://auramatch-frontend-xxxxx-ew.a.run.app
Backend:  https://auramatch-backend-xxxxx-ew.a.run.app
```

### 2. Configurer OAuth Google

**Google Cloud Console** → **APIs & Services** → **Credentials**

Modifiez vos identifiants OAuth existants :
```
URIs de redirection autorisées:
https://auramatch-backend-xxxxx-ew.a.run.app/api/auth/google/callback

Origines JavaScript autorisées:
https://auramatch-frontend-xxxxx-ew.a.run.app
```

### 3. Configurer les variables d'environnement

**Cloud Run Console** → **auramatch-backend** → **Variables et secrets**

Ajoutez :
- `MONGODB_URI` : Votre URI MongoDB
- `JWT_SECRET` : Clé JWT sécurisée
- `GOOGLE_CLIENT_ID` : ID client Google
- `GOOGLE_CLIENT_SECRET` : Secret client Google
- Autres variables selon besoins

### 4. Tester

1. **Ouvrez** le frontend
2. **Cliquez** "Continuer avec Google"
3. **Vérifiez** l'authentification fonctionne ✅

---

## 🎯 Choix recommandé

| Méthode | Avantages | Inconvénients |
|---------|-----------|---------------|
| **Workflows GitHub** | ✅ Automatisé<br/>✅ CI/CD intégré<br/>✅ Réutilisable | ⏱️ Setup initial |
| **Scripts bash** | ✅ Immédiat<br/>✅ Pas de setup | 🔄 Manuel à chaque fois |

### Pour un déploiement immédiat :
```bash
./deploy-all.sh auramatch-470020 europe-west1
```

### Pour une solution long terme :
Installez les workflows GitHub Actions

---

## ❓ Support

- **Logs workflows** : GitHub Actions tab
- **Logs services** : Cloud Run Console  
- **Test backend** : `curl https://backend-url/api/health`
- **Variables manquantes** : Cloud Run → Variables et secrets

---

🚀 **Prêt à déployer ? Choisissez votre méthode !**
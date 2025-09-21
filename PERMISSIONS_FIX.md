# 🔧 Correction des permissions GitHub Actions

## ❌ **Erreur rencontrée :**

```
The nested job 'deploy' is requesting 'id-token: write', but is only allowed 'id-token: none'.
```

## 🎯 **Problème :**

Les workflows réutilisables (`workflow_call`) ne peuvent pas demander de permissions `id-token: write` si le workflow parent ne les hérite pas correctement.

## ✅ **Solutions (3 options) :**

---

### **🚀 Solution 1 : Workflow simple (RECOMMANDÉE)**

Remplacez `.github/workflows/deploy-complete.yml` par le contenu de `SIMPLE_deploy-complete.yml`.

**Avantages :**
- ✅ Pas de problème de permissions
- ✅ Tout dans un seul fichier  
- ✅ Plus simple à déboguer
- ✅ Fonctionne immédiatement

---

### **🔧 Solution 2 : Permissions explicites**

Si vous voulez garder les workflows séparés :

1. **Modifiez** `.github/workflows/deploy-complete.yml` :

```yaml
name: 'Deploy Complete Application'

on:
  workflow_dispatch:

permissions:        # ← AJOUT NÉCESSAIRE
  contents: 'read'
  id-token: 'write'

jobs:
  deploy-backend:
    uses: ./.github/workflows/deploy-backend.yml
    permissions:    # ← AJOUT NÉCESSAIRE
      contents: 'read'
      id-token: 'write'
    secrets: inherit
  
  deploy-frontend:
    needs: deploy-backend
    uses: ./.github/workflows/deploy-frontend.yml
    permissions:    # ← AJOUT NÉCESSAIRE
      contents: 'read'
      id-token: 'write'
    secrets: inherit
    with:
      backend_url: ${{ needs.deploy-backend.outputs.backend-url }}
```

2. **Supprimez** les sections `permissions:` dans `deploy-backend.yml` et `deploy-frontend.yml`

---

### **⚡ Solution 3 : Scripts bash (Immédiate)**

Ignorez les workflows et utilisez :

```bash
./deploy-all.sh auramatch-470020 europe-west1
```

---

## 🎯 **Recommandation :**

**Utilisez la Solution 1** (workflow simple) :

1. **Remplacez** `.github/workflows/deploy-complete.yml` par `SIMPLE_deploy-complete.yml`
2. **Supprimez** les autres workflows deploy-* (gardez seulement deploy-complete.yml)
3. **Testez** : GitHub → Actions → "Deploy Complete Application"

## 📋 **Pourquoi Solution 1 ?**

- ✅ **Simple** : Un seul fichier workflow
- ✅ **Fiable** : Pas de problème de permissions 
- ✅ **Complet** : Backend + Frontend + Configuration
- ✅ **Debuggable** : Tout visible en un coup d'œil
- ✅ **Maintenable** : Plus facile à modifier

## 🚀 **Test après correction :**

```bash
# Via GitHub Interface
GitHub → Actions → "Deploy Complete Application" → Run workflow

# Résultat attendu : 
# ✅ Backend déployé
# ✅ Frontend déployé avec URL backend
# ✅ Variables d'environnement mises à jour
# ✅ URLs finales dans le résumé
```

## 🎉 **Une fois corrigé :**

Vous aurez un déploiement automatique complet qui :
- ✅ Déploie backend puis frontend
- ✅ Configure automatiquement les URLs
- ✅ Met à jour les variables d'environnement  
- ✅ Affiche un résumé avec toutes les infos OAuth

---

🚀 **Action : Remplacez deploy-complete.yml par SIMPLE_deploy-complete.yml !**
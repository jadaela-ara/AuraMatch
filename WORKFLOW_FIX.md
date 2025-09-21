# 🔧 Correction des workflows GitHub Actions

## ❌ Problème rencontré

```
workflow is not reusable as it is missing a `on.workflow_call` trigger
```

## ✅ Solution

Les workflows appelés par `deploy-complete.yml` doivent avoir un trigger `workflow_call`.

## 📝 Fichiers à remplacer

### 1. Remplacez `.github/workflows/deploy-backend.yml`

```yaml
# Ajoutez cette section après les autres triggers :
on:
  push:
    branches: ['main']
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:
  workflow_call:    # ← AJOUT NÉCESSAIRE
    outputs:
      backend-url:
        description: "URL du service backend déployé"
        value: ${{ jobs.deploy.outputs.backend-url }}
```

### 2. Remplacez `.github/workflows/deploy-frontend.yml`

```yaml
# Ajoutez cette section après les autres triggers :
on:
  push:
    branches: ['main']
    paths:
      - '**'
      - '!backend/**'
  workflow_dispatch:
    inputs:
      backend_url:
        description: 'Backend URL (optional)'
        required: false
        type: string
  workflow_call:    # ← AJOUT NÉCESSAIRE
    inputs:
      backend_url:
        description: 'Backend URL from backend workflow'
        required: true
        type: string
    outputs:
      frontend-url:
        description: "URL du service frontend déployé"
        value: ${{ jobs.deploy.outputs.frontend-url }}
```

### 3. Mise à jour `.github/workflows/deploy-complete.yml`

```yaml
# Le workflow complet reste identique mais maintenant il peut appeler les autres
jobs:
  deploy-backend:
    name: 'Deploy Backend'
    uses: ./.github/workflows/deploy-backend.yml    # ← Maintenant possible
    secrets: inherit
  
  deploy-frontend:
    name: 'Deploy Frontend'  
    needs: deploy-backend
    uses: ./.github/workflows/deploy-frontend.yml   # ← Maintenant possible
    secrets: inherit
    with:
      backend_url: ${{ needs.deploy-backend.outputs.backend-url }}
```

## 🚀 Actions à effectuer

### Option 1: Remplacement complet (Recommandé)

1. **Supprimez** les 3 fichiers actuels dans `.github/workflows/`
2. **Copiez** le contenu complet depuis :
   - `FIXED_deploy-backend.yml` → `.github/workflows/deploy-backend.yml`
   - `FIXED_deploy-frontend.yml` → `.github/workflows/deploy-frontend.yml`
   - `FIXED_deploy-complete.yml` → `.github/workflows/deploy-complete.yml`
3. **Commit et push**

### Option 2: Modification manuelle

1. **Ajoutez** `workflow_call:` dans les sections `on:` des workflows backend et frontend
2. **Ajoutez** les `outputs:` requis
3. **Commit et push**

## ✅ Test

Après correction :

```bash
# Le workflow complet devrait maintenant fonctionner
GitHub → Actions → "Deploy Complete Application" → Run workflow
```

## 🎯 Résultat attendu

- ✅ Backend se déploie en premier
- ✅ Frontend se déploie avec l'URL du backend  
- ✅ Variables d'environnement mises à jour automatiquement
- ✅ URLs finales affichées dans le résumé

---

## 🚨 Solution alternative immédiate

Si vous voulez déployer **maintenant** sans corriger les workflows :

```bash
# Utilisez les scripts bash
./deploy-all.sh auramatch-470020 europe-west1
```

---

🔧 **Corrigez les workflows avec les fichiers FIXED_* fournis !**
# 🔍 Debug Workload Identity Federation

## 📋 **Étapes de diagnostic :**

### 1. **Vérifiez la configuration actuelle**

```bash
# Affichez la configuration complète de votre provider
gcloud iam workload-identity-pools providers describe github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023
```

### 2. **Identifiez les conditions d'attributs**

```bash
# Affichez seulement les conditions
gcloud iam workload-identity-pools providers describe github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --format="value(attributeCondition)"
```

### 3. **Vérifiez les mappings d'attributs**

```bash
# Affichez les mappings
gcloud iam workload-identity-pools providers describe github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --format="value(attributeMapping)"
```

## 🎯 **Problèmes courants et solutions :**

### **Problème 1 : Repository mismatch**

```bash
# Si la condition est trop strictive comme :
# attribute.repository == "old-repo-name/AuraMatch"

# Solution : Mettez à jour
gcloud iam workload-identity-pools providers update github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --attribute-condition="attribute.repository=='jadaela-ara/AuraMatch'"
```

### **Problème 2 : Branche restrictive**

```bash
# Si limité à une branche spécifique comme :
# attribute.ref == "refs/heads/specific-branch"

# Solution : Autoriser main
gcloud iam workload-identity-pools providers update github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --attribute-condition="attribute.repository=='jadaela-ara/AuraMatch' && attribute.ref=='refs/heads/main'"
```

### **Problème 3 : Actor restrictif**

```bash
# Si limité à un utilisateur spécifique
# attribute.actor == "old-username"

# Solution : Mettez à jour ou supprimez la condition
gcloud iam workload-identity-pools providers update github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --attribute-condition="attribute.repository=='jadaela-ara/AuraMatch'"
```

## 🔧 **Configuration recommandée :**

### **Configuration permissive pour votre repo :**

```bash
gcloud iam workload-identity-pools providers update github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --attribute-condition="attribute.repository_owner=='jadaela-ara'"
```

### **Configuration plus stricte (si nécessaire) :**

```bash
gcloud iam workload-identity-pools providers update github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --attribute-condition="attribute.repository=='jadaela-ara/AuraMatch' && (attribute.ref=='refs/heads/main' || attribute.ref=='refs/heads/master')"
```

## 🚨 **Si rien ne fonctionne :**

### **Recréez complètement le provider :**

```bash
# 1. Supprimez l'ancien
gcloud iam workload-identity-pools providers delete github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023

# 2. Recréez avec une configuration propre
gcloud iam workload-identity-pools providers create-oidc github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --project=343501244023 \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --allowed-audiences="https://github.com/jadaela-ara" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner,attribute.actor=assertion.actor,attribute.ref=assertion.ref" \
  --attribute-condition="attribute.repository_owner=='jadaela-ara'"

# 3. Rebindez au service account (si nécessaire)
gcloud iam service-accounts add-iam-policy-binding \
  YOUR_SERVICE_ACCOUNT@auramatch-470020.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/343501244023/locations/global/workloadIdentityPools/auramatch-pool/attribute.repository_owner/jadaela-ara"
```

## 📝 **Debug workflow temporaire :**

Ajoutez ceci à votre workflow pour debug :

```yaml
- name: 'Debug GitHub Context'
  run: |
    echo "Repository: ${{ github.repository }}"
    echo "Repository Owner: ${{ github.repository_owner }}"  
    echo "Ref: ${{ github.ref }}"
    echo "Actor: ${{ github.actor }}"
    echo "SHA: ${{ github.sha }}"
    echo "Event: ${{ github.event_name }}"
```

## 🎯 **Test rapide :**

Après correction, testez avec :

```bash
# Via GitHub Actions
GitHub → Actions → "Deploy Complete Application" → Run workflow

# Ou via CLI local (contournement)
./deploy-all.sh auramatch-470020 europe-west1
```

---

🔧 **La plupart des problèmes se résolvent en mettant à jour la condition d'attribut !**
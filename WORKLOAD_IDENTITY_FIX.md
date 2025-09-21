# 🔧 Correction Workload Identity Federation

## ❌ **Erreur rencontrée :**

```
failed to generate Google Cloud federated token: 
"The given credential is rejected by the attribute condition."
```

## 🎯 **Diagnostic :**

Votre Workload Identity Federation a des conditions d'attributs qui rejettent GitHub Actions.

## ✅ **Solutions :**

---

### 🚀 **Solution 1 : Scripts bash (IMMÉDIATE - RECOMMANDÉE)**

**Contournez** le problème en utilisant vos credentials gcloud locaux :

```bash
# Vérifiez que vous êtes authentifié
gcloud auth list

# Déployez avec vos credentials
./deploy-all.sh auramatch-470020 europe-west1
```

**Avantages :**
- ✅ Fonctionne immédiatement
- ✅ Pas de reconfiguration nécessaire
- ✅ Même résultat final
- ✅ Résout votre problème OAuth en 10 minutes

---

### 🔧 **Solution 2 : Vérifier la configuration Workload Identity**

#### A. Vérifiez les conditions d'attributs :

```bash
# Listez vos providers
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=auramatch-pool \
  --location=global

# Décrivez votre provider GitHub
gcloud iam workload-identity-pools providers describe github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global
```

#### B. Conditions courantes à vérifier :

```bash
# Le provider doit autoriser votre repo
attribute.repository == "jadaela-ara/AuraMatch"

# Ou toute branche de votre repo
attribute.repository_owner == "jadaela-ara"

# Vérifiez qu'il n'y a pas de restriction sur :
# - assertion.actor (votre utilisateur GitHub)
# - assertion.ref (branche main)
# - assertion.repository (nom exact du repo)
```

#### C. Si les conditions sont restrictives, mettez à jour :

```bash
# Exemple : autoriser tout votre repo
gcloud iam workload-identity-pools providers update github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --attribute-condition="attribute.repository=='jadaela-ara/AuraMatch'"
```

---

### 🔄 **Solution 3 : Recréer la configuration**

Si la Solution 2 ne fonctionne pas :

```bash
# 1. Supprimez le provider existant
gcloud iam workload-identity-pools providers delete github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global

# 2. Recréez avec des conditions plus permissives
gcloud iam workload-identity-pools providers create-oidc github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --allowed-audiences=https://github.com/jadaela-ara \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor,attribute.ref=assertion.ref" \
  --attribute-condition="attribute.repository_owner=='jadaela-ara'"
```

---

### ⚡ **Solution 4 : Service Account Key (Alternative)**

En dernier recours, utilisez une clé de service :

```bash
# 1. Créez une clé de service
gcloud iam service-accounts keys create key.json \
  --iam-account=your-service-account@auramatch-470020.iam.gserviceaccount.com

# 2. Ajoutez comme secret GitHub
# GitHub → Settings → Secrets → Actions
# Nom: GCP_SA_KEY
# Valeur: contenu de key.json

# 3. Modifiez le workflow pour utiliser la clé
```

---

## 🎯 **Recommandation :**

### **Pour déployer MAINTENANT :**

```bash
./deploy-all.sh auramatch-470020 europe-west1
```

### **Pour déboguer Workload Identity :**

```bash
# Vérifiez la configuration actuelle
gcloud iam workload-identity-pools providers describe github-oidc \
  --workload-identity-pool=auramatch-pool \
  --location=global \
  --format="value(attributeCondition)"
```

---

## 🔍 **Debug supplémentaire :**

Si vous voulez identifier le problème exact :

```bash
# 1. Vérifiez les attributs du token GitHub
# Dans votre workflow, ajoutez temporairement :
- name: Debug GitHub Token
  run: |
    echo "Repository: ${{ github.repository }}"
    echo "Ref: ${{ github.ref }}"  
    echo "Actor: ${{ github.actor }}"
    echo "SHA: ${{ github.sha }}"

# 2. Comparez avec les conditions de votre provider
```

---

## 🚀 **Action immédiate :**

**Utilisez les scripts bash** pendant que vous débogguez Workload Identity :

```bash
./deploy-all.sh auramatch-470020 europe-west1
```

Cela résoudra votre problème OAuth **maintenant** pendant que vous corrigez GitHub Actions ! 🎯
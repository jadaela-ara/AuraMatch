# 🔧 Installation des workflows GitHub Actions

## 📋 Étapes d'installation

### 1. Créer les fichiers workflows manuellement

Dans votre repository GitHub, créez ces 3 fichiers dans `.github/workflows/` :

#### A. `.github/workflows/deploy-backend.yml`

```yaml
# Workflow de déploiement Backend AuraMatch sur Cloud Run
name: 'Deploy Backend to Cloud Run'

on:
  push:
    branches: ['main']
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

env:
  PROJECT_ID: 'auramatch-470020'
  REGION: 'europe-west1'
  SERVICE: 'auramatch-backend'
  WORKLOAD_IDENTITY_PROVIDER: 'projects/343501244023/locations/global/workloadIdentityPools/auramatch-pool/providers/github-oidc'
  REGISTRY: 'europe-west1-docker.pkg.dev'
  REPOSITORY: 'auramatch-backend'

jobs:
  deploy:
    runs-on: 'ubuntu-latest'
    
    permissions:
      contents: 'read'
      id-token: 'write'
    
    outputs:
      backend-url: ${{ steps.deploy.outputs.url }}
    
    steps:
      - name: 'Checkout'
        uses: 'actions/checkout@v4'
      
      - id: 'auth'
        name: 'Authenticate to Google Cloud'
        uses: 'google-github-actions/auth@v2'
        with:
          workload_identity_provider: '${{ env.WORKLOAD_IDENTITY_PROVIDER }}'
      
      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v2'
      
      - name: 'Create Artifact Registry repository'
        run: |
          gcloud artifacts repositories describe ${{ env.REPOSITORY }} \
            --location=${{ env.REGION }} || \
          gcloud artifacts repositories create ${{ env.REPOSITORY }} \
            --repository-format=docker \
            --location=${{ env.REGION }} \
            --description="AuraMatch Backend Docker repository"
      
      - name: 'Docker Auth'
        uses: 'docker/login-action@v3'
        with:
          registry: ${{ env.REGISTRY }}
          username: 'oauth2accesstoken'
          password: '${{ steps.auth.outputs.auth_token }}'
      
      - name: 'Build and Push Backend Container'
        run: |
          DOCKER_TAG="${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.SERVICE }}:${{ github.sha }}"
          
          cd backend
          docker build -t "${DOCKER_TAG}" .
          docker push "${DOCKER_TAG}"
          
          echo "DOCKER_TAG=${DOCKER_TAG}" >> $GITHUB_ENV
      
      - name: 'Deploy Backend to Cloud Run'
        id: deploy
        uses: 'google-github-actions/deploy-cloudrun@v2'
        with:
          service: '${{ env.SERVICE }}'
          region: '${{ env.REGION }}'
          image: '${{ env.DOCKER_TAG }}'
          flags: |
            --allow-unauthenticated
            --port=3001
            --memory=1Gi
            --cpu=1
            --min-instances=0
            --max-instances=10
            --concurrency=80
            --timeout=300
          env_vars: |
            NODE_ENV=production
            PORT=3001
      
      - name: 'Show Backend URL'
        run: |
          echo "🚀 Backend deployed successfully!"
          echo "📍 Backend URL: ${{ steps.deploy.outputs.url }}"
          echo "🔗 API Health: ${{ steps.deploy.outputs.url }}/api/health"
```

#### B. `.github/workflows/deploy-frontend.yml`

```yaml
# Workflow de déploiement Frontend AuraMatch sur Cloud Run
name: 'Deploy Frontend to Cloud Run'

on:
  push:
    branches: ['main']
    paths:
      - '**'
      - '!backend/**'
      - '!.github/workflows/deploy-backend.yml'
  workflow_dispatch:
    inputs:
      backend_url:
        description: 'Backend URL (optional)'
        required: false
        type: string

env:
  PROJECT_ID: 'auramatch-470020'
  REGION: 'europe-west1'
  SERVICE: 'auramatch-frontend'
  BACKEND_SERVICE: 'auramatch-backend'
  WORKLOAD_IDENTITY_PROVIDER: 'projects/343501244023/locations/global/workloadIdentityPools/auramatch-pool/providers/github-oidc'
  REGISTRY: 'europe-west1-docker.pkg.dev'
  REPOSITORY: 'auramatch-frontend'

jobs:
  deploy:
    runs-on: 'ubuntu-latest'
    
    permissions:
      contents: 'read'
      id-token: 'write'
    
    steps:
      - name: 'Checkout'
        uses: 'actions/checkout@v4'
      
      - id: 'auth'
        name: 'Authenticate to Google Cloud'
        uses: 'google-github-actions/auth@v2'
        with:
          workload_identity_provider: '${{ env.WORKLOAD_IDENTITY_PROVIDER }}'
      
      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v2'
      
      - name: 'Get Backend URL'
        id: backend
        run: |
          if [[ -n "${{ github.event.inputs.backend_url }}" ]]; then
            BACKEND_URL="${{ github.event.inputs.backend_url }}"
          else
            BACKEND_URL=$(gcloud run services describe ${{ env.BACKEND_SERVICE }} \
              --region=${{ env.REGION }} \
              --format="value(status.url)" 2>/dev/null || echo "")
            
            if [[ -z "$BACKEND_URL" ]]; then
              echo "❌ Backend service not found. Deploy backend first."
              exit 1
            fi
          fi
          
          echo "BACKEND_URL=$BACKEND_URL" >> $GITHUB_ENV
      
      - name: 'Create Artifact Registry repository'
        run: |
          gcloud artifacts repositories describe ${{ env.REPOSITORY }} \
            --location=${{ env.REGION }} || \
          gcloud artifacts repositories create ${{ env.REPOSITORY }} \
            --repository-format=docker \
            --location=${{ env.REGION }} \
            --description="AuraMatch Frontend Docker repository"
      
      - name: 'Docker Auth'
        uses: 'docker/login-action@v3'
        with:
          registry: ${{ env.REGISTRY }}
          username: 'oauth2accesstoken'
          password: '${{ steps.auth.outputs.auth_token }}'
      
      - name: 'Prepare Frontend Build'
        run: |
          cat > .env.production << EOF
          VITE_API_BASE_URL=${{ env.BACKEND_URL }}
          VITE_SOCKET_URL=${{ env.BACKEND_URL }}
          VITE_NODE_ENV=production
          EOF
          
          cp .dockerignore.frontend .dockerignore
      
      - name: 'Build and Push Frontend Container'
        run: |
          DOCKER_TAG="${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.SERVICE }}:${{ github.sha }}"
          
          docker build -f Dockerfile.frontend -t "${DOCKER_TAG}" .
          docker push "${DOCKER_TAG}"
          
          echo "DOCKER_TAG=${DOCKER_TAG}" >> $GITHUB_ENV
      
      - name: 'Deploy Frontend to Cloud Run'
        id: deploy
        uses: 'google-github-actions/deploy-cloudrun@v2'
        with:
          service: '${{ env.SERVICE }}'
          region: '${{ env.REGION }}'
          image: '${{ env.DOCKER_TAG }}'
          flags: |
            --allow-unauthenticated
            --port=8080
            --memory=512Mi
            --cpu=1
            --min-instances=0
            --max-instances=5
            --concurrency=80
            --timeout=300
      
      - name: 'Update Backend Environment Variables'
        run: |
          FRONTEND_URL="${{ steps.deploy.outputs.url }}"
          
          gcloud run services update ${{ env.BACKEND_SERVICE }} \
            --region=${{ env.REGION }} \
            --update-env-vars="FRONTEND_URL=${FRONTEND_URL}" \
            --update-env-vars="GOOGLE_CALLBACK_URL=${{ env.BACKEND_URL }}/api/auth/google/callback"
      
      - name: 'Show Deployment Summary'
        run: |
          echo "🎉 Frontend deployed successfully!"
          echo "📍 Frontend URL: ${{ steps.deploy.outputs.url }}"
          echo "🔗 Backend URL: ${{ env.BACKEND_URL }}"
```

#### C. `.github/workflows/deploy-complete.yml`

```yaml
# Workflow de déploiement complet AuraMatch
name: 'Deploy Complete Application'

on:
  workflow_dispatch:

jobs:
  deploy-backend:
    uses: ./.github/workflows/deploy-backend.yml
    secrets: inherit
  
  deploy-frontend:
    needs: deploy-backend
    uses: ./.github/workflows/deploy-frontend.yml
    secrets: inherit
    with:
      backend_url: ${{ needs.deploy-backend.outputs.backend-url }}
  
  summary:
    needs: [deploy-backend, deploy-frontend]
    runs-on: ubuntu-latest
    
    steps:
      - name: 'Deployment Summary'
        run: |
          echo "🎉 Complete AuraMatch deployment finished!"
          echo "📱 Application ready at your Cloud Run URLs"
```

### 2. Commit et push

Après avoir créé ces fichiers :

```bash
git add .github/workflows/
git commit -m "Add GitHub Actions workflows for Cloud Run deployment"
git push origin main
```

## 🚀 Comment lancer les workflows

### Option 1: Déploiement manuel (Interface GitHub)

1. **Allez sur votre repo GitHub**
2. **Onglet "Actions"**
3. **Sélectionnez un workflow :**
   - `Deploy Backend to Cloud Run`
   - `Deploy Frontend to Cloud Run`
   - `Deploy Complete Application`
4. **Cliquez "Run workflow"**
5. **Confirmez avec "Run workflow"**

### Option 2: Déploiement automatique

Les workflows se déclenchent automatiquement :

```bash
# Push sur main → déclenche les workflows selon les fichiers modifiés
git push origin main

# Modifications dans /backend → déclenche deploy-backend.yml
# Modifications hors /backend → déclenche deploy-frontend.yml
```

### Option 3: CLI GitHub (si installé)

```bash
# Déploiement complet
gh workflow run deploy-complete.yml

# Backend seulement
gh workflow run deploy-backend.yml

# Frontend seulement (avec URL backend)
gh workflow run deploy-frontend.yml -f backend_url="https://your-backend-url"
```

## 📋 Ordre de déploiement recommandé

1. **Premier déploiement :**
   ```
   Deploy Complete Application (workflows complet)
   ```

2. **Déploiements suivants :**
   - Backend modifié → Workflow backend auto
   - Frontend modifié → Workflow frontend auto
   - Ou manuel selon besoin

## ⚙️ Après le premier déploiement

1. **Configurez les variables d'environnement** via Console Cloud Run
2. **Configurez OAuth Google** avec les URLs générées
3. **Testez l'authentification**

## 🎯 URLs générées

Après déploiement, vous aurez :
- Frontend: `https://auramatch-frontend-xxxxx-ew.a.run.app`
- Backend: `https://auramatch-backend-xxxxx-ew.a.run.app`

---

🚀 **Créez les workflows et lancez "Deploy Complete Application" !**
#!/bin/bash

# Script de déploiement Frontend AuraMatch sur Google Cloud Run
set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
PROJECT_ID=${1:-"auramatch-project"}
REGION=${2:-"europe-west1"}
SERVICE_NAME="auramatch-frontend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
BACKEND_URL=${3:-""}

echo -e "${BLUE}🚀 Déploiement du frontend AuraMatch sur Cloud Run${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Service: ${SERVICE_NAME}${NC}"

# Charger l'URL du backend si disponible
if [ -f ".env.backend-url" ]; then
    source .env.backend-url
    echo -e "${BLUE}Backend URL: ${VITE_API_BASE_URL}${NC}"
elif [ -n "$BACKEND_URL" ]; then
    VITE_API_BASE_URL=$BACKEND_URL
    echo -e "${BLUE}Backend URL: ${VITE_API_BASE_URL}${NC}"
else
    echo -e "${RED}❌ URL du backend non trouvée${NC}"
    echo -e "${YELLOW}Utilisez: ./deploy-frontend.sh PROJECT_ID REGION BACKEND_URL${NC}"
    echo -e "${YELLOW}Ou déployez d'abord le backend avec: ./deploy-backend.sh${NC}"
    exit 1
fi

# Vérifier que gcloud est installé et configuré
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI n'est pas installé${NC}"
    exit 1
fi

# Vérifier que Docker est en cours d'exécution
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas en cours d'exécution${NC}"
    exit 1
fi

# Configurer le projet
echo -e "${BLUE}🔧 Configuration du projet Google Cloud${NC}"
gcloud config set project ${PROJECT_ID}

# Créer le fichier .env de production avec l'URL du backend
echo -e "${BLUE}📝 Configuration des variables d'environnement${NC}"
cat > .env.production << EOF
VITE_API_BASE_URL=${VITE_API_BASE_URL}
VITE_SOCKET_URL=${VITE_API_BASE_URL}
VITE_NODE_ENV=production
EOF

# Build et push de l'image Docker
echo -e "${BLUE}🏗️ Build de l'image Docker frontend${NC}"
# Utiliser le .dockerignore spécifique au frontend
cp .dockerignore.frontend .dockerignore
docker build -f Dockerfile.frontend -t ${IMAGE_NAME} .
# Restaurer le .dockerignore original s'il existe
git checkout .dockerignore 2>/dev/null || rm .dockerignore

echo -e "${BLUE}📤 Push de l'image vers Container Registry${NC}"
docker push ${IMAGE_NAME}

# Déployer sur Cloud Run
echo -e "${BLUE}🚀 Déploiement sur Cloud Run${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80

# Récupérer l'URL du service
FRONTEND_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo -e "${GREEN}✅ Déploiement frontend terminé avec succès!${NC}"
echo -e "${GREEN}🌐 URL du frontend: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}🔗 URL du backend: ${VITE_API_BASE_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Configuration OAuth Google:${NC}"
echo -e "Callback URL: ${VITE_API_BASE_URL}/api/auth/google/callback"
echo -e "Origines autorisées: ${FRONTEND_URL}"
echo ""
echo -e "${YELLOW}⚙️ Variables d'environnement backend à configurer:${NC}"
echo -e "FRONTEND_URL=${FRONTEND_URL}"
echo -e "GOOGLE_CALLBACK_URL=${VITE_API_BASE_URL}/api/auth/google/callback"
echo -e "FACEBOOK_CALLBACK_URL=${VITE_API_BASE_URL}/api/auth/facebook/callback"
echo ""

# Nettoyer
rm -f .env.production
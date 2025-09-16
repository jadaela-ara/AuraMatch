#!/bin/bash

# Script de déploiement Backend AuraMatch sur Google Cloud Run
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
SERVICE_NAME="auramatch-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${BLUE}🚀 Déploiement du backend AuraMatch sur Cloud Run${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Service: ${SERVICE_NAME}${NC}"

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

# Activer les APIs nécessaires
echo -e "${BLUE}🔌 Activation des APIs nécessaires${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build et push de l'image Docker
echo -e "${BLUE}🏗️ Build de l'image Docker backend${NC}"
cd backend
docker build -t ${IMAGE_NAME} .
cd ..

echo -e "${BLUE}📤 Push de l'image vers Container Registry${NC}"
docker push ${IMAGE_NAME}

# Déployer sur Cloud Run
echo -e "${BLUE}🚀 Déploiement sur Cloud Run${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 3001 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars NODE_ENV=production,PORT=3001

# Récupérer l'URL du service
BACKEND_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo -e "${GREEN}✅ Déploiement backend terminé avec succès!${NC}"
echo -e "${GREEN}🌐 URL du backend: ${BACKEND_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo -e "1. Configurez les variables d'environnement via la console Cloud Run"
echo -e "2. Mettez à jour VITE_API_BASE_URL dans le frontend avec: ${BACKEND_URL}"
echo -e "3. Configurez Google OAuth avec: ${BACKEND_URL}/api/auth/google/callback"
echo -e "4. Déployez le frontend avec: ./deploy-frontend.sh"
echo ""

# Sauvegarder l'URL pour le frontend
echo "VITE_API_BASE_URL=${BACKEND_URL}" > .env.backend-url
echo -e "${BLUE}💾 URL sauvegardée dans .env.backend-url${NC}"
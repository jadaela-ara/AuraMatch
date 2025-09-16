#!/bin/bash

# Script de configuration des variables d'environnement pour Cloud Run
set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID=${1:-""}
REGION=${2:-"europe-west1"}

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Usage: ./configure-env.sh PROJECT_ID [REGION]${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Configuration des variables d'environnement Cloud Run${NC}"
echo -e "${BLUE}Project: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"

# Récupérer les URLs des services
echo -e "${BLUE}📡 Récupération des URLs des services...${NC}"
BACKEND_URL=$(gcloud run services describe auramatch-backend --region=${REGION} --project=${PROJECT_ID} --format="value(status.url)" 2>/dev/null || echo "")
FRONTEND_URL=$(gcloud run services describe auramatch-frontend --region=${REGION} --project=${PROJECT_ID} --format="value(status.url)" 2>/dev/null || echo "")

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Service auramatch-backend non trouvé. Déployez d'abord le backend.${NC}"
    exit 1
fi

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${YELLOW}⚠️ Service auramatch-frontend non trouvé. Configurez d'abord le backend.${NC}"
    FRONTEND_URL="https://auramatch-frontend-XXXXXXXXX.run.app"
fi

echo -e "${GREEN}✅ Backend URL: ${BACKEND_URL}${NC}"
echo -e "${GREEN}✅ Frontend URL: ${FRONTEND_URL}${NC}"

# Demander les variables manquantes
echo ""
echo -e "${YELLOW}📝 Configuration des variables d'environnement${NC}"

read -p "MongoDB URI: " MONGODB_URI
read -s -p "JWT Secret: " JWT_SECRET
echo ""
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -s -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""
read -p "Gemini API Key (optionnel): " GEMINI_API_KEY

# Configurer les variables d'environnement du backend
echo -e "${BLUE}🔧 Configuration du backend...${NC}"

gcloud run services update auramatch-backend \
  --region=${REGION} \
  --project=${PROJECT_ID} \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=3001" \
  --set-env-vars="FRONTEND_URL=${FRONTEND_URL}" \
  --set-env-vars="GOOGLE_CALLBACK_URL=${BACKEND_URL}/api/auth/google/callback" \
  --set-env-vars="FACEBOOK_CALLBACK_URL=${BACKEND_URL}/api/auth/facebook/callback" \
  --set-env-vars="MONGODB_URI=${MONGODB_URI}" \
  --set-env-vars="JWT_SECRET=${JWT_SECRET}" \
  --set-env-vars="JWT_EXPIRES_IN=7d" \
  --set-env-vars="GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" \
  --set-env-vars="GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" \
  --set-env-vars="RATE_LIMIT_WINDOW_MINUTES=15" \
  --set-env-vars="RATE_LIMIT_MAX_REQUESTS=100"

if [ -n "$GEMINI_API_KEY" ]; then
    gcloud run services update auramatch-backend \
      --region=${REGION} \
      --project=${PROJECT_ID} \
      --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY}"
fi

echo -e "${GREEN}✅ Variables d'environnement configurées avec succès!${NC}"
echo ""
echo -e "${YELLOW}🔧 Configuration OAuth Google requise:${NC}"
echo -e "1. Allez sur: ${BLUE}https://console.cloud.google.com/apis/credentials${NC}"
echo -e "2. Callback URL: ${BLUE}${BACKEND_URL}/api/auth/google/callback${NC}"
echo -e "3. Origines autorisées: ${BLUE}${FRONTEND_URL}${NC}"
echo ""
echo -e "${GREEN}🎉 Configuration terminée! Testez votre application:${NC}"
echo -e "   ${BLUE}${FRONTEND_URL}${NC}"
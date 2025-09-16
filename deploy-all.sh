#!/bin/bash

# Script de déploiement complet AuraMatch sur Google Cloud Run
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

echo -e "${BLUE}🚀 Déploiement complet d'AuraMatch sur Google Cloud Run${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""

# Vérifications préalables
echo -e "${BLUE}🔍 Vérifications préalables${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI n'est pas installé${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas en cours d'exécution${NC}"
    exit 1
fi

# Rendre les scripts exécutables
chmod +x deploy-backend.sh
chmod +x deploy-frontend.sh

# 1. Déployer le backend
echo -e "${BLUE}👉 Étape 1: Déploiement du backend${NC}"
./deploy-backend.sh ${PROJECT_ID} ${REGION}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Échec du déploiement backend${NC}"
    exit 1
fi

# 2. Attendre un peu pour que le backend soit prêt
echo -e "${BLUE}⏳ Attente de la stabilisation du backend...${NC}"
sleep 30

# 3. Déployer le frontend
echo -e "${BLUE}👉 Étape 2: Déploiement du frontend${NC}"
./deploy-frontend.sh ${PROJECT_ID} ${REGION}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Échec du déploiement frontend${NC}"
    exit 1
fi

# Récupérer les URLs finales
BACKEND_URL=$(gcloud run services describe auramatch-backend --region=${REGION} --format="value(status.url)")
FRONTEND_URL=$(gcloud run services describe auramatch-frontend --region=${REGION} --format="value(status.url)")

echo ""
echo -e "${GREEN}🎉 Déploiement complet terminé avec succès!${NC}"
echo ""
echo -e "${GREEN}📱 URLs de vos services:${NC}"
echo -e "  Frontend: ${BLUE}${FRONTEND_URL}${NC}"
echo -e "  Backend:  ${BLUE}${BACKEND_URL}${NC}"
echo ""
echo -e "${YELLOW}🔧 Configuration OAuth Google requise:${NC}"
echo -e "  1. Allez sur: ${BLUE}https://console.cloud.google.com/apis/credentials${NC}"
echo -e "  2. Callback URL: ${BLUE}${BACKEND_URL}/api/auth/google/callback${NC}"
echo -e "  3. Origines autorisées: ${BLUE}${FRONTEND_URL}${NC}"
echo ""
echo -e "${YELLOW}⚙️ Variables d'environnement à configurer dans Cloud Run:${NC}"
echo -e "${YELLOW}Backend (auramatch-backend):${NC}"
echo -e "  - FRONTEND_URL=${FRONTEND_URL}"
echo -e "  - GOOGLE_CALLBACK_URL=${BACKEND_URL}/api/auth/google/callback"
echo -e "  - FACEBOOK_CALLBACK_URL=${BACKEND_URL}/api/auth/facebook/callback"
echo -e "  - MONGODB_URI=mongodb+srv://..."
echo -e "  - JWT_SECRET=..."
echo -e "  - GOOGLE_CLIENT_ID=..."
echo -e "  - GOOGLE_CLIENT_SECRET=..."
echo ""
echo -e "${GREEN}✅ Votre application est maintenant déployée avec l'architecture recommandée!${NC}"
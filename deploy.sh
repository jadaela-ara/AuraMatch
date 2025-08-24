#!/bin/bash

# Script de déploiement AuraMatch
set -e

echo "🚀 Déploiement d'AuraMatch..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-development}
BACKEND_PORT=${2:-3001}
FRONTEND_PORT=${3:-5173}

echo -e "${BLUE}Environnement: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Backend Port: ${BACKEND_PORT}${NC}"
echo -e "${BLUE}Frontend Port: ${FRONTEND_PORT}${NC}"

# Vérifier que les fichiers de configuration existent
if [ ! -f "./backend/.env" ]; then
    echo -e "${RED}❌ Fichier backend/.env manquant${NC}"
    echo -e "${YELLOW}Copiez backend/.env.example vers backend/.env et configurez les variables${NC}"
    exit 1
fi

if [ ! -f "./.env.local" ]; then
    echo -e "${RED}❌ Fichier .env.local manquant${NC}"
    echo -e "${YELLOW}Créez le fichier .env.local avec la configuration frontend${NC}"
    exit 1
fi

# Installer les dépendances backend
echo -e "${BLUE}📦 Installation des dépendances backend...${NC}"
cd backend
npm ci --only=production
cd ..

# Installer les dépendances frontend
echo -e "${BLUE}📦 Installation des dépendances frontend...${NC}"
npm ci

# Build du frontend
echo -e "${BLUE}🏗️ Build du frontend...${NC}"
npm run build

# Vérifier MongoDB
echo -e "${BLUE}🗄️ Vérification de MongoDB...${NC}"
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.adminCommand('ping')" --quiet || {
        echo -e "${YELLOW}⚠️ MongoDB n'est pas accessible. Démarrage avec Docker...${NC}"
        docker-compose up -d mongodb
        sleep 10
    }
elif command -v mongo &> /dev/null; then
    mongo --eval "db.adminCommand('ping')" --quiet || {
        echo -e "${YELLOW}⚠️ MongoDB n'est pas accessible. Démarrage avec Docker...${NC}"
        docker-compose up -d mongodb
        sleep 10
    }
else
    echo -e "${YELLOW}⚠️ MongoDB CLI non trouvé. Démarrage avec Docker...${NC}"
    docker-compose up -d mongodb
    sleep 10
fi

# Installer PM2 globalement si pas présent
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}📦 Installation de PM2...${NC}"
    npm install -g pm2
fi

# Arrêter les services existants
echo -e "${BLUE}🛑 Arrêt des services existants...${NC}"
pm2 stop auramatch-backend 2>/dev/null || true
pm2 delete auramatch-backend 2>/dev/null || true

# Démarrer le backend avec PM2
echo -e "${BLUE}🚀 Démarrage du backend...${NC}"
cd backend
pm2 start ecosystem.config.js
cd ..

# Attendre que le backend soit prêt
echo -e "${BLUE}⏳ Attente du démarrage du backend...${NC}"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f -s "http://localhost:${BACKEND_PORT}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend démarré avec succès${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -e "${YELLOW}Tentative ${attempt}/${max_attempts}...${NC}"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Échec du démarrage du backend${NC}"
    pm2 logs auramatch-backend --nostream
    exit 1
fi

# Afficher les URLs d'accès
echo -e "${GREEN}🎉 Déploiement terminé avec succès!${NC}"
echo ""
echo -e "${GREEN}📱 URLs d'accès:${NC}"
echo -e "  Frontend: ${BLUE}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  Backend API: ${BLUE}http://localhost:${BACKEND_PORT}/api${NC}"
echo -e "  API Health: ${BLUE}http://localhost:${BACKEND_PORT}/api/health${NC}"
echo ""
echo -e "${GREEN}🔧 Commandes utiles:${NC}"
echo -e "  Logs backend: ${YELLOW}pm2 logs auramatch-backend${NC}"
echo -e "  Statut services: ${YELLOW}pm2 status${NC}"
echo -e "  Redémarrer backend: ${YELLOW}pm2 restart auramatch-backend${NC}"
echo -e "  Arrêter services: ${YELLOW}pm2 stop auramatch-backend${NC}"
echo ""

# Optionnel: démarrer un serveur de dev frontend
if [ "$ENVIRONMENT" = "development" ]; then
    echo -e "${BLUE}🎨 Démarrage du serveur de développement frontend...${NC}"
    echo -e "${YELLOW}Utilisez Ctrl+C pour arrêter${NC}"
    npm run dev
fi
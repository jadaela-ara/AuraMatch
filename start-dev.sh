#!/bin/bash

# Script de démarrage rapide pour AuraMatch en mode développement
# Usage: ./start-dev.sh

echo "🚀 Démarrage d'AuraMatch en mode développement..."
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez Node.js 18+ d'abord."
    exit 1
fi

echo "✅ Node.js $(node --version) détecté"

# Vérifier MongoDB
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB CLI non détecté. Assurez-vous que MongoDB est installé et en cours d'exécution."
    echo "   Pour installer MongoDB : https://www.mongodb.com/docs/manual/installation/"
else
    echo "✅ MongoDB CLI détecté"
fi

# Vérifier les variables d'environnement backend
echo ""
echo "📝 Vérification de la configuration backend..."

if [ ! -f "backend/.env" ]; then
    echo "❌ Fichier backend/.env non trouvé!"
    echo "   Copiez backend/.env.example vers backend/.env et configurez-le."
    exit 1
fi

# Vérifier si Gemini API Key est configurée
if grep -q "your_gemini_api_key_here" backend/.env; then
    echo "⚠️  ATTENTION: Gemini API Key non configurée!"
    echo "   L'application fonctionnera mais utilisera des profils par défaut."
    echo "   Pour obtenir une clé : https://makersuite.google.com/app/apikey"
    echo ""
else
    echo "✅ Gemini API Key configurée"
fi

# Vérifier MongoDB URI
if grep -q "mongodb://localhost:27017" backend/.env; then
    echo "✅ MongoDB local configuré"
    # Tester la connexion MongoDB
    if ! timeout 2 bash -c 'cat < /dev/null > /dev/tcp/localhost/27017' 2>/dev/null; then
        echo "⚠️  MongoDB ne semble pas être en cours d'exécution sur localhost:27017"
        echo "   Démarrez MongoDB avec : sudo systemctl start mongodb (Linux) ou brew services start mongodb-community (macOS)"
        echo ""
    else
        echo "✅ MongoDB est accessible sur localhost:27017"
    fi
elif grep -q "mongodb+srv://" backend/.env; then
    echo "✅ MongoDB Atlas configuré"
else
    echo "⚠️  MongoDB URI non configuré ou invalide"
fi

# Installer les dépendances si nécessaire
echo ""
echo "📦 Vérification des dépendances..."

if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances frontend..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installation des dépendances backend..."
    cd backend && npm install && cd ..
fi

echo "✅ Dépendances installées"
echo ""

# Démarrer les services
echo "🎬 Démarrage des services..."
echo ""

# Fonction pour arrêter proprement les processus
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Démarrer le backend
echo "▶️  Démarrage du backend sur http://localhost:3001..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 3

# Vérifier si le backend est démarré
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "❌ Le backend n'a pas démarré correctement. Vérifiez les logs dans backend.log"
    cat backend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend démarré avec succès!"

# Démarrer le frontend
echo "▶️  Démarrage du frontend sur http://localhost:5173..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Attendre que le frontend démarre
sleep 5

echo ""
echo "✨ AuraMatch est prêt!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   API Health: http://localhost:3001/api/health"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "⏹️  Appuyez sur Ctrl+C pour arrêter les services"
echo ""

# Garder le script en cours d'exécution
wait $BACKEND_PID $FRONTEND_PID

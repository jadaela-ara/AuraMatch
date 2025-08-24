import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler, createError } from '../middlewares/errorHandler.js';
import { requireCompleteProfile } from '../middlewares/auth.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

// Middleware de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

// Obtenir les matches recommandés
router.get('/recommendations', [
  query('limit').optional().isInt({ min: 1, max: 50 }).default(10),
  query('offset').optional().isInt({ min: 0 }).default(0)
], requireCompleteProfile, handleValidationErrors, asyncHandler(async (req, res) => {
  const { limit, offset } = req.query;
  const currentUser = req.user;

  // Construire les critères de recherche basés sur les préférences
  const searchCriteria = {
    _id: { $ne: currentUser._id },
    isActive: true,
    isProfileComplete: true,
    age: {
      $gte: currentUser.preferences?.ageRange?.min || 18,
      $lte: currentUser.preferences?.ageRange?.max || 65
    }
  };

  // Exclure les utilisateurs déjà vus/likés
  const seenUserIds = currentUser.matches.map(match => match.userId);
  if (seenUserIds.length > 0) {
    searchCriteria._id.$nin = seenUserIds;
  }

  // Chercher les candidats potentiels
  const candidates = await User.find(searchCriteria)
    .select('-password -socialMediaData -questionnaireAnswers')
    .limit(parseInt(limit) * 2) // Récupérer plus pour filtrer
    .skip(parseInt(offset));

  // Calculer la compatibilité pour chaque candidat
  const matchesWithScores = [];

  for (const candidate of candidates) {
    try {
      const compatibility = await geminiService.generateCompatibilityScore(
        currentUser.getPublicProfile(),
        candidate.getPublicProfile()
      );

      matchesWithScores.push({
        ...candidate.getPublicProfile(),
        compatibilityScore: compatibility.compatibilityScore,
        compatibilityBreakdown: compatibility.compatibilityBreakdown,
        source: 'algorithm'
      });
    } catch (error) {
      console.error('Erreur calcul compatibilité:', error);
      // Score par défaut en cas d'erreur
      matchesWithScores.push({
        ...candidate.getPublicProfile(),
        compatibilityScore: Math.floor(Math.random() * 30) + 50, // 50-80
        compatibilityBreakdown: [],
        source: 'algorithm'
      });
    }
  }

  // Trier par score de compatibilité et limiter
  const sortedMatches = matchesWithScores
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, parseInt(limit));

  res.json({
    matches: sortedMatches,
    total: candidates.length,
    hasMore: candidates.length > parseInt(limit)
  });
}));

// Obtenir tous les matches de l'utilisateur
router.get('/', [
  query('status').optional().isIn(['pending', 'liked', 'passed', 'mutual']),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
  query('offset').optional().isInt({ min: 0 }).default(0)
], requireCompleteProfile, handleValidationErrors, asyncHandler(async (req, res) => {
  const { status, limit, offset } = req.query;
  
  // Construire le filtre
  let matchFilter = {};
  if (status) {
    matchFilter['matches.status'] = status;
  }

  // Récupérer l'utilisateur avec ses matches
  const user = await User.findById(req.user._id)
    .populate({
      path: 'matches.userId',
      select: '-password -socialMediaData -questionnaireAnswers',
      match: { isActive: true }
    })
    .select('matches');

  if (!user) {
    throw createError(404, 'Utilisateur non trouvé');
  }

  // Filtrer et paginer les matches
  let matches = user.matches.filter(match => {
    if (status && match.status !== status) return false;
    return match.userId; // Exclure les utilisateurs supprimés
  });

  // Trier par date de création (plus récents en premier)
  matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Paginer
  const paginatedMatches = matches.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // Formatter la réponse
  const formattedMatches = paginatedMatches.map(match => ({
    ...match.userId.getPublicProfile(),
    compatibilityScore: match.compatibilityScore,
    compatibilityBreakdown: match.compatibilityBreakdown,
    source: match.source,
    status: match.status,
    matchedAt: match.createdAt
  }));

  res.json({
    matches: formattedMatches,
    total: matches.length,
    hasMore: matches.length > parseInt(offset) + parseInt(limit)
  });
}));

// Liker ou passer un profil
router.post('/action', [
  body('targetUserId').isMongoId().withMessage('ID utilisateur invalide'),
  body('action').isIn(['like', 'pass']).withMessage('Action invalide')
], requireCompleteProfile, handleValidationErrors, asyncHandler(async (req, res) => {
  const { targetUserId, action } = req.body;
  const currentUser = req.user;

  if (targetUserId === currentUser._id.toString()) {
    throw createError(400, 'Impossible d\'interagir avec son propre profil');
  }

  // Vérifier que l'utilisateur cible existe
  const targetUser = await User.findById(targetUserId);
  if (!targetUser || !targetUser.isActive) {
    throw createError(404, 'Utilisateur non trouvé');
  }

  // Vérifier si une action a déjà été prise
  const existingMatch = currentUser.matches.find(
    match => match.userId.toString() === targetUserId
  );

  if (existingMatch) {
    throw createError(400, 'Action déjà effectuée sur ce profil');
  }

  // Calculer la compatibilité
  const compatibility = await geminiService.generateCompatibilityScore(
    currentUser.getPublicProfile(),
    targetUser.getPublicProfile()
  );

  // Ajouter le match à l'utilisateur actuel
  const matchData = {
    userId: targetUserId,
    compatibilityScore: compatibility.compatibilityScore,
    compatibilityBreakdown: compatibility.compatibilityBreakdown,
    source: 'algorithm',
    status: action === 'like' ? 'liked' : 'passed'
  };

  currentUser.matches.push(matchData);

  // Si c'est un like, vérifier s'il y a un match mutuel
  let isMutualMatch = false;
  if (action === 'like') {
    const targetUserMatch = targetUser.matches.find(
      match => match.userId.toString() === currentUser._id.toString() && match.status === 'liked'
    );

    if (targetUserMatch) {
      // Match mutuel !
      isMutualMatch = true;
      
      // Mettre à jour les statuts
      currentUser.matches[currentUser.matches.length - 1].status = 'mutual';
      targetUserMatch.status = 'mutual';
      
      await targetUser.save();

      // Notifier les deux utilisateurs via Socket.IO
      const io = req.app.get('io');
      io.to(`user_${currentUser._id}`).emit('new_match', {
        match: targetUser.getPublicProfile(),
        compatibilityScore: compatibility.compatibilityScore
      });
      
      io.to(`user_${targetUserId}`).emit('new_match', {
        match: currentUser.getPublicProfile(),
        compatibilityScore: compatibility.compatibilityScore
      });
    }
  }

  await currentUser.save();

  res.json({
    message: action === 'like' ? 'Profil liké' : 'Profil passé',
    isMutualMatch,
    compatibility: {
      score: compatibility.compatibilityScore,
      breakdown: compatibility.compatibilityBreakdown
    }
  });
}));

// Scan des réseaux sociaux pour de nouveaux matches
router.post('/social-scan', requireCompleteProfile, asyncHandler(async (req, res) => {
  // Simuler un scan des réseaux sociaux
  // En production, ceci ferait appel aux APIs des réseaux sociaux
  
  const currentUser = req.user;
  
  // Simuler une découverte de nouveaux profils
  const newCandidates = await User.find({
    _id: { 
      $ne: currentUser._id,
      $nin: currentUser.matches.map(match => match.userId)
    },
    isActive: true,
    isProfileComplete: true,
    // Simulation: utilisateurs récemment actifs
    lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  })
  .select('-password -socialMediaData -questionnaireAnswers')
  .limit(5);

  // Calculer la compatibilité
  const socialMatches = [];

  for (const candidate of newCandidates) {
    const compatibility = await geminiService.generateCompatibilityScore(
      currentUser.getPublicProfile(),
      candidate.getPublicProfile()
    );

    // Seulement garder les matches avec un score élevé
    if (compatibility.compatibilityScore >= 70) {
      socialMatches.push({
        ...candidate.getPublicProfile(),
        compatibilityScore: compatibility.compatibilityScore,
        compatibilityBreakdown: compatibility.compatibilityBreakdown,
        source: 'social_scan'
      });
    }
  }

  // Mettre à jour la date de dernier scan
  currentUser.socialMediaData = {
    ...currentUser.socialMediaData,
    lastScanDate: new Date()
  };
  
  await currentUser.save();

  // Notifier via Socket.IO
  const io = req.app.get('io');
  io.to(`user_${currentUser._id}`).emit('social_scan_complete', {
    newMatches: socialMatches.length
  });

  res.json({
    message: 'Scan terminé',
    newMatches: socialMatches,
    total: socialMatches.length
  });
}));

// Obtenir les statistiques des matches
router.get('/stats', requireCompleteProfile, asyncHandler(async (req, res) => {
  const user = req.user;

  const stats = {
    totalMatches: user.matches.length,
    likes: user.matches.filter(m => m.status === 'liked').length,
    passes: user.matches.filter(m => m.status === 'passed').length,
    mutualMatches: user.matches.filter(m => m.status === 'mutual').length,
    averageCompatibility: 0,
    lastScanDate: user.socialMediaData?.lastScanDate || null
  };

  if (stats.totalMatches > 0) {
    const totalScore = user.matches.reduce((sum, match) => sum + (match.compatibilityScore || 0), 0);
    stats.averageCompatibility = Math.round(totalScore / stats.totalMatches);
  }

  res.json(stats);
}));

export default router;
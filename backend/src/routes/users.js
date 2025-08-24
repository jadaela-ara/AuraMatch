import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler, createError } from '../middlewares/errorHandler.js';

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

// Obtenir le profil de l'utilisateur connecté
router.get('/me', asyncHandler(async (req, res) => {
  res.json({
    user: req.user.getPublicProfile()
  });
}));

// Mettre à jour le profil utilisateur
router.patch('/me', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('age').optional().isInt({ min: 18, max: 100 }),
  body('location').optional().trim().isLength({ min: 2 })
], handleValidationErrors, asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'age', 'location'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Vérifier que l'email n'est pas déjà utilisé
  if (updateData.email && updateData.email !== req.user.email) {
    const existingUser = await User.findOne({ 
      email: updateData.email,
      _id: { $ne: req.user._id }
    });
    
    if (existingUser) {
      throw createError(400, 'Cet email est déjà utilisé');
    }
  }

  // Mettre à jour l'utilisateur
  Object.assign(req.user, updateData);
  await req.user.save();

  res.json({
    message: 'Profil mis à jour',
    user: req.user.getPublicProfile()
  });
}));

// Changer le mot de passe
router.patch('/password', [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nouveau mot de passe minimum 6 caractères')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Vérifier que l'utilisateur a un mot de passe (pas OAuth)
  if (!req.user.password) {
    throw createError(400, 'Impossible de changer le mot de passe pour un compte OAuth');
  }

  // Vérifier le mot de passe actuel
  const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createError(400, 'Mot de passe actuel incorrect');
  }

  // Mettre à jour le mot de passe
  req.user.password = newPassword;
  await req.user.save();

  res.json({
    message: 'Mot de passe mis à jour avec succès'
  });
}));

// Rechercher des utilisateurs
router.get('/search', [
  query('q').optional().trim().isLength({ min: 2 }),
  query('age_min').optional().isInt({ min: 18 }),
  query('age_max').optional().isInt({ max: 100 }),
  query('location').optional().trim(),
  query('interests').optional(),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  query('offset').optional().isInt({ min: 0 }).default(0)
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { q, age_min, age_max, location, interests, limit, offset } = req.query;

  // Construire la requête de recherche
  const searchQuery = {
    _id: { $ne: req.user._id }, // Exclure l'utilisateur actuel
    isActive: true,
    isProfileComplete: true
  };

  // Recherche textuelle
  if (q) {
    searchQuery.$or = [
      { name: { $regex: q, $options: 'i' } },
      { bio: { $regex: q, $options: 'i' } },
      { interests: { $in: [new RegExp(q, 'i')] } }
    ];
  }

  // Filtres d'âge
  if (age_min || age_max) {
    searchQuery.age = {};
    if (age_min) searchQuery.age.$gte = parseInt(age_min);
    if (age_max) searchQuery.age.$lte = parseInt(age_max);
  }

  // Filtre de localisation
  if (location) {
    searchQuery.location = { $regex: location, $options: 'i' };
  }

  // Filtre d'intérêts
  if (interests) {
    const interestArray = Array.isArray(interests) ? interests : [interests];
    searchQuery.interests = { $in: interestArray.map(i => new RegExp(i, 'i')) };
  }

  // Exécuter la recherche
  const users = await User.find(searchQuery)
    .select('-password -socialMediaData -questionnaireAnswers -matches')
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .sort({ lastActive: -1 });

  // Compter le total
  const total = await User.countDocuments(searchQuery);

  res.json({
    users: users.map(user => user.getPublicProfile()),
    total,
    hasMore: total > parseInt(offset) + parseInt(limit)
  });
}));

// Obtenir un utilisateur par ID
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password -socialMediaData -questionnaireAnswers -matches');
  
  if (!user || !user.isActive) {
    throw createError(404, 'Utilisateur non trouvé');
  }

  res.json({
    user: user.getPublicProfile()
  });
}));

// Désactiver le compte
router.patch('/deactivate', asyncHandler(async (req, res) => {
  req.user.isActive = false;
  await req.user.save();

  res.json({
    message: 'Compte désactivé avec succès'
  });
}));

// Réactiver le compte
router.patch('/reactivate', asyncHandler(async (req, res) => {
  req.user.isActive = true;
  req.user.lastActive = new Date();
  await req.user.save();

  res.json({
    message: 'Compte réactivé avec succès',
    user: req.user.getPublicProfile()
  });
}));

// Supprimer le compte (soft delete)
router.delete('/me', [
  body('confirmation').equals('DELETE_MY_ACCOUNT').withMessage('Confirmation requise')
], handleValidationErrors, asyncHandler(async (req, res) => {
  // Marquer comme inactif au lieu de supprimer
  req.user.isActive = false;
  req.user.email = `deleted_${req.user._id}@deleted.local`;
  
  // Nettoyer les données sensibles
  req.user.password = undefined;
  req.user.googleId = undefined;
  req.user.facebookId = undefined;
  req.user.socialMediaData = undefined;
  req.user.questionnaireAnswers = [];
  req.user.matches = [];

  await req.user.save();

  res.json({
    message: 'Compte supprimé avec succès'
  });
}));

// Obtenir les statistiques de l'utilisateur
router.get('/me/stats', asyncHandler(async (req, res) => {
  const user = req.user;

  const stats = {
    profileCompleteness: user.isProfileComplete ? 100 : 50,
    totalMatches: user.matches?.length || 0,
    mutualMatches: user.matches?.filter(m => m.status === 'mutual').length || 0,
    accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)), // jours
    lastActive: user.lastActive,
    hasProfilePicture: !!user.avatarUrl,
    interestsCount: user.interests?.length || 0,
    valuesCount: user.values?.length || 0
  };

  res.json(stats);
}));

export default router;
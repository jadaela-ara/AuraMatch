import express from 'express';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import User from '../models/User.js';
import { generateToken } from '../middlewares/auth.js';
import { asyncHandler, createError } from '../middlewares/errorHandler.js';
import '../config/passport.js';

const router = express.Router();

// Middleware de validation des erreurs
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

// Inscription par email
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('name').trim().isLength({ min: 2 }).withMessage('Nom minimum 2 caractères')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Vérifier si l'utilisateur existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(400, 'Email déjà utilisé');
  }

  // Créer l'utilisateur
  const user = new User({
    email,
    password,
    name
  });

  await user.save();

  // Générer le token
  const token = generateToken(user._id);

  res.status(201).json({
    message: 'Compte créé avec succès',
    user: user.getPublicProfile(),
    token
  });
}));

// Connexion par email
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists().withMessage('Mot de passe requis')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Trouver l'utilisateur
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Email ou mot de passe incorrect');
  }

  // Vérifier le mot de passe
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw createError(401, 'Email ou mot de passe incorrect');
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    throw createError(401, 'Compte désactivé');
  }

  // Générer le token
  const token = generateToken(user._id);

  res.json({
    message: 'Connexion réussie',
    user: user.getPublicProfile(),
    token
  });
}));

// Connexion Google - Initier
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback Google
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    
    // Rediriger vers le frontend avec le token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user.getPublicProfile()))}`);
  }
);

// Connexion Facebook - Initier
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

// Callback Facebook
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    
    // Rediriger vers le frontend avec le token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user.getPublicProfile()))}`);
  }
);

// Vérifier le token
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw createError(401, 'Token manquant');
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      throw createError(401, 'Utilisateur non trouvé');
    }

    res.json({
      user: user.getPublicProfile(),
      token
    });
  } catch (error) {
    throw createError(401, 'Token invalide');
  }
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw createError(401, 'Refresh token requis');
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      throw createError(401, 'Utilisateur non trouvé');
    }

    const newToken = generateToken(user._id);

    res.json({
      token: newToken,
      user: user.getPublicProfile()
    });
  } catch (error) {
    throw createError(401, 'Refresh token invalide');
  }
}));

export default router;
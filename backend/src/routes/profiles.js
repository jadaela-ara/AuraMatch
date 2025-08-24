import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import { asyncHandler, createError } from '../middlewares/errorHandler.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

// Configuration Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Configuration multer pour l'upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

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
    profile: req.user.getPublicProfile()
  });
}));

// Mettre à jour les informations de base du profil
router.patch('/me', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('age').optional().isInt({ min: 18, max: 100 }),
  body('location').optional().trim().isLength({ min: 2 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('interests').optional().isArray({ max: 10 }),
  body('values').optional().isArray({ max: 8 }),
  body('relationshipGoals').optional().trim(),
  body('communicationStyle').optional().trim()
], handleValidationErrors, asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'age', 'location', 'bio', 'interests', 
    'values', 'relationshipGoals', 'communicationStyle'
  ];

  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Mettre à jour l'utilisateur
  Object.assign(req.user, updateData);
  
  // Vérifier si le profil est maintenant complet
  req.user.checkProfileCompleteness();
  
  await req.user.save();

  res.json({
    message: 'Profil mis à jour',
    profile: req.user.getPublicProfile()
  });
}));

// Upload d'avatar
router.post('/avatar', upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createError(400, 'Aucun fichier fourni');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw createError(500, 'Service d\'upload non configuré');
  }

  try {
    // Upload vers Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'auramatch/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Mettre à jour l'URL de l'avatar
    req.user.avatarUrl = uploadResult.secure_url;
    await req.user.save();

    res.json({
      message: 'Avatar mis à jour',
      avatarUrl: uploadResult.secure_url
    });

  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw createError(500, 'Erreur lors de l\'upload de l\'image');
  }
}));

// Générer le profil avec IA
router.post('/generate', [
  body('socialMediaPosts').optional().isString(),
  body('questionnaireAnswers').isArray().withMessage('Réponses du questionnaire requises'),
  body('userInfo.name').notEmpty().withMessage('Nom requis'),
  body('userInfo.age').isInt({ min: 18, max: 100 }).withMessage('Âge invalide'),
  body('userInfo.location').notEmpty().withMessage('Localisation requise')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { socialMediaPosts, questionnaireAnswers, userInfo } = req.body;

  try {
    // Générer le profil avec Gemini
    const generatedProfile = await geminiService.generatePersonalityProfile(
      socialMediaPosts || '',
      questionnaireAnswers,
      userInfo
    );

    // Mettre à jour l'utilisateur avec les nouvelles données
    Object.assign(req.user, {
      ...userInfo,
      ...generatedProfile,
      questionnaireAnswers: questionnaireAnswers.map((answer, index) => ({
        questionId: index + 1,
        answer,
        answeredAt: new Date()
      }))
    });

    // Sauvegarder les données de réseaux sociaux si fournies
    if (socialMediaPosts) {
      req.user.socialMediaData = {
        posts: [socialMediaPosts],
        lastScanDate: new Date()
      };
    }

    // Vérifier la complétude du profil
    req.user.checkProfileCompleteness();
    
    await req.user.save();

    // Notifier via Socket.IO
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('profile_generated', {
      profile: req.user.getPublicProfile()
    });

    res.json({
      message: 'Profil généré avec succès',
      profile: req.user.getPublicProfile()
    });

  } catch (error) {
    console.error('Erreur génération profil:', error);
    throw createError(500, 'Erreur lors de la génération du profil');
  }
}));

// Mettre à jour les préférences
router.patch('/preferences', [
  body('ageRange.min').optional().isInt({ min: 18, max: 65 }),
  body('ageRange.max').optional().isInt({ min: 18, max: 100 }),
  body('maxDistance').optional().isInt({ min: 1, max: 500 }),
  body('lookingFor').optional().isIn(['serious', 'casual', 'friendship', 'open'])
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { ageRange, maxDistance, lookingFor } = req.body;

  const updateData = {};
  
  if (ageRange) {
    updateData['preferences.ageRange'] = ageRange;
  }
  
  if (maxDistance !== undefined) {
    updateData['preferences.maxDistance'] = maxDistance;
  }
  
  if (lookingFor) {
    updateData['preferences.lookingFor'] = lookingFor;
  }

  await User.findByIdAndUpdate(req.user._id, updateData);
  
  // Recharger l'utilisateur
  const updatedUser = await User.findById(req.user._id).select('-password');

  res.json({
    message: 'Préférences mises à jour',
    preferences: updatedUser.preferences
  });
}));

// Obtenir un profil public par ID
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password -socialMediaData -questionnaireAnswers');
  
  if (!user || !user.isActive) {
    throw createError(404, 'Profil non trouvé');
  }

  res.json({
    profile: user.getPublicProfile()
  });
}));

export default router;
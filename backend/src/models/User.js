import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const personalityTraitSchema = new mongoose.Schema({
  trait: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

const userSchema = new mongoose.Schema({
  // Informations d'authentification
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId;
    }
  },
  
  // OAuth
  googleId: String,
  facebookId: String,
  
  // Profil de base
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  location: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    default: null
  },
  
  // Profil détaillé
  bio: {
    type: String,
    maxlength: 500
  },
  interests: [{
    type: String,
    trim: true
  }],
  personalityTraits: [personalityTraitSchema],
  communicationStyle: {
    type: String,
    trim: true
  },
  relationshipGoals: {
    type: String,
    trim: true
  },
  values: [{
    type: String,
    trim: true
  }],
  
  // Préférences
  preferences: {
    ageRange: {
      min: {
        type: Number,
        default: 18
      },
      max: {
        type: Number,
        default: 65
      }
    },
    maxDistance: {
      type: Number,
      default: 50 // km
    },
    lookingFor: {
      type: String,
      enum: ['serious', 'casual', 'friendship', 'open'],
      default: 'open'
    }
  },
  
  // Métadonnées
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Matches et interactions
  matches: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    compatibilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    compatibilityBreakdown: [{
      category: String,
      reason: String,
      score: Number
    }],
    source: {
      type: String,
      enum: ['algorithm', 'social_scan', 'manual'],
      default: 'algorithm'
    },
    status: {
      type: String,
      enum: ['pending', 'liked', 'passed', 'mutual'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Données pour l'IA
  socialMediaData: {
    posts: [String],
    lastScanDate: Date
  },
  questionnaireAnswers: [{
    questionId: String,
    answer: String,
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index pour les recherches
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ location: 1, isActive: 1 });
userSchema.index({ 'matches.userId': 1 });

// Middleware pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le profil public
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.googleId;
  delete user.facebookId;
  delete user.socialMediaData;
  delete user.questionnaireAnswers;
  return user;
};

// Méthode pour vérifier si le profil est complet
userSchema.methods.checkProfileCompleteness = function() {
  const requiredFields = ['name', 'age', 'location', 'bio', 'interests'];
  const isComplete = requiredFields.every(field => {
    const value = this[field];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });
  
  this.isProfileComplete = isComplete;
  return isComplete;
};

const User = mongoose.model('User', userSchema);

export default User;
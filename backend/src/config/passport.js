// S'assurer que les variables d'environnement sont chargées
import '../config/env.js';

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

// Configuration JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    if (user && user.isActive) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Configuration Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Chercher un utilisateur existant avec Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Mettre à jour les informations si nécessaire
        if (!user.avatarUrl && profile.photos[0]) {
          user.avatarUrl = profile.photos[0].value;
          await user.save();
        }
        return done(null, user);
      }

      // Chercher un utilisateur avec le même email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Lier le compte Google à l'utilisateur existant
        user.googleId = profile.id;
        if (!user.avatarUrl && profile.photos[0]) {
          user.avatarUrl = profile.photos[0].value;
        }
        await user.save();
        return done(null, user);
      }

      // Créer un nouvel utilisateur
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatarUrl: profile.photos[0]?.value || null
      });

      await user.save();
      return done(null, user);

    } catch (error) {
      return done(error, null);
    }
  }));
}

// Configuration Facebook OAuth
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Chercher un utilisateur existant avec Facebook ID
      let user = await User.findOne({ facebookId: profile.id });
      
      if (user) {
        // Mettre à jour les informations si nécessaire
        if (!user.avatarUrl && profile.photos[0]) {
          user.avatarUrl = profile.photos[0].value;
          await user.save();
        }
        return done(null, user);
      }

      // Chercher un utilisateur avec le même email
      if (profile.emails && profile.emails[0]) {
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Lier le compte Facebook à l'utilisateur existant
          user.facebookId = profile.id;
          if (!user.avatarUrl && profile.photos[0]) {
            user.avatarUrl = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }
      }

      // Créer un nouvel utilisateur
      user = new User({
        facebookId: profile.id,
        email: profile.emails?.[0]?.value || `fb_${profile.id}@facebook.local`,
        name: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value || null
      });

      await user.save();
      return done(null, user);

    } catch (error) {
      return done(error, null);
    }
  }));
}

export default passport;
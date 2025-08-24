export const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors
    });
  }

  // Erreurs de duplication (email déjà utilisé)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Données déjà utilisées',
      message: `${field} déjà utilisé`
    });
  }

  // Erreurs de cast (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID invalide',
      message: 'Format d\'identifiant incorrect'
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Token d\'authentification invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Veuillez vous reconnecter'
    });
  }

  // Erreurs de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Trop de requêtes',
      message: 'Veuillez réessayer plus tard'
    });
  }

  // Erreur par défaut
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Erreur du serveur' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
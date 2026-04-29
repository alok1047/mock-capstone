const express = require('express');
const passport = require('passport');
const {
  signupUser,
  loginUser,
  googleCallback,
  googleAuthFailure,
} = require('../controllers/authController');
const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();

// Local authentication routes
router.post('/signup', uploadAvatar.single('avatar'), signupUser);
router.post('/login', loginUser);

// Google OAuth — only mount when credentials are configured
if (passport.isGoogleEnabled) {
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
    })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/api/auth/google/failure',
      session: false,
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
    }),
    googleCallback
  );

  router.get('/google/failure', googleAuthFailure);
} else {
  // Friendly 503 instead of a crash if the frontend tries Google auth
  const disabled = (_req, res) =>
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on the server',
    });
  router.get('/google', disabled);
  router.get('/google/callback', disabled);
  router.get('/google/failure', disabled);
}

module.exports = router;

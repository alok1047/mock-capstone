const express = require('express');
const passport = require('passport');
const { signupUser, loginUser, googleCallback, googleAuthFailure } = require('../controllers/authController');
const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();

// Local authentication routes
router.post('/signup', uploadAvatar.single('avatar'), signupUser);
router.post('/login', loginUser);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    // Use explicit redirect URI to match exactly what's in Google Console
    callbackURL: 'http://localhost:3000/api/auth/google/callback'
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    session: false,
    // Match the same explicit callback URL used in the initial auth request
    callbackURL: 'http://localhost:3000/api/auth/google/callback'
  }),
  googleCallback
);

router.get('/google/failure', googleAuthFailure);

module.exports = router;
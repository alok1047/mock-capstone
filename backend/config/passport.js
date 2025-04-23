const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure Passport with Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.NODE_ENV === 'production' 
        ? 'https://elif-backend.onrender.com' 
        : 'http://localhost:3000'}/api/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return the user
          return done(null, user);
        }

        // Check if user exists with the same email
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          existingUser.authProvider = 'google';
          // Update avatar if user doesn't have one
          if (!existingUser.avatar || existingUser.avatar.includes('default-avatar')) {
            existingUser.avatar = profile.photos[0].value;
          }
          await existingUser.save();
          return done(null, existingUser);
        }

        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName.replace(/\s+/g, '') + Math.floor(Math.random() * 1000), // Generate a username
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          authProvider: 'google'
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
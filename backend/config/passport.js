const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NODE_ENV,
} = process.env;

// Only register Google OAuth when credentials are present.
// This lets the server boot in local/dev without OAuth set up,
// instead of throwing `OAuth2Strategy requires a clientID option`.
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${
          NODE_ENV === 'production'
            ? 'https://elif-backend.onrender.com'
            : 'http://localhost:3000'
        }/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          const existingUser = await User.findOne({ email: profile.emails[0].value });
          if (existingUser) {
            existingUser.googleId = profile.id;
            existingUser.authProvider = 'google';
            if (!existingUser.avatar || existingUser.avatar.includes('default-avatar')) {
              existingUser.avatar = profile.photos[0].value;
            }
            await existingUser.save();
            return done(null, existingUser);
          }

          user = await User.create({
            googleId: profile.id,
            username:
              profile.displayName.replace(/\s+/g, '') +
              Math.floor(Math.random() * 1000),
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            authProvider: 'google',
          });
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('[passport] Google OAuth strategy registered');
} else {
  console.warn(
    '[passport] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.'
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper for routes to know if Google auth is available
passport.isGoogleEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

module.exports = passport;

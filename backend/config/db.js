const mongoose = require('mongoose');

// Connects to MongoDB. Returns a promise; logs status. Does not exit the
// process on failure so the rest of the API (e.g. /health) still works in dev.
const connectDB = async () => {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.warn('[db] MONGO_URL not set — skipping MongoDB connection.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected');
  } catch (error) {
    console.error('[db] MongoDB connection failed:', error.message);
  }
};

module.exports = connectDB;

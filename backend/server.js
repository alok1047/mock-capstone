const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');

// Load environment variables first
dotenv.config();

// Import Cloudinary configuration after env vars are loaded
require('./config/cloudinary');
// Import passport configuration
require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();
app.use(express.json());
// Configure CORS to explicitly allow requests from frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Passport
app.use(passport.initialize());

const PORT = process.env.PORT || 8000;

connectDB();

app.get('/', (req, res) => {
  res.send('ELIF Backend Working');
});


app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
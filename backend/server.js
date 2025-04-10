const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

connectDB();

app.get('/', (req, res) => {
  res.send('ELIF Backend Working');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
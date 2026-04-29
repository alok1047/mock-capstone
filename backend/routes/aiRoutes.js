const express = require('express');
const { search, rateLimit } = require('../controllers/aiController');

const router = express.Router();

// POST /api/ai/search  { message: "I lost a black wallet near railway station" }
router.post('/search', rateLimit, search);

module.exports = router;

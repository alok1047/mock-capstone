const express = require('express');
const {
  listReviews,
  listEligible,
  upsertReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listReviews);
router.get('/eligible', protect, listEligible);
router.post('/', protect, upsertReview);

module.exports = router;

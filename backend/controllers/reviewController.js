const mongoose = require('mongoose');
const Review = require('../models/Review');
const Item = require('../models/Item');

// GET /api/reviews — public list, newest first
const listReviews = async (_req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username avatar')
      .populate('item', 'name category address location')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    console.log('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// GET /api/reviews/eligible — items the current user can review
// (approved claim exists, no review yet)
const listEligible = async (req, res) => {
  try {
    const userId = req.user._id;

    const items = await Item.find({
      claims: {
        $elemMatch: { claimant: userId, status: 'approved' },
      },
    })
      .select('name category image address location')
      .lean();

    if (items.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const itemIds = items.map((it) => it._id);
    const existing = await Review.find({
      user: userId,
      item: { $in: itemIds },
    })
      .select('item')
      .lean();
    const reviewedSet = new Set(existing.map((r) => String(r.item)));

    const eligible = items.filter((it) => !reviewedSet.has(String(it._id)));
    res.json({ success: true, data: eligible });
  } catch (err) {
    console.log('Error fetching eligible claims:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// POST /api/reviews — create or update the user's review for a recovered item
const upsertReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, rating, story, timeToRecover } = req.body;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'Valid itemId is required' });
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const trimmedStory = (story || '').toString().trim();
    if (!trimmedStory) {
      return res.status(400).json({ success: false, message: 'Please share your story' });
    }
    if (trimmedStory.length > 500) {
      return res
        .status(400)
        .json({ success: false, message: 'Story is too long (max 500 chars)' });
    }

    // Eligibility: user must have an approved claim on this item.
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    const claim = item.claims.find(
      (c) =>
        c.claimant.toString() === userId.toString() && c.status === 'approved'
    );
    if (!claim) {
      return res.status(403).json({
        success: false,
        message: 'You can only review items you successfully claimed',
      });
    }

    const review = await Review.findOneAndUpdate(
      { user: userId, item: itemId },
      {
        user: userId,
        item: itemId,
        rating: ratingNum,
        story: trimmedStory,
        timeToRecover: (timeToRecover || '').toString().trim() || undefined,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const populated = await Review.findById(review._id)
      .populate('user', 'username avatar')
      .populate('item', 'name category address location');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'You have already reviewed this item' });
    }
    console.log('Error creating review:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = { listReviews, listEligible, upsertReview };

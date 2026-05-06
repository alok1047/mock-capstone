const mongoose = require('mongoose');

/**
 * Review left by a user after they've successfully recovered an item
 * (i.e. their claim was approved by the item's owner).
 *
 * Eligibility is enforced in the controller:
 *   - The user must have an `approved` claim on the referenced item.
 * The unique compound index keeps reviews 1-per-user-per-item.
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    story: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    timeToRecover: {
      type: String, // free-form, e.g. "2 hours", "Same day"
      trim: true,
      maxlength: 60,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

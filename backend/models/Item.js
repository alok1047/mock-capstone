const mongoose = require('mongoose');

// Define a claim schema as a subdocument
const claimSchema = new mongoose.Schema({
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  responseMessage: {
    type: String
  },
  respondedAt: {
    type: Date
  }
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  image: {
    type: String,  // cloudinary url later
  },

  category: {
    type: String,  // mobile, wallet, etc.
    default: 'other',
  },

  status: {
    type: String,   // lost / found / claimed
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  claims: [claimSchema],

  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  claimedAt: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
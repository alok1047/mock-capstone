const mongoose = require('mongoose');

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
    type: String,   // lost / found → user will pass directly
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
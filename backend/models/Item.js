const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  proofImages: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  responseMessage: { type: String },
  respondedAt: { type: Date },
});

// GeoJSON Point — used by the 2dsphere index for `$nearSphere` queries.
// Coordinates are stored as [lng, lat] (MongoDB convention).
const geoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },

    // Human-readable location text (kept as-is for backward compatibility).
    location: { type: String, required: true },

    // Optional structured location. New reports populate these from
    // Google Places / map picker. Old records simply lack `geo` and are
    // therefore excluded from /nearby queries — by design.
    address: { type: String },
    geo: { type: geoPointSchema, default: undefined },

    image: { type: String }, // Cloudinary URL
    category: { type: String, default: 'other' },
    status: { type: String, required: true }, // lost / found / claimed
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claims: [claimSchema],
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    claimedAt: { type: Date },
  },
  { timestamps: true }
);

// Geospatial index — required for `$nearSphere` and `$geoNear`.
// `sparse: true` so existing records without `geo` don't break the index.
itemSchema.index({ geo: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Item', itemSchema);

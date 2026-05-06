const express = require('express');
const {
  createItem,
  getNearbyItems,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  claimItem,
  getItemClaims,
  respondToClaim,
  getUserClaims,
  getUserDashboard,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { uploadItem, uploadClaimProof } = require('../config/cloudinary');

const router = express.Router();

// Wrap the multer-storage-cloudinary middleware so a Cloudinary failure
// (bad cloud_name, bad credentials, network error) doesn't 500 the whole
// request. We log the error and continue without an image — the item is
// still created and the rest of the form submission is preserved.
const uploadImageSafe = (req, res, next) => {
  uploadItem.single('image')(req, res, (err) => {
    if (err) {
      console.warn('[upload] Image upload failed, continuing without image:', err.message);
      req.file = undefined;
    }
    next();
  });
};

// Claim proofs — accept up to 5 photos. Same safety wrapper: if Cloudinary
// fails we drop the files and let the controller decide whether to reject.
const uploadClaimProofsSafe = (req, res, next) => {
  uploadClaimProof.array('proofImages', 5)(req, res, (err) => {
    if (err) {
      console.warn('[upload] Claim proof upload failed, continuing without files:', err.message);
      req.files = [];
    }
    next();
  });
};

// Public routes — order matters: /nearby and /user/* must be declared
// BEFORE the /:id route so Express doesn't treat "nearby" as an item id.
router.get('/nearby', getNearbyItems);
router.get('/', getAllItems);
router.get('/:id', getItemById);

// Protected routes - Items management
router.post('/create', protect, uploadImageSafe, createItem);
router.put('/:id', protect, uploadImageSafe, updateItem);
router.delete('/:id', protect, deleteItem);

// Protected routes - Claims management
router.post('/:id/claim', protect, uploadClaimProofsSafe, claimItem);
router.get('/:id/claims', protect, getItemClaims);
router.put('/:id/claims/:claimId', protect, respondToClaim);

// Protected routes - User-specific data
router.get('/user/claims', protect, getUserClaims);
router.get('/user/dashboard', protect, getUserDashboard);

module.exports = router;
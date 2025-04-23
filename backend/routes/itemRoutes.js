const express = require('express');
const { 
  createItem, 
  getAllItems, 
  getItemById,
  updateItem, 
  deleteItem,
  claimItem,
  getItemClaims,
  respondToClaim,
  getUserClaims,
  getUserDashboard
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { uploadItem } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getAllItems);
router.get('/:id', getItemById);

// Protected routes - Items management
router.post('/create', protect, uploadItem.single('image'), createItem);
router.put('/:id', protect, uploadItem.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

// Protected routes - Claims management
router.post('/:id/claim', protect, claimItem);
router.get('/:id/claims', protect, getItemClaims);
router.put('/:id/claims/:claimId', protect, respondToClaim);

// Protected routes - User-specific data
router.get('/user/claims', protect, getUserClaims);
router.get('/user/dashboard', protect, getUserDashboard);

module.exports = router;
const mongoose = require('mongoose');
const Item = require('../models/Item');

// Create Item API
const createItem = async (req, res) => {
  try {
    const { name, description, location, status, category } = req.body;

    if (!name?.trim() || !description?.trim() || !location?.trim() || !status?.trim()) {
      return res.status(400).json({ message: "All fields except image & category are required" });
    }

    // Use req.user._id instead of hardcoded user ID
    const userId = req.user._id;

    // Get image URL if uploaded
    const imageUrl = req.file ? req.file.path : undefined;

    let item = await Item.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      status: status.trim(),
      category: category?.trim() || 'other',
      image: imageUrl, // Save the image URL
      user: userId
    });
    
    // Populate the user field to include username
    item = await Item.findById(item._id).populate('user', 'username');

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item
    });

  } catch (error) {
    console.log("Error while creating item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Items API
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('user', 'username');

    res.status(200).json({
      success: true,
      message: "All Items fetched successfully",
      data: items
    });

  } catch (error) {
    console.log("Error while fetching items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Single Item API with Details
const getItemById = async (req, res) => {
  try {
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid item ID format" 
      });
    }

    const item = await Item.findById(req.params.id)
      .populate('user', 'username email')
      .populate('claims.claimant', 'username email');

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Item fetched successfully",
      data: item
    });

  } catch (error) {
    console.log("Error while fetching item:", error);
    // Check if error is a CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid item ID format" 
      });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update Item API
const updateItem = async (req, res) => {
  try {
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid item ID format" 
      });
    }
  
    // First find the item to check ownership
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check if user is the owner of this item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this item" });
    }

    // Get updated data
    const updateData = { ...req.body };
    
    // Add image URL if a new image was uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Now update the item
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'username');

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem
    });

  } catch (error) {
    console.log("Error while updating item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Item API
const deleteItem = async (req, res) => {
  try {
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid item ID format" 
      });
    }
    
    // First find the item to check ownership
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Check if user is the owner of this item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
    }

    // Now delete the item
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Item deleted successfully" });

  } catch (error) {
    console.log("Error while deleting item:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Claim Item API - For users to submit a claim on an item
const claimItem = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid item ID format" 
      });
    }
    
    if (!message?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a message explaining your claim" 
      });
    }

    // Find the item
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    // Check if user is claiming their own item
    if (item.user.toString() === userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot claim your own item" 
      });
    }
    
    // Check if item is already claimed
    if (item.status === 'claimed') {
      return res.status(400).json({ 
        success: false, 
        message: "This item has already been claimed" 
      });
    }
    
    // Check if user has already submitted a claim for this item
    const existingClaim = item.claims.find(
      claim => claim.claimant.toString() === userId.toString()
    );
    
    if (existingClaim) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already submitted a claim for this item" 
      });
    }
    
    // Add the new claim
    item.claims.push({
      claimant: userId,
      message: message.trim(),
      status: 'pending'
    });
    
    await item.save();
    
    // Return the updated item with populated user and claim information
    const updatedItem = await Item.findById(req.params.id)
      .populate('user', 'username')
      .populate('claims.claimant', 'username');
    
    res.status(200).json({
      success: true,
      message: "Claim submitted successfully",
      data: updatedItem
    });
    
  } catch (error) {
    console.log("Error while claiming item:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Get Claims For Item API - For item owners to view claims on their items
const getItemClaims = async (req, res) => {
  try {
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid item ID format" 
      });
    }
    
    // Find the item
    const item = await Item.findById(req.params.id)
      .populate('claims.claimant', 'username email');
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    // Check if user is the owner of this item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view claims for this item" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Claims fetched successfully",
      data: item.claims
    });
    
  } catch (error) {
    console.log("Error while fetching claims:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Respond to Claim API - For item owners to approve or reject claims
const respondToClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, responseMessage } = req.body;
    
    // Validate if the item id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid item ID format" 
      });
    }
    
    // Validate if the claim id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid claim ID format" 
      });
    }
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid status (approved or rejected)" 
      });
    }
    
    // Find the item
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found" 
      });
    }
    
    // Check if user is the owner of this item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to respond to claims for this item" 
      });
    }
    
    // Find the claim
    const claim = item.claims.id(claimId);
    
    if (!claim) {
      return res.status(404).json({ 
        success: false, 
        message: "Claim not found" 
      });
    }
    
    // Update the claim
    claim.status = status;
    claim.responseMessage = responseMessage || '';
    claim.respondedAt = Date.now();
    
    // If approving, also update the item status and set claimedBy
    if (status === 'approved') {
      item.status = 'claimed';
      item.claimedBy = claim.claimant;
      item.claimedAt = Date.now();
      
      // Reject all other pending claims
      item.claims.forEach(otherClaim => {
        if (otherClaim._id.toString() !== claimId && otherClaim.status === 'pending') {
          otherClaim.status = 'rejected';
          otherClaim.responseMessage = 'Item was claimed by another user';
          otherClaim.respondedAt = Date.now();
        }
      });
    }
    
    await item.save();
    
    // Return the updated item with populated user and claim information
    const updatedItem = await Item.findById(req.params.id)
      .populate('user', 'username')
      .populate('claims.claimant', 'username')
      .populate('claimedBy', 'username');
    
    res.status(200).json({
      success: true,
      message: `Claim ${status} successfully`,
      data: updatedItem
    });
    
  } catch (error) {
    console.log("Error while responding to claim:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Get User Claims API - For users to view claims they've made
const getUserClaims = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all items where the user has a claim
    const items = await Item.find({ 'claims.claimant': userId })
      .populate('user', 'username')
      .populate('claims.claimant', 'username');
    
    // Extract just the claims made by this user
    const userClaims = items.map(item => {
      // Find the user's claim for this item
      const claim = item.claims.find(
        claim => claim.claimant._id.toString() === userId.toString()
      );
      
      return {
        item: {
          _id: item._id,
          name: item.name,
          image: item.image,
          status: item.status,
          owner: item.user
        },
        claim: claim
      };
    });
    
    res.status(200).json({
      success: true,
      message: "User claims fetched successfully",
      data: userClaims
    });
    
  } catch (error) {
    console.log("Error while fetching user claims:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Get User Dashboard Items API - For users to view their dashboard
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find items posted by the user
    const postedItems = await Item.find({ user: userId })
      .populate('claims.claimant', 'username email');
    
    // Find claims received on user's items
    const userItems = await Item.find({ user: userId });
    const itemIds = userItems.map(item => item._id);
    
    // Get all claims for the user's items
    const receivedClaims = [];
    userItems.forEach(item => {
      if (item.claims && item.claims.length > 0) {
        item.claims.forEach(claim => {
          receivedClaims.push({
            _id: claim._id,
            item: {
              _id: item._id,
              name: item.name,
              status: item.status,
              category: item.category,
              image: item.image
            },
            claimant: claim.claimant,
            message: claim.message,
            status: claim.status,
            createdAt: claim.createdAt,
            respondedAt: claim.respondedAt,
            responseMessage: claim.responseMessage
          });
        });
      }
    });
    
    // Find claims made by the user on other people's items
    const itemsWithUserClaims = await Item.find({ 
      'claims.claimant': userId 
    }).populate('user', 'username email');
    
    const myClaims = [];
    
    itemsWithUserClaims.forEach(item => {
      const userClaims = item.claims.filter(
        claim => claim.claimant.toString() === userId.toString()
      );
      
      userClaims.forEach(claim => {
        myClaims.push({
          _id: claim._id,
          item: {
            _id: item._id,
            name: item.name,
            status: item.status,
            category: item.category,
            image: item.image
          },
          owner: item.user,
          message: claim.message,
          status: claim.status,
          createdAt: claim.createdAt,
          respondedAt: claim.respondedAt,
          responseMessage: claim.responseMessage
        });
      });
    });
    
    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        postedItems,
        receivedClaims,
        myClaims
      }
    });
    
  } catch (error) {
    console.log("Error while fetching dashboard:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

module.exports = { 
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
};
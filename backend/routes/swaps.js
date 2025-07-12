const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', [
  protect,
  body('recipient')
    .isMongoId()
    .withMessage('Valid recipient ID is required'),
  body('skillOffered')
    .trim()
    .notEmpty()
    .withMessage('Skill offered is required'),
  body('skillWanted')
    .trim()
    .notEmpty()
    .withMessage('Skill wanted is required'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { recipient, skillOffered, skillWanted, message } = req.body;

    // Check if recipient exists and is active
    const recipientUser = await User.findById(recipient);
    if (!recipientUser || !recipientUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found or inactive'
      });
    }

    // Check if user is trying to send request to themselves
    if (recipient === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send swap request to yourself'
      });
    }

    // Check if there's already a pending request between these users
    const existingSwap = await Swap.findOne({
      $or: [
        { requester: req.user._id, recipient, status: 'pending' },
        { requester: recipient, recipient: req.user._id, status: 'pending' }
      ]
    });

    if (existingSwap) {
      return res.status(400).json({
        success: false,
        message: 'There is already a pending swap request between you and this user'
      });
    }

    // Create new swap request
    const swap = await Swap.create({
      requester: req.user._id,
      recipient,
      skillOffered,
      skillWanted,
      message: message || ''
    });

    // Populate the swap with user details
    await swap.populate([
      { path: 'requester', select: 'firstName lastName avatar' },
      { path: 'recipient', select: 'firstName lastName avatar' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Swap request sent successfully',
      data: swap
    });
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/swaps
// @desc    Get user's swap requests (incoming and outgoing)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;

    let query = {
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    };

    // Filter by type (incoming/outgoing)
    if (type === 'incoming') {
      query = { recipient: req.user._id };
    } else if (type === 'outgoing') {
      query = { requester: req.user._id };
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const swaps = await Swap.find(query)
      .populate([
        { path: 'requester', select: 'firstName lastName avatar rating' },
        { path: 'recipient', select: 'firstName lastName avatar rating' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Swap.countDocuments(query);

    res.json({
      success: true,
      data: {
        swaps,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalSwaps: total
        }
      }
    });
  } catch (error) {
    console.error('Get swaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/swaps/:id/respond
// @desc    Accept or reject a swap request
// @access  Private
router.put('/:id/respond', [
  protect,
  body('action')
    .isIn(['accept', 'reject'])
    .withMessage('Action must be either accept or reject'),
  body('rejectionReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Rejection reason cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { action, rejectionReason } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the recipient of this swap
    if (swap.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to swap requests sent to you'
      });
    }

    // Check if swap is still pending
    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This swap request has already been responded to'
      });
    }

    // Update swap status
    swap.status = action === 'accept' ? 'accepted' : 'rejected';
    if (action === 'reject' && rejectionReason) {
      swap.rejectionReason = rejectionReason;
    }

    await swap.save();

    await swap.populate([
      { path: 'requester', select: 'firstName lastName avatar' },
      { path: 'recipient', select: 'firstName lastName avatar' }
    ]);

    res.json({
      success: true,
      message: `Swap request ${action}ed successfully`,
      data: swap
    });
  } catch (error) {
    console.error('Respond to swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/swaps/:id/complete
// @desc    Mark a swap as completed
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is part of this swap
    const isRequester = swap.requester.toString() === req.user._id.toString();
    const isRecipient = swap.recipient.toString() === req.user._id.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this swap'
      });
    }

    // Check if swap is accepted
    if (swap.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted swaps can be marked as completed'
      });
    }

    // Mark as completed
    swap.status = 'completed';
    await swap.save();

    res.json({
      success: true,
      message: 'Swap marked as completed',
      data: swap
    });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/swaps/:id/feedback
// @desc    Submit feedback and rating for a completed swap
// @access  Private
router.post('/:id/feedback', [
  protect,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { rating, feedback } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user can rate this swap
    if (!swap.canUserRate(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already provided feedback for this swap or swap is not completed'
      });
    }

    const userRole = swap.getUserRole(req.user._id);
    let otherUserId;

    // Update rating and feedback based on user role
    if (userRole === 'requester') {
      swap.rating.requesterRating = rating;
      swap.feedback.requesterFeedback = feedback || '';
      swap.isRequesterFeedbackGiven = true;
      otherUserId = swap.recipient;
    } else if (userRole === 'recipient') {
      swap.rating.recipientRating = rating;
      swap.feedback.recipientFeedback = feedback || '';
      swap.isRecipientFeedbackGiven = true;
      otherUserId = swap.requester;
    }

    await swap.save();

    // Update the other user's rating
    const otherUser = await User.findById(otherUserId);
    if (otherUser) {
      await otherUser.updateRating(rating);
    }

    // If both users have given feedback, increment completed swaps count
    if (swap.isRequesterFeedbackGiven && swap.isRecipientFeedbackGiven) {
      await User.findByIdAndUpdate(swap.requester, { $inc: { completedSwaps: 1 } });
      await User.findByIdAndUpdate(swap.recipient, { $inc: { completedSwaps: 1 } });
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: swap
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/swaps/:id
// @desc    Cancel/delete a swap request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is the requester of this swap
    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel swap requests you created'
      });
    }

    // Only allow cancellation of pending or accepted swaps
    if (!['pending', 'accepted'].includes(swap.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed or already cancelled swaps'
      });
    }

    swap.status = 'cancelled';
    await swap.save();

    res.json({
      success: true,
      message: 'Swap request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/swaps/:id
// @desc    Get specific swap details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate([
        { path: 'requester', select: 'firstName lastName avatar rating' },
        { path: 'recipient', select: 'firstName lastName avatar rating' }
      ]);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is part of this swap
    const isRequester = swap.requester._id.toString() === req.user._id.toString();
    const isRecipient = swap.recipient._id.toString() === req.user._id.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this swap'
      });
    }

    res.json({
      success: true,
      data: swap
    });
  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

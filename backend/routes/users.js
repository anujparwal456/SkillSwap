const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  protect,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
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

    const allowedFields = [
      'firstName', 'lastName', 'bio', 'location', 'skillsOffered', 
      'skillsWanted', 'availability', 'timezone', 'isPublic', 
      'emailNotifications', 'showLocation'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/browse
// @desc    Browse public user profiles
// @access  Public/Optional Auth
router.get('/browse', optionalAuth, async (req, res) => {
  try {
    const { 
      search, 
      location, 
      availability, 
      sortBy = 'rating',
      page = 1,
      limit = 12
    } = req.query;

    const query = { 
      isPublic: true, 
      isActive: true 
    };

    // Exclude current user if authenticated
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { skillsOffered: { $in: [new RegExp(search, 'i')] } },
        { skillsWanted: { $in: [new RegExp(search, 'i')] } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Availability filter
    if (availability && availability !== 'all') {
      query.availability = { $in: [availability] };
    }

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { rating: -1, totalRatings: -1 };
        break;
      case 'swaps':
        sortOptions = { completedSwaps: -1 };
        break;
      case 'name':
        sortOptions = { firstName: 1, lastName: 1 };
        break;
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { rating: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    // Add online status (users active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const usersWithStatus = users.map(user => {
      const userObj = user.toObject();
      userObj.isOnline = user.lastActive >= fiveMinutesAgo;
      return userObj;
    });

    res.json({
      success: true,
      data: {
        users: usersWithStatus,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers: total,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Browse users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isPublic || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Profile is not public or user is inactive'
      });
    }

    // Add online status
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const userObj = user.toObject();
    userObj.isOnline = user.lastActive >= fiveMinutesAgo;

    res.json({
      success: true,
      data: userObj
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats/dashboard
// @desc    Get user dashboard statistics
// @access  Private
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const Swap = require('../models/Swap');
    
    const stats = {
      totalSwaps: req.user.completedSwaps,
      rating: req.user.rating,
      pendingRequests: await Swap.countDocuments({
        $or: [
          { requester: req.user._id },
          { recipient: req.user._id }
        ],
        status: 'pending'
      }),
      skillsOffered: req.user.skillsOffered.length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

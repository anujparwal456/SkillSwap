const express = require('express');
const mongoose = require('mongoose');
const { adminOnly, protect } = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');
const Swap = require('../models/Swap');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @route   GET /api/admin/reports
// @desc    Get all reports
// @access  Private/Admin
router.get('/reports', [protect, adminOnly], async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUser', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/report/:id/respond
// @desc    Respond to a report
// @access  Private/Admin
router.post('/report/:id/respond', [
  protect,
  adminOnly,
  body('action').isIn(['resolved', 'dismissed']).withMessage('Action must be either resolved or dismissed'),
  body('adminNotes').optional().isLength({ max: 1000 }).withMessage('Admin notes cannot exceed 1000 characters')
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

    const { action, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update report
    report.status = action;
    report.adminNotes = adminNotes || '';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.actionTaken = action;
    await report.save();

    res.json({
      success: true,
      message: `Report has been ${action}`
    });
  } catch (error) {
    console.error('Respond to report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [protect, adminOnly], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/user/:id/status
// @desc    Update user status (active/banned)
// @access  Private/Admin
router.put('/user/:id/status', [
  protect,
  adminOnly,
  body('status').isIn(['active', 'banned']).withMessage('Status must be either active or banned')
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = req.body.status === 'active';
    await user.save();

    res.json({
      success: true,
      message: `User status updated to ${req.body.status}`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', [protect, adminOnly], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSwaps = await Swap.countDocuments();
    const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
    const completedSwaps = await Swap.countDocuments({ status: 'completed' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    const stats = {
      totalUsers,
      activeUsers,
      bannedUsers: totalUsers - activeUsers,
      totalSwaps,
      pendingSwaps,
      completedSwaps,
      pendingReports,
      successRate: totalSwaps > 0 ? ((completedSwaps / totalSwaps) * 100).toFixed(1) : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

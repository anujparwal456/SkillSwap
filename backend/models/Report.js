const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['inappropriate_skill', 'spam', 'harassment', 'fake_profile', 'other'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  evidence: {
    type: String,
    maxlength: [2000, 'Evidence cannot exceed 2000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'temporary_ban', 'permanent_ban', 'profile_edit'],
    default: 'none'
  },
  relatedSwap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, status: 1 });
reportSchema.index({ reportType: 1, status: 1 });

// Pre-save middleware to update review date
reportSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);

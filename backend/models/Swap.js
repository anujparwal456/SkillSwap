const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffered: {
    type: String,
    required: [true, 'Skill offered is required'],
    trim: true
  },
  skillWanted: {
    type: String,
    required: [true, 'Skill wanted is required'],
    trim: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  completedDate: {
    type: Date,
    default: null
  },
  rating: {
    requesterRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    recipientRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  feedback: {
    requesterFeedback: {
      type: String,
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
      default: ''
    },
    recipientFeedback: {
      type: String,
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
      default: ''
    }
  },
  isRequesterFeedbackGiven: {
    type: Boolean,
    default: false
  },
  isRecipientFeedbackGiven: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters'],
    default: ''
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ recipient: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });

// Virtual to check if swap is completed by both parties
swapSchema.virtual('isFullyCompleted').get(function() {
  return this.status === 'completed' && 
         this.isRequesterFeedbackGiven && 
         this.isRecipientFeedbackGiven;
});

// Method to check if user can rate this swap
swapSchema.methods.canUserRate = function(userId) {
  if (this.status !== 'completed') return false;
  
  if (this.requester.toString() === userId.toString()) {
    return !this.isRequesterFeedbackGiven;
  }
  
  if (this.recipient.toString() === userId.toString()) {
    return !this.isRecipientFeedbackGiven;
  }
  
  return false;
};

// Method to get user's role in this swap
swapSchema.methods.getUserRole = function(userId) {
  if (this.requester.toString() === userId.toString()) {
    return 'requester';
  }
  if (this.recipient.toString() === userId.toString()) {
    return 'recipient';
  }
  return null;
};

// Pre-save middleware to update completion date
swapSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Swap', swapSchema);

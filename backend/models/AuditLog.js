const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'EMPLOYEE_CREATED',
        'PASSWORD_CHANGED',
        'PASSWORD_RESET',
        'ACCOUNT_BLOCKED',
        'ACCOUNT_UNBLOCKED'
      ],
      required: true
    },
    userType: { type: String, enum: ['user', 'employee'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: false, refPath: 'userType' },
    email: { type: String },
    name: { type: String },
    sessionId: { type: String },
    metadata: { type: Object, default: {} }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ type: 1, userType: 1, email: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);

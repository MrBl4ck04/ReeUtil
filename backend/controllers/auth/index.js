// Importar todos los módulos de autenticación
const { signup, login, verifyLoginCode } = require('./authHandlers');
const { protect, restrictTo } = require('./authMiddleware');
const { getCaptcha } = require('./captchaService');
const { sendVerificationCode } = require('./verificationService');
const { changePassword, resetPassword } = require('./passwordHandlers');
const {
  getAllUsers,
  getBlockedUsers,
  unblockAccount,
  unblockUserById,
  blockUserById,
  checkBlockedStatus,
  searchUsersByName
} = require('./userManagement');

// Exportar todos los handlers y middleware
module.exports = {
  // Auth handlers
  signup,
  login,
  verifyLoginCode,
  
  // Auth middleware
  protect,
  restrictTo,
  
  // Captcha
  getCaptcha,
  
  // Verification
  sendVerificationCode,
  
  // Password management
  changePassword,
  resetPassword,
  
  // User management
  getAllUsers,
  getBlockedUsers,
  unblockAccount,
  unblockUserById,
  blockUserById,
  checkBlockedStatus,
  searchUsersByName
};

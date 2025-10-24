const AuditLog = require('../models/AuditLog');

/**
 * Registra un evento de auditoría
 * @param {Object} params
 * @param {('LOGIN'|'LOGOUT'|'EMPLOYEE_CREATED'|'PASSWORD_CHANGED'|'PASSWORD_RESET'|'ACCOUNT_BLOCKED'|'ACCOUNT_UNBLOCKED')} params.type
 * @param {('user'|'employee')} params.userType
 * @param {string} [params.userId]
 * @param {string} [params.email]
 * @param {string} [params.name]
 * @param {Object} [params.metadata]
 */
async function logEvent({ type, userType, userId, email, name, metadata = {} }) {
  try {
    await AuditLog.create({ type, userType, userId, email, name, metadata });
  } catch (err) {
    console.error('Error registrando audit log:', err);
  }
}

module.exports = { logEvent };

const express = require('express');
const { protect, restrictTo } = require('../controllers/auth');
const { getLogs } = require('../controllers/logs/auditController');

const router = express.Router();

// Solo administradores (empleados) pueden ver logs
router.get('/', protect, restrictTo('admin'), getLogs);

module.exports = router;

const express = require('express');
const { protect } = require('../controllers/auth');
const { getLogs } = require('../controllers/logs/auditController');

const router = express.Router();

// Solo administradores (empleados) pueden ver logs
router.get('/', protect, getLogs);

module.exports = router;

const express = require('express');
const ruleController = require('../controllers/ruleController');
const { protect, restrictTo } = require('../controllers/auth');

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/', ruleController.getAllRules);
router.get('/:id', ruleController.getRule);

// Rutas protegidas (requieren autenticación)
router.post('/', protect, ruleController.createRule);
router.patch('/:id', protect, ruleController.updateRule);
router.delete('/:id', protect, ruleController.deleteRule);

module.exports = router;

const express = require('express');
const ruleController = require('../controllers/ruleController');
const { protect, restrictTo } = require('../controllers/auth');

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/', ruleController.getAllRules);
router.get('/:id', ruleController.getRule);

// Rutas protegidas (requieren admin)
router.post('/', protect, restrictTo('admin'), ruleController.createRule);
router.patch('/:id', protect, restrictTo('admin'), ruleController.updateRule);
router.delete('/:id', protect, restrictTo('admin'), ruleController.deleteRule);

module.exports = router;

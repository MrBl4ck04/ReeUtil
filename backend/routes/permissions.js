const express = require('express');
const permissionModuleController = require('../controllers/permissions/permissionModuleController');

const router = express.Router();

// Rutas de módulos de permisos
router.get('/', permissionModuleController.getAllModules);
router.post('/', permissionModuleController.createModule);
router.get('/:id', permissionModuleController.getModuleById);
router.patch('/:id', permissionModuleController.updateModule);
router.delete('/:id', permissionModuleController.deleteModule);

module.exports = router;

const express = require('express');
const roleController = require('../controllers/roles/roleController');

const router = express.Router();

// Rutas de roles
router.get('/', roleController.getAllRoles);
router.post('/', roleController.createRole);
router.get('/:id', roleController.getRoleById);
router.patch('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Proteger todas las rutas - solo admin
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Endpoints del dashboard
router.get('/repairs-pending', dashboardController.getPendingRepairs);
router.get('/recycle-pending', dashboardController.getPendingRecycle);
router.get('/recent-sales', dashboardController.getRecentSales);
router.get('/new-reviews', dashboardController.getNewReviews);
router.get('/all', dashboardController.getAllDashboardData);

module.exports = router;

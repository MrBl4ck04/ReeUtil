const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas públicas (sin autenticación)
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// Rutas protegidas (requieren autenticación)
router.get('/me', authController.protect, (req, res) => {
  console.log('👤 Usuario autenticado:', req.user);
  res.status(200).json({ userId: req.user._id, email: req.user.email });
});
router.get('/my-reviews', authController.protect, reviewController.getMyReviews);
router.post('/', authController.protect, reviewController.createReview);
router.patch('/:id', authController.protect, reviewController.updateReview);
router.delete('/:id', authController.protect, reviewController.deleteReview);
router.post('/:id/flag', authController.protect, reviewController.flagReview);

// Rutas de admin (requieren autenticación + rol admin)
router.get('/all', authController.protect, authController.restrictTo('admin'), reviewController.getAllReviews);
router.get('/stats', authController.protect, authController.restrictTo('admin'), reviewController.getReviewsStats);

module.exports = router;

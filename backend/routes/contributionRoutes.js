const express = require('express');
const router = express.Router();
const {
    createContribution,
    addPayment,
    markAsPaid,
    getMemberPayments,
    getContributions,
    getActiveContribution
} = require('../controllers/contributionController');
const { authMiddleware, adminMiddleware, secretaryMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get active contribution for dashboard (all authenticated users)
router.get('/active', getActiveContribution);

// Get all contributions (all authenticated users)
router.get('/', getContributions);

// Create new contribution (Secretary only)
router.post('/', secretaryMiddleware, createContribution);

// Get member payments for a specific contribution (all authenticated users)
router.get('/:contributionId/payments', getMemberPayments);

// Add payment record (Secretary only)
router.post('/:contributionId/payments/:userId', secretaryMiddleware, addPayment);

// Mark payment as paid (Secretary only)
router.put('/:contributionId/payments/:userId/mark-paid', secretaryMiddleware, markAsPaid);

module.exports = router;

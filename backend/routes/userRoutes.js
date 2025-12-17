const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    approveUser,
    rejectUser,
    getPendingUsers
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
    .get(authMiddleware, getUserProfile)
    .put(authMiddleware, updateUserProfile);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getUsers);
router.get('/pending', authMiddleware, adminMiddleware, getPendingUsers);
router.put('/:id/approve', authMiddleware, adminMiddleware, approveUser);
router.put('/:id/reject', authMiddleware, adminMiddleware, rejectUser);
router.route('/:id')
    .get(authMiddleware, adminMiddleware, getUserById)
    .put(authMiddleware, adminMiddleware, updateUser)
    .delete(authMiddleware, adminMiddleware, deleteUser);

module.exports = router;

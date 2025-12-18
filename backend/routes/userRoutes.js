const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    approveUser,
    rejectUser,
    getPendingUsers
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes – anyone can register and login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes – only logged-in user can see/update their own profile
// We will use the login response data – no need for separate /profile route anymore
// So we remove this completely to stop the 404 error

// Admin routes – only President or Advisor
router.get('/', authMiddleware, adminMiddleware, getUsers);
router.get('/pending', authMiddleware, adminMiddleware, getPendingUsers);
router.put('/:id/approve', authMiddleware, adminMiddleware, approveUser);
router.put('/:id/reject', authMiddleware, adminMiddleware, rejectUser);
router.route('/:id')
    .get(authMiddleware, adminMiddleware, getUserById)
    .put(authMiddleware, adminMiddleware, updateUser)
    .delete(authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
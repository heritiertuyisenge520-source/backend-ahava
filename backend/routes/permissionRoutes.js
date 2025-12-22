const express = require('express');
const router = express.Router();
const {
    createPermission,
    getAllPermissions,
    getUserPermissions,
    updatePermissionStatus,
    getActivePermissionsForDate
} = require('../controllers/permissionController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createPermission);
router.get('/', authMiddleware, adminMiddleware, getAllPermissions);
router.get('/user', authMiddleware, getUserPermissions);
router.put('/:id', authMiddleware, adminMiddleware, updatePermissionStatus);
router.get('/active/:date', authMiddleware, getActivePermissionsForDate);

module.exports = router;

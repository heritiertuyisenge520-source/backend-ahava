const Permission = require('../models/Permission');
const User = require('../models/User');

// @desc    Create a permission request
// @route   POST /api/permissions
// @access  Private
const createPermission = async (req, res) => {
    try {
        const { startDate, endDate, reason, details } = req.body;
        const userId = req.user.id;
        const userName = req.user.name;

        const permission = new Permission({
            userId,
            userName,
            startDate,
            endDate,
            reason,
            details: details || ''
        });

        const savedPermission = await permission.save();

        res.status(201).json({
            message: 'Permission request submitted successfully',
            permission: savedPermission
        });
    } catch (error) {
        console.error('Error creating permission:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all permission requests (for admins)
// @route   GET /api/permissions
// @access  Private/Admin
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find({})
            .populate('userId', 'name email role')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's permission requests
// @route   GET /api/permissions/user
// @access  Private
const getUserPermissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const permissions = await Permission.find({ userId })
            .sort({ createdAt: -1 });

        res.json(permissions);
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update permission status (approve/reject)
// @route   PUT /api/permissions/:id
// @access  Private/Admin
const updatePermissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const reviewedBy = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const permission = await Permission.findByIdAndUpdate(
            id,
            {
                status,
                reviewedBy,
                reviewedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name email');

        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        res.json({
            message: `Permission ${status}`,
            permission
        });
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get active permissions for a date
// @route   GET /api/permissions/active/:date
// @access  Private
const getActivePermissionsForDate = async (req, res) => {
    try {
        const { date } = req.params;

        const activePermissions = await Permission.find({
            status: 'approved',
            startDate: { $lte: date },
            endDate: { $gte: date }
        }).populate('userId', 'name');

        // Return array of user IDs with active permissions
        const userIds = activePermissions.map(permission => ({
            userId: permission.userId._id.toString(),
            userName: permission.userName,
            startDate: permission.startDate,
            endDate: permission.endDate,
            reason: permission.reason,
            details: permission.details
        }));

        res.json(userIds);
    } catch (error) {
        console.error('Error fetching active permissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPermission,
    getAllPermissions,
    getUserPermissions,
    updatePermissionStatus,
    getActivePermissionsForDate
};

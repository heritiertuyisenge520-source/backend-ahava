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

        // Check if user has any pending permissions that are still active (not expired)
        const pendingPermissionsRefs = await Permission.find({
            userId,
            status: 'pending'
        });

        // Parse dates in JS to handle format differences properly
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activePending = pendingPermissionsRefs.filter(p => {
            // Handle different date formats if necessary, assuming standard parseable dates
            let end = new Date(p.endDate);
            // Attempt manual parse if needed (simple fallback for YYYY-MM-DD or MM/DD/YYYY)
            if (isNaN(end.getTime()) && p.endDate.includes('-')) {
                const parts = p.endDate.split('-');
                if (parts.length === 3) end = new Date(parts[0], parts[1] - 1, parts[2]);
            }
            return !isNaN(end.getTime()) && end >= today;
        });

        if (activePending.length > 0) {
            const current = activePending[0];
            return res.status(400).json({
                message: 'You already have a pending permission request. Please wait for it to be reviewed before submitting a new one.',
                existingPermission: {
                    id: current._id,
                    startDate: current.startDate,
                    endDate: current.endDate,
                    reason: current.reason,
                    status: current.status
                }
            });
        }

        // Check if user has approved permissions that overlap with the requested dates
        const overlappingPermissions = await Permission.find({
            userId,
            status: 'approved',
            $or: [
                // New request starts during existing permission
                { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
                // New request ends during existing permission
                { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
                // New request completely covers existing permission
                { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
            ]
        });

        if (overlappingPermissions.length > 0) {
            const existingPermission = overlappingPermissions[0];
            return res.status(400).json({
                message: `You already have an approved permission from ${existingPermission.startDate} to ${existingPermission.endDate} for: ${existingPermission.reason}. You cannot request overlapping permissions.`,
                existingPermission: {
                    id: existingPermission._id,
                    startDate: existingPermission.startDate,
                    endDate: existingPermission.endDate,
                    reason: existingPermission.reason,
                    status: existingPermission.status
                }
            });
        }

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

// Helper to delete expired permissions
const deleteExpiredPermissions = async () => {
    try {
        const permissions = await Permission.find({});
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deleteIds = [];

        permissions.forEach(p => {
            // Determine end date
            let endDate = new Date(p.endDate);

            // Handle cases where date parsing might be tricky or needs explicit format
            if (isNaN(endDate.getTime())) {
                // Try parsing YYYY-MM-DD manually if Date constructor fails (unlikely for ISO)
                const parts = p.endDate.split('-');
                if (parts.length === 3) {
                    endDate = new Date(parts[0], parts[1] - 1, parts[2]);
                }
            }

            // If valid end date and it's less than today (yesterday or before), mark for delete
            if (!isNaN(endDate.getTime()) && endDate < today) {
                deleteIds.push(p._id);
            }
        });

        if (deleteIds.length > 0) {
            await Permission.deleteMany({ _id: { $in: deleteIds } });
            console.log(`Deleted ${deleteIds.length} expired permissions.`);
        }
    } catch (err) {
        console.error('Error cleaning up expired permissions:', err);
    }
};

// @desc    Get all permission requests (for admins)
// @route   GET /api/permissions
// @access  Private/Admin
const getAllPermissions = async (req, res) => {
    try {
        await deleteExpiredPermissions(); // Cleanup first

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
        await deleteExpiredPermissions(); // Cleanup first

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

        console.log('Fetching active permissions for date:', date);

        const activePermissions = await Permission.find({
            status: 'approved',
            startDate: { $lte: date },
            endDate: { $gte: date }
        }).populate('userId', 'name');

        console.log('Found active permissions:', activePermissions.length);

        // Return array of user IDs with active permissions
        const userIds = activePermissions
            .filter(permission => permission.userId) // Only include permissions with valid user references
            .map(permission => ({
                userId: permission.userId._id.toString(),
                userName: permission.userName,
                startDate: permission.startDate,
                endDate: permission.endDate,
                reason: permission.reason,
                details: permission.details
            }));

        console.log('Returning active permissions:', userIds);

        res.json(userIds);
    } catch (error) {
        console.error('Error fetching active permissions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createPermission,
    getAllPermissions,
    getUserPermissions,
    updatePermissionStatus,
    getActivePermissionsForDate
};

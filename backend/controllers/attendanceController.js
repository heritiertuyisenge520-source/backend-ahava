const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');

// Helper function to clean up attendance records for past events
const cleanupPastAttendance = async () => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];

        // Find all past events
        const pastEvents = await Event.find({ date: { $lt: currentDate } });

        if (pastEvents.length > 0) {
            const pastEventIds = pastEvents.map(event => event._id);
            const result = await Attendance.deleteMany({ eventId: { $in: pastEventIds } });
            if (result.deletedCount > 0) {
                console.log(`Cleaned up ${result.deletedCount} attendance records for past events`);
            }
        }
    } catch (error) {
        console.error('Error cleaning up past attendance records:', error);
    }
};

// @desc    Get attendance records for an event
// @route   GET /api/attendances/event/:eventId
// @access  Private
const getAttendanceByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Clean up past attendance records
        await cleanupPastAttendance();

        const attendanceRecords = await Attendance.find({ eventId })
            .populate('userId', 'name username role')
            .sort({ 'userId.name': 1 });

        // Convert to the format expected by frontend
        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            attendanceMap[record.userId._id] = record.status;
        });

        res.json(attendanceMap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Save attendance for an event
// @route   POST /api/attendances/event/:eventId
// @access  Private/Admin
const saveAttendance = async (req, res) => {
    try {
        const { eventId } = req.params;
        const attendanceData = req.body; // Object with userId: status

        // Delete existing attendance records for this event
        await Attendance.deleteMany({ eventId });

        // Create new attendance records
        const attendanceRecords = [];
        for (const [userId, status] of Object.entries(attendanceData)) {
            attendanceRecords.push({
                eventId,
                userId,
                status
            });
        }

        const savedRecords = await Attendance.insertMany(attendanceRecords);
        res.status(201).json(savedRecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user attendance history
// @route   GET /api/attendances/user/:userId
// @access  Private
const getUserAttendance = async (req, res) => {
    try {
        const { userId } = req.params;

        const attendanceRecords = await Attendance.find({ userId })
            .populate('eventId', 'name date type')
            .sort({ 'eventId.date': -1 });

        res.json(attendanceRecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get attendance summary for user
// @route   GET /api/attendances/summary/:userId
// @access  Private
const getAttendanceSummary = async (req, res) => {
    try {
        const { userId } = req.params;

        const attendanceRecords = await Attendance.find({ userId })
            .populate('eventId', 'date endTime');

        const summary = {
            Present: 0,
            Absent: 0,
            Excused: 0,
            'No Event': 0
        };

        const now = new Date();

        attendanceRecords.forEach(record => {
            if (new Date(record.eventId.endTime) < now) {
                summary[record.status]++;
            }
        });

        res.json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAttendanceByEvent,
    saveAttendance,
    getUserAttendance,
    getAttendanceSummary
};

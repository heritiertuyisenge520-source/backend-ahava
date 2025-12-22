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

        // Convert eventId to ObjectId if it's a string
        const eventObjectId = typeof eventId === 'string' ? eventId : eventId;

        // Get all approved users to ensure every user has an attendance record
        const approvedUsers = await User.find({ status: 'approved' });

        console.log(`Saving attendance for event ${eventId}, ${approvedUsers.length} approved users`);

        // Debug: Log the attendance data received
        console.log('Received attendanceData keys:', Object.keys(attendanceData));
        console.log('Sample attendanceData:', Object.entries(attendanceData).slice(0, 3));

        // Get event details for the human-readable name
        const eventDetails = await Event.findById(eventObjectId);
        if (!eventDetails) {
            throw new Error('Event not found');
        }

        // Perform upsert operations for each approved user
        const upsertPromises = approvedUsers.map(async (user) => {
            const userIdString = user._id.toString();
            // Use the provided status, or default to 'Absent' if not specified
            const status = attendanceData[userIdString] || 'Absent';

            console.log(`Processing user ${user.name} (${userIdString}): status=${status}, found in data=${!!attendanceData[userIdString]}`);

            try {
                // Use findOneAndUpdate with upsert: true to update existing or create new
                const result = await Attendance.findOneAndUpdate(
                    { eventId: eventObjectId, userId: user._id }, // Find by eventId and userId
                    {
                        eventId: eventObjectId,
                        userId: user._id,
                        eventName: eventDetails.name, // Human-readable event name
                        userName: user.name, // Human-readable user name
                        status,
                        updatedAt: new Date() // Update timestamp
                    },
                    {
                        upsert: true, // Create if doesn't exist
                        new: true, // Return the updated document
                        setDefaultsOnInsert: true // Apply defaults on insert
                    }
                );
                console.log(`Successfully upserted attendance for ${user.name}: ${result.status}`);
                return result;
            } catch (upsertError) {
                console.error(`Error upserting attendance for user ${user.name}:`, upsertError);
                throw upsertError;
            }
        });

        // Wait for all upsert operations to complete
        const results = await Promise.all(upsertPromises);

        console.log(`Successfully saved attendance for ${results.length} users`);

        res.status(200).json({
            message: 'Attendance saved successfully',
            updatedCount: results.length
        });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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

// @desc    Get attendance summaries for all users
// @route   GET /api/attendances/summaries
// @access  Private
const getAllAttendanceSummaries = async (req, res) => {
    try {
        console.log('Fetching attendance summaries for all users...');

        // Get all users first
        const users = await User.find({ status: 'approved' });
        console.log(`Found ${users.length} approved users`);

        const summaries = {};

        // Get attendance summary for each user
        for (const user of users) {
            console.log(`Processing user: ${user.name} (${user._id})`);

            const attendanceRecords = await Attendance.find({ userId: user._id });

            console.log(`Found ${attendanceRecords.length} attendance records for ${user.name}`);

            const summary = {
                Present: 0,
                Absent: 0,
                Excused: 0,
                totalEvents: 0
            };

            // Count all attendance records (no endTime filtering for now)
            attendanceRecords.forEach((record, index) => {
                console.log(`Record ${index}: status=${record.status}, eventName=${record.eventName}`);
                summary[record.status]++;
                summary.totalEvents++;
                console.log(`Counted: ${record.status} for ${user.name}`);
            });

            console.log(`Final summary for ${user.name}:`, summary);
            summaries[user._id] = summary;
        }

        console.log('Final summaries object:', summaries);
        res.json(summaries);
    } catch (error) {
        console.error('Error in getAllAttendanceSummaries:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAttendanceByEvent,
    saveAttendance,
    getUserAttendance,
    getAttendanceSummary,
    getAllAttendanceSummaries
};

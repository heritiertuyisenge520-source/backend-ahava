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

        // Find all user attendance documents and extract records for this event
        const allAttendanceDocs = await Attendance.find({})
            .populate('userId', 'name username role status')
            .sort({ 'userId.name': 1 });

        // Convert to the format expected by frontend
        const attendanceMap = {};

        // Only include approved users
        allAttendanceDocs.forEach(attendanceDoc => {
            if (attendanceDoc.userId && attendanceDoc.userId.status === 'approved') {
                const userId = attendanceDoc.userId._id.toString();

                // Find the record for this specific event
                const eventRecord = attendanceDoc.records.find(
                    record => record.eventId.toString() === eventId
                );

                if (eventRecord) {
                    attendanceMap[userId] = eventRecord.status;
                }
            }
        });

        res.json(attendanceMap);
    } catch (error) {
        console.error('Error getting attendance by event:', error);
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

        // Get event details for the human-readable name
        const eventDetails = await Event.findById(eventObjectId);
        if (!eventDetails) {
            throw new Error('Event not found');
        }

        // Get active permissions for this event date
        const Permission = require('../models/Permission');
        const activePermissions = await Permission.find({
            status: 'approved',
            startDate: { $lte: eventDetails.date },
            endDate: { $gte: eventDetails.date }
        });

        // Create a map of user IDs with active permissions
        const permissionMap = {};
        activePermissions.forEach(permission => {
            permissionMap[permission.userId.toString()] = permission;
        });

        console.log(`Found ${activePermissions.length} active permissions for event date ${eventDetails.date}`);

        // Process attendance for each approved user
        const updatePromises = approvedUsers.map(async (user) => {
            const userIdString = user._id.toString();

            // Check if user has an active permission for this event date
            const hasActivePermission = permissionMap[userIdString];

            // If user has active permission, force status to 'Excused'
            // Otherwise, use the provided status, or default to 'Absent' if not specified
            const status = hasActivePermission ? 'Excused' : (attendanceData[userIdString] || 'Absent');

            console.log(`Processing user ${user.name} (${userIdString}): status=${status}, hasPermission=${!!hasActivePermission}, found in data=${!!attendanceData[userIdString]}`);

            try {
                // Use upsert with $push or $set to update the records array
                const attendanceRecord = {
                    date: eventDetails.date,
                    event: eventDetails.name,
                    status,
                    eventId: eventObjectId
                };

                // Check if user already has an attendance document
                const existingAttendance = await Attendance.findOne({ userId: user._id });

                if (existingAttendance) {
                    // Update existing record or add new one
                    const existingRecordIndex = existingAttendance.records.findIndex(
                        record => record.eventId.toString() === eventId
                    );

                    if (existingRecordIndex >= 0) {
                        // Update existing record
                        existingAttendance.records[existingRecordIndex] = attendanceRecord;
                    } else {
                        // Add new record
                        existingAttendance.records.push(attendanceRecord);
                    }

                    await existingAttendance.save();
                } else {
                    // Create new attendance document for user
                    await Attendance.create({
                        userId: user._id,
                        name: user.name,
                        records: [attendanceRecord]
                    });
                }

                console.log(`Successfully updated attendance for ${user.name}: ${status}`);
                return true;
            } catch (updateError) {
                console.error(`Error updating attendance for user ${user.name}:`, updateError);
                throw updateError;
            }
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        console.log(`Successfully saved attendance for ${approvedUsers.length} users`);

        res.status(200).json({
            message: 'Attendance saved successfully',
            updatedCount: approvedUsers.length
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

        const userAttendance = await Attendance.findOne({ userId })
            .populate('records.eventId', 'name date type');

        if (!userAttendance) {
            return res.json([]);
        }

        // Sort records by date descending
        const sortedRecords = userAttendance.records
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(sortedRecords);
    } catch (error) {
        console.error('Error getting user attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get attendance summary for user
// @route   GET /api/attendances/summary/:userId
// @access  Private
const getAttendanceSummary = async (req, res) => {
    try {
        const { userId } = req.params;

        const userAttendance = await Attendance.findOne({ userId });

        const summary = {
            Present: 0,
            Absent: 0,
            Excused: 0,
            totalEvents: 0
        };

        if (userAttendance && userAttendance.records) {
            userAttendance.records.forEach(record => {
                // Count every valid status — no date/time checks!
                if (['Present', 'Absent', 'Excused'].includes(record.status)) {
                    summary[record.status]++;
                    summary.totalEvents++;
                }
            });
        }

        const attended = summary.Present + summary.Excused;
        const percentage = summary.totalEvents > 0
            ? Math.round((attended / summary.totalEvents) * 100)
            : 0;

        res.json({
            Present: summary.Present,
            Absent: summary.Absent,
            Excused: summary.Excused,
            totalEvents: summary.totalEvents,
            percentage
        });
    } catch (error) {
        console.error('Error getting attendance summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get attendance summaries for all users
// @route   GET /api/attendances/summaries
// @access  Private
const getAllAttendanceSummaries = async (req, res) => {
    try {
        console.log('Fetching attendance summaries for all users...');

        // Get all attendance documents (bucket format)
        const allAttendanceDocs = await Attendance.find({});
        console.log(`Found ${allAttendanceDocs.length} attendance documents`);

        const summaries = {};

        // Process each attendance document
        for (const attendanceDoc of allAttendanceDocs) {
            const userId = attendanceDoc.userId.toString();
            console.log(`Processing user: ${attendanceDoc.name} (${userId})`);

            const summary = {
                Present: 0,
                Absent: 0,
                Excused: 0,
                totalEvents: 0
            };

            // Count statuses from the records array
            attendanceDoc.records.forEach((record, index) => {
                // Count every valid status — no date/time checks or type filtering!
                console.log(`Record ${index}: status=${record.status}`);
                if (['Present', 'Absent', 'Excused'].includes(record.status)) {
                    summary[record.status]++;
                    summary.totalEvents++;
                    console.log(`Counted: ${record.status} for ${attendanceDoc.name}`);
                }
            });

            // Calculate attendance percentage
            const attended = summary.Present + summary.Excused;
            const percentage = summary.totalEvents > 0
                ? Math.round((attended / summary.totalEvents) * 100)
                : 0;

            const finalSummary = {
                ...summary,
                percentage
            };

            console.log(`Final summary for ${attendanceDoc.name}:`, finalSummary);
            summaries[userId] = finalSummary;
        }

        console.log('Final summaries object:', summaries);
        res.json(summaries);
    } catch (error) {
        console.error('Error in getAllAttendanceSummaries:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all attendance records
// @route   GET /api/attendances/all
// @access  Private
const getAllAttendances = async (req, res) => {
    try {
        // Get all attendance documents in bucket format
        const allAttendanceDocs = await Attendance.find({});

        // Transform to the format expected by frontend: { eventId: { userId: status } }
        const attendanceMap = {};

        allAttendanceDocs.forEach(attendanceDoc => {
            // Process each record in the user's records array
            attendanceDoc.records.forEach(record => {
                const eventId = record.eventId.toString();
                const userId = attendanceDoc.userId.toString();

                // Initialize event object if it doesn't exist
                if (!attendanceMap[eventId]) {
                    attendanceMap[eventId] = {};
                }

                // Set the user's status for this event
                attendanceMap[eventId][userId] = record.status;
            });
        });

        res.json(attendanceMap);
    } catch (error) {
        console.error('Error getting all attendances:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAttendanceByEvent,
    saveAttendance,
    getUserAttendance,
    getAttendanceSummary,
    getAllAttendanceSummaries,
    getAllAttendances
};

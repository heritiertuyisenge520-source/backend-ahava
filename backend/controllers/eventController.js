const Event = require('../models/Event');

// Helper function to clean up past events that have no attendance records
const cleanupPastEvents = async () => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];

        // Get all past events
        const pastEvents = await Event.find({ date: { $lt: currentDate } });

        // Check which past events have attendance records
        const Attendance = require('../models/Attendance');
        const eventsWithAttendance = await Attendance.distinct('eventId', {
            eventId: { $in: pastEvents.map(e => e._id) }
        });

        // Convert to string IDs for comparison
        const eventsWithAttendanceIds = eventsWithAttendance.map(id => id.toString());

        // Find events to delete (past events without attendance)
        const eventsToDelete = pastEvents.filter(event =>
            !eventsWithAttendanceIds.includes(event._id.toString())
        );

        if (eventsToDelete.length > 0) {
            const eventIdsToDelete = eventsToDelete.map(e => e._id);
            const result = await Event.deleteMany({ _id: { $in: eventIdsToDelete } });
            console.log(`Cleaned up ${result.deletedCount} past events without attendance records`);
        }
    } catch (error) {
        console.error('Error cleaning up past events:', error);
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
    try {
        // First, clean up past events that have no attendance
        await cleanupPastEvents();

        // Get all events and filter out completed ones (past date OR today but end time passed)
        const allEvents = await Event.find({}).sort({ date: 1, startTime: 1 });
        const now = new Date();

        const activeEvents = allEvents.filter(event => {
            const eventDateTime = new Date(`${event.date}T${event.endTime}`);
            return eventDateTime > now; // Only show events that haven't ended yet
        });

        res.json(activeEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const { name, type, date, startTime, endTime } = req.body;

        const event = await Event.create({
            name,
            type,
            date,
            startTime,
            endTime
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            event.name = req.body.name || event.name;
            event.type = req.body.type || event.type;
            event.date = req.body.date || event.date;
            event.startTime = req.body.startTime || event.startTime;
            event.endTime = req.body.endTime || event.endTime;

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (event) {
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};

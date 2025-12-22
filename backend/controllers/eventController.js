const Event = require('../models/Event');

// Helper function to clean up past events
const cleanupPastEvents = async () => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const result = await Event.deleteMany({ date: { $lt: currentDate } });
        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} past events`);
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
        // First, clean up past events
        await cleanupPastEvents();

        // Get all remaining events (current and future - past events are cleaned up)
        const events = await Event.find({}).sort({ date: 1, startTime: 1 });

        res.json(events);
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
        const event = await Event.findById(req.params.id);

        if (event) {
            await event.remove();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};

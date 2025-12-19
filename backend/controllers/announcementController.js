const Announcement = require('../models/Announcement');

// @desc    Get all active announcements (not expired)
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            $or: [
                { endTime: { $exists: false } }, // No endTime set
                { endTime: null }, // endTime is null
                { endTime: { $gt: now } } // endTime is in the future
            ]
        }).sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (announcement) {
            res.json(announcement);
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private
const createAnnouncement = async (req, res) => {
    try {
        const { type, title, content, startTime, endTime } = req.body;
        const author = req.user.name || req.user.username; // Use user's name as author

        const announcement = await Announcement.create({
            type,
            title,
            author,
            content,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined
        });

        res.status(201).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (announcement) {
            announcement.type = req.body.type || announcement.type;
            announcement.title = req.body.title || announcement.title;
            announcement.content = req.body.content || announcement.content;
            announcement.startTime = req.body.startTime ? new Date(req.body.startTime) : announcement.startTime;
            announcement.endTime = req.body.endTime ? new Date(req.body.endTime) : announcement.endTime;

            const updatedAnnouncement = await announcement.save();
            res.json(updatedAnnouncement);
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (announcement) {
            await announcement.remove();
            res.json({ message: 'Announcement removed' });
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};

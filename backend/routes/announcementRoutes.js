const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { authMiddleware, adminMiddleware, songManagerMiddleware } = require('../middleware/authMiddleware');

router.route('/')
    .get(authMiddleware, getAnnouncements)
    .post(authMiddleware, songManagerMiddleware, createAnnouncement);

router.route('/:id')
    .get(authMiddleware, getAnnouncementById)
    .put(authMiddleware, songManagerMiddleware, updateAnnouncement)
    .delete(authMiddleware, songManagerMiddleware, deleteAnnouncement);

module.exports = router;

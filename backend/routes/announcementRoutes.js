const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.route('/')
    .get(authMiddleware, getAnnouncements)
    .post(authMiddleware, createAnnouncement);

router.route('/:id')
    .get(authMiddleware, getAnnouncementById)
    .put(authMiddleware, adminMiddleware, updateAnnouncement)
    .delete(authMiddleware, adminMiddleware, deleteAnnouncement);

module.exports = router;

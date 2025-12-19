const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { authMiddleware, adminMiddleware, songManagerMiddleware } = require('../middleware/authMiddleware');

router.route('/')
    .get(authMiddleware, getEvents)
    .post(authMiddleware, songManagerMiddleware, createEvent);

router.route('/:id')
    .get(authMiddleware, getEventById)
    .put(authMiddleware, songManagerMiddleware, updateEvent)
    .delete(authMiddleware, songManagerMiddleware, deleteEvent);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.route('/')
    .get(authMiddleware, getEvents)
    .post(authMiddleware, adminMiddleware, createEvent);

router.route('/:id')
    .get(authMiddleware, getEventById)
    .put(authMiddleware, adminMiddleware, updateEvent)
    .delete(authMiddleware, adminMiddleware, deleteEvent);

module.exports = router;

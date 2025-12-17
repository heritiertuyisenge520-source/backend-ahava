const express = require('express');
const router = express.Router();
const {
    getAttendanceByEvent,
    saveAttendance,
    getUserAttendance,
    getAttendanceSummary
} = require('../controllers/attendanceController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.route('/event/:eventId')
    .get(authMiddleware, getAttendanceByEvent)
    .post(authMiddleware, adminMiddleware, saveAttendance);

router.get('/user/:userId', authMiddleware, getUserAttendance);
router.get('/summary/:userId', authMiddleware, getAttendanceSummary);

module.exports = router;

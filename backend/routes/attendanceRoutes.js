const express = require('express');
const router = express.Router();
const {
    getAttendanceByEvent,
    saveAttendance,
    getUserAttendance,
    getAttendanceSummary,
    getAllAttendanceSummaries,
    getAllAttendances
} = require('../controllers/attendanceController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.route('/event/:eventId')
    .get(authMiddleware, getAttendanceByEvent)
    .post(authMiddleware, adminMiddleware, saveAttendance);

router.get('/all', authMiddleware, getAllAttendances);
router.get('/user/:userId', authMiddleware, getUserAttendance);
router.get('/summary/:userId', authMiddleware, getAttendanceSummary);
router.get('/summaries', authMiddleware, getAllAttendanceSummaries);

module.exports = router;

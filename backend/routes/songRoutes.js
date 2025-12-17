const express = require('express');
const router = express.Router();
const {
    getSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong
} = require('../controllers/songController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.route('/')
    .get(authMiddleware, getSongs)
    .post(authMiddleware, adminMiddleware, createSong);

router.route('/:id')
    .get(authMiddleware, getSongById)
    .put(authMiddleware, adminMiddleware, updateSong)
    .delete(authMiddleware, adminMiddleware, deleteSong);

module.exports = router;

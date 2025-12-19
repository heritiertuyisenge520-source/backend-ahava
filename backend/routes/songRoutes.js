const express = require('express');
const router = express.Router();
const {
    getSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong
} = require('../controllers/songController');
const { authMiddleware, adminMiddleware, songManagerMiddleware } = require('../middleware/authMiddleware');

router.route('/')
    .get(authMiddleware, getSongs)
    .post(authMiddleware, songManagerMiddleware, createSong);

router.route('/:id')
    .get(authMiddleware, getSongById)
    .put(authMiddleware, songManagerMiddleware, updateSong)
    .delete(authMiddleware, songManagerMiddleware, deleteSong);

module.exports = router;

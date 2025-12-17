const Song = require('../models/Song');

// @desc    Get all songs
// @route   GET /api/songs
// @access  Private
const getSongs = async (req, res) => {
    try {
        const songs = await Song.find({}).sort({ createdAt: -1 });
        res.json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single song
// @route   GET /api/songs/:id
// @access  Private
const getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (song) {
            res.json(song);
        } else {
            res.status(404).json({ message: 'Song not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new song
// @route   POST /api/songs
// @access  Private/Admin
const createSong = async (req, res) => {
    try {
        const { title, composer, lyrics } = req.body;

        const song = await Song.create({
            title,
            composer,
            lyrics
        });

        res.status(201).json(song);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a song
// @route   PUT /api/songs/:id
// @access  Private/Admin
const updateSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (song) {
            song.title = req.body.title || song.title;
            song.composer = req.body.composer || song.composer;
            song.lyrics = req.body.lyrics || song.lyrics;

            const updatedSong = await song.save();
            res.json(updatedSong);
        } else {
            res.status(404).json({ message: 'Song not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Private/Admin
const deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (song) {
            await song.remove();
            res.json({ message: 'Song removed' });
        } else {
            res.status(404).json({ message: 'Song not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong
};

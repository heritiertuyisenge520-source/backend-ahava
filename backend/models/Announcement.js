const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['general', 'permission'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: Date,
        required: false
    },
    endTime: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);

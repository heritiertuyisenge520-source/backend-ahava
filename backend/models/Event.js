const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Practice', 'Service'],
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD format
        required: true
    },
    startTime: {
        type: String, // HH:MM format
        required: true
    },
    endTime: {
        type: String, // HH:MM format
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

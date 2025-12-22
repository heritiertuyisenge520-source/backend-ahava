const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Excused'],
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    }
}, { _id: false }); // Disable _id for subdocuments

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ensure one document per user
    },
    name: {
        type: String,
        required: true
    },
    records: [attendanceRecordSchema]
}, {
    timestamps: true
});

// Create compound index for efficient queries
attendanceSchema.index({ userId: 1 });
attendanceSchema.index({ 'records.date': 1 });
attendanceSchema.index({ 'records.eventId': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

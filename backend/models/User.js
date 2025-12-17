const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    profilePictureUrl: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['Singer', 'Advisor', 'President', 'Song Conductor'],
        required: true
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    placeOfBirth: {
        type: String,
        required: true,
        trim: true
    },
    placeOfResidence: {
        type: String,
        required: true,
        trim: true
    },
    yearOfStudy: {
        type: String,
        enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', ''],
        default: ''
    },
    university: {
        type: String,
        enum: ['University of Rwanda', 'East African', ''],
        default: ''
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', ''],
        default: ''
    },
    maritalStatus: {
        type: String,
        enum: ['Single', 'Married', ''],
        default: ''
    },
    homeParishName: {
        type: String,
        required: true,
        trim: true
    },
    homeParishLocation: {
        cell: {
            type: String,
            required: true,
            trim: true
        },
        sector: {
            type: String,
            required: true,
            trim: true
        },
        district: {
            type: String,
            required: true,
            trim: true
        }
    },
    schoolResidence: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);

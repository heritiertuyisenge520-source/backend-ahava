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
        enum: ['Singer', 'Advisor', 'President', 'Song Conductor', 'Accountant', 'Secretary'],
        required: true
    },
    dateOfBirth: {
        type: String,
        required: false
    },
    placeOfBirth: {
        type: String,
        required: false,
        trim: true
    },
    placeOfResidence: {
        type: String,
        required: false,
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
        required: false,
        trim: true
    },
    homeParishLocation: {
        cell: {
            type: String,
            required: false,
            trim: true
        },
        sector: {
            type: String,
            required: false,
            trim: true
        },
        district: {
            type: String,
            required: false,
            trim: true
        }
    },
    schoolResidence: {
        type: String,
        required: false,
        trim: true
    },
    province: {
        type: String,
        trim: true
    },
    district: {
        type: String,
        trim: true
    },
    sector: {
        type: String,
        trim: true
    },
    cell: {
        type: String,
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

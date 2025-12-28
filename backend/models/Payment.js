const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    datePaid: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
});

const paymentSchema = new mongoose.Schema({
    contributionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contribution',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paymentHistory: [paymentRecordSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);

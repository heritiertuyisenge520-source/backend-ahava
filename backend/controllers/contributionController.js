const Contribution = require('../models/Contribution');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ExcelJS = require('exceljs');

// @desc    Create a new contribution
// @route   POST /api/contributions
// @access  Private (Secretary only)
const createContribution = async (req, res) => {
    try {
        const { title, description, amountPerPerson, startDate, endDate } = req.body;

        // Validate required fields
        if (!title || !amountPerPerson || !startDate || !endDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Create contribution
        const contribution = await Contribution.create({
            title,
            description,
            amountPerPerson,
            startDate,
            endDate,
            createdBy: req.user._id
        });

        res.status(201).json(contribution);
    } catch (error) {
        console.error('Create contribution error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add a payment record for a user
// @route   POST /api/contributions/:contributionId/payments/:userId
// @access  Private (Secretary only)
const addPayment = async (req, res) => {
    try {
        const { contributionId, userId } = req.params;
        const { amount, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid payment amount is required' });
        }

        // Verify the user exists and is approved
        const user = await User.findById(userId);
        if (!user || user.status !== 'approved') {
            return res.status(404).json({ message: 'User not found or not approved' });
        }

        // Get the contribution to check the required amount
        const contribution = await Contribution.findById(contributionId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        // Find existing payment or create new one
        let payment = await Payment.findOne({ contributionId, userId });
        if (!payment) {
            payment = await Payment.create({
                contributionId,
                userId,
                amountPaid: 0,
                isPaid: false,
                paymentHistory: []
            });
        }

        // Add the payment record
        payment.paymentHistory.push({
            amount: amount,
            datePaid: new Date(),
            notes: notes || ''
        });

        // Update total amount paid
        payment.amountPaid += amount;

        // Check if fully paid
        payment.isPaid = payment.amountPaid >= contribution.amountPerPerson;

        await payment.save();

        res.json({ message: 'Payment added successfully', payment });
    } catch (error) {
        console.error('Add payment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark a user's payment as fully paid (legacy function)
// @route   PUT /api/contributions/:contributionId/payments/:userId/mark-paid
// @access  Private (Secretary only)
const markAsPaid = async (req, res) => {
    try {
        const { contributionId, userId } = req.params;
        const { amount } = req.body;

        // Verify the user exists and is approved
        const user = await User.findById(userId);
        if (!user || user.status !== 'approved') {
            return res.status(404).json({ message: 'User not found or not approved' });
        }

        // Get the contribution
        const contribution = await Contribution.findById(contributionId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        // Find existing payment or create new one
        let payment = await Payment.findOne({ contributionId, userId });
        if (!payment) {
            payment = await Payment.create({
                contributionId,
                userId,
                amountPaid: 0,
                isPaid: false,
                paymentHistory: []
            });
        }

        // Calculate remaining amount to pay
        const remainingAmount = contribution.amountPerPerson - payment.amountPaid;

        if (remainingAmount <= 0) {
            return res.status(400).json({ message: 'Payment is already complete' });
        }

        const paymentAmount = amount || remainingAmount;

        // Add the payment record
        payment.paymentHistory.push({
            amount: paymentAmount,
            datePaid: new Date(),
            notes: 'Marked as paid'
        });

        // Update total amount paid
        payment.amountPaid += paymentAmount;

        // Check if fully paid
        payment.isPaid = payment.amountPaid >= contribution.amountPerPerson;

        await payment.save();

        res.json({ message: 'Payment marked as paid', payment });
    } catch (error) {
        console.error('Mark as paid error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all members and their payment status for a specific contribution
// @route   GET /api/contributions/:contributionId/payments
// @access  Private
const getMemberPayments = async (req, res) => {
    try {
        const { contributionId } = req.params;

        // Get the contribution
        const contribution = await Contribution.findById(contributionId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        // Get all approved users
        const approvedUsers = await User.find({ status: 'approved' }).select('_id name email').sort({ name: 1 });

        // Get all payments for this contribution
        const payments = await Payment.find({ contributionId }).populate('userId', 'name email');

        // Create a map of payments by userId
        const paymentMap = {};
        payments.forEach(payment => {
            paymentMap[payment.userId._id.toString()] = payment;
        });

        // Combine users with their payment status
        const memberPayments = approvedUsers.map(user => ({
            userId: user._id,
            name: user.name,
            email: user.email,
            payment: paymentMap[user._id.toString()] || null,
            isPaid: paymentMap[user._id.toString()]?.isPaid || false,
            amountPaid: paymentMap[user._id.toString()]?.amountPaid || 0,
            datePaid: paymentMap[user._id.toString()]?.datePaid || null
        }));

        res.json({
            contribution,
            memberPayments
        });
    } catch (error) {
        console.error('Get member payments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all contributions
// @route   GET /api/contributions
// @access  Private
const getContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find({})
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(contributions);
    } catch (error) {
        console.error('Get contributions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get active contribution for dashboard
// @route   GET /api/contributions/active
// @access  Private
const getActiveContribution = async (req, res) => {
    try {
        const activeContribution = await Contribution.findOne({ status: 'active' })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        if (!activeContribution) {
            return res.json(null);
        }

        // Get user's payment status for this contribution
        const userPayment = await Payment.findOne({
            contributionId: activeContribution._id,
            userId: req.user._id
        });

        res.json({
            contribution: activeContribution,
            userPayment: userPayment || null
        });
    } catch (error) {
        console.error('Get active contribution error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Export payments to Excel for a specific contribution
// @route   GET /api/contributions/:contributionId/payments/export
// @access  Private (Secretary only)
const exportPaymentsToExcel = async (req, res) => {
    try {
        const { contributionId } = req.params;

        // Get the contribution
        const contribution = await Contribution.findById(contributionId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        // Get all approved users
        const approvedUsers = await User.find({ status: 'approved' }).select('_id name email').sort({ name: 1 });

        // Get all payments for this contribution
        const payments = await Payment.find({ contributionId }).populate('userId', 'name email');

        // Create a map of payments by userId
        const paymentMap = {};
        payments.forEach(payment => {
            paymentMap[payment.userId._id.toString()] = payment;
        });

        // Combine users with their payment status
        const memberPayments = approvedUsers.map(user => ({
            userId: user._id,
            name: user.name,
            email: user.email,
            payment: paymentMap[user._id.toString()] || null,
            isPaid: paymentMap[user._id.toString()]?.isPaid || false,
            amountPaid: paymentMap[user._id.toString()]?.amountPaid || 0,
            datePaid: paymentMap[user._id.toString()]?.datePaid || null,
            paymentHistory: paymentMap[user._id.toString()]?.paymentHistory || []
        }));

        // Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payments');

        // Add headers
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Amount Paid', key: 'amountPaid', width: 15 },
            { header: 'Total Required', key: 'totalRequired', width: 15 },
            { header: 'Remaining', key: 'remaining', width: 15 },
            { header: 'Payment Date', key: 'paymentDate', width: 20 },
            { header: 'Payment History', key: 'paymentHistory', width: 50 }
        ];

        // Add data rows
        memberPayments.forEach(member => {
            const remainingAmount = contribution.amountPerPerson - member.amountPaid;
            const paymentHistoryText = member.paymentHistory.map(record =>
                `${new Date(record.datePaid).toLocaleDateString()}: ${record.amount.toLocaleString()} RWF${record.notes ? ` (${record.notes})` : ''}`
            ).join(' | ');

            worksheet.addRow({
                name: member.name,
                email: member.email,
                status: member.isPaid ? 'Fully Paid' : 'Pending',
                amountPaid: member.amountPaid.toLocaleString(),
                totalRequired: contribution.amountPerPerson.toLocaleString(),
                remaining: remainingAmount.toLocaleString(),
                paymentDate: member.isPaid && member.paymentHistory.length > 0
                    ? new Date(member.paymentHistory[member.paymentHistory.length - 1].datePaid).toLocaleDateString()
                    : '',
                paymentHistory: paymentHistoryText
            });
        });

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4A2C6D' } // Ahava purple color
        };

        // Style data rows based on payment status
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                const statusCell = row.getCell('status');
                if (statusCell.value === 'Fully Paid') {
                    row.eachCell(cell => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF2E5B38' } // Green for paid
                        };
                        cell.font = { color: { argb: 'FFFFFFFF' } };
                    });
                } else {
                    row.eachCell(cell => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF6B2C2C' } // Red for pending
                        };
                        cell.font = { color: { argb: 'FFFFFFFF' } };
                    });
                }
            }
        });

        // Set the response headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Payments_${contribution.title.replace(/\s+/g, '_')}.xlsx"`);

        // Write the workbook to the response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export payments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createContribution,
    addPayment,
    markAsPaid,
    getMemberPayments,
    getContributions,
    getActiveContribution,
    exportPaymentsToExcel
};

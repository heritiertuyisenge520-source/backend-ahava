const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
connectDB();

// Create admin user if it doesn't exist
const createAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ username: 'TUYISENGE.Heritier' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            const adminUser = new User({
                username: 'TUYISENGE.Heritier',
                name: 'Hertier TUYISENGE',
                email: 'admin@ahava.choir',
                phoneNumber: '+250787581007',
                role: 'President',
                dateOfBirth: '1990-01-01',
                placeOfBirth: 'Kigali',
                placeOfResidence: 'Kigali',
                yearOfStudy: '',
                university: '',
                gender: 'Male',
                maritalStatus: 'Single',
                homeParishName: 'Ahava Parish',
                homeParishLocation: {
                    cell: 'Central',
                    sector: 'Nyarugenge',
                    district: 'Nyarugenge'
                },
                schoolResidence: 'Kigali',
                password: hashedPassword,
                status: 'approved' // Admin is automatically approved
            });

            await adminUser.save();
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

createAdminUser();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/songs', require('./routes/songRoutes'));
app.use('/api/attendances', require('./routes/attendanceRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Ahava Choir Management API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

console.log(`Environment PORT: ${process.env.PORT}`);
console.log(`Using PORT: ${PORT}`);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

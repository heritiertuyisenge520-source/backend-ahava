const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

// Escape regex special characters
const escapeRegex = (string) => {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        let { username, name, email, phoneNumber, profilePictureUrl, role, dateOfBirth, placeOfBirth, placeOfResidence, yearOfStudy, university, gender, maritalStatus, homeParishName, homeParishLocation, schoolResidence, password } = req.body;

        // Generate username if not provided
        if (!username) {
            const nameParts = name.trim().split(/\s+/);
            const lastName = nameParts[nameParts.length - 1] || '';
            const firstName = nameParts[0] || '';

            username = lastName;
            // Check if username already exists
            const existingUser = await User.findOne({
                username: new RegExp(`^${escapeRegex(lastName)}$`, 'i')
            });
            if (existingUser && firstName) {
                username = `${lastName}.${firstName}`;
            }
        }

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username: new RegExp(`^${escapeRegex(username)}$`, 'i') }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            name,
            email,
            phoneNumber,
            profilePictureUrl,
            role,
            dateOfBirth,
            placeOfBirth,
            placeOfResidence,
            yearOfStudy,
            university,
            gender,
            maritalStatus,
            homeParishName,
            homeParishLocation,
            schoolResidence,
            password: hashedPassword
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${escapeRegex(username)}$`, 'i') } },
                { email: { $regex: new RegExp(`^${escapeRegex(username)}$`, 'i') } }
            ]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check if user is approved
            if (user.status !== 'approved') {
                return res.status(403).json({
                    message: user.status === 'pending'
                        ? 'Your account is pending approval. Please wait for the President to confirm you.'
                        : 'Your account has been rejected. Please contact the administrator.'
                });
            }

            const token = generateToken(user._id);
            res.json({
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.profilePictureUrl = req.body.profilePictureUrl || user.profilePictureUrl;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
            user.placeOfBirth = req.body.placeOfBirth || user.placeOfBirth;
            user.placeOfResidence = req.body.placeOfResidence || user.placeOfResidence;
            user.yearOfStudy = req.body.yearOfStudy || user.yearOfStudy;
            user.university = req.body.university || user.university;
            user.gender = req.body.gender || user.gender;
            user.maritalStatus = req.body.maritalStatus || user.maritalStatus;
            user.homeParishName = req.body.homeParishName || user.homeParishName;
            user.homeParishLocation = req.body.homeParishLocation || user.homeParishLocation;
            user.schoolResidence = req.body.schoolResidence || user.schoolResidence;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            const token = generateToken(updatedUser._id);

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.remove();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.username = req.body.username || user.username;
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.profilePictureUrl = req.body.profilePictureUrl || user.profilePictureUrl;
            user.role = req.body.role || user.role;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
            user.placeOfBirth = req.body.placeOfBirth || user.placeOfBirth;
            user.placeOfResidence = req.body.placeOfResidence || user.placeOfResidence;
            user.yearOfStudy = req.body.yearOfStudy || user.yearOfStudy;
            user.university = req.body.university || user.university;
            user.gender = req.body.gender || user.gender;
            user.maritalStatus = req.body.maritalStatus || user.maritalStatus;
            user.homeParishName = req.body.homeParishName || user.homeParishName;
            user.homeParishLocation = req.body.homeParishLocation || user.homeParishLocation;
            user.schoolResidence = req.body.schoolResidence || user.schoolResidence;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve a user (Admin only)
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.status = 'approved';
            const updatedUser = await user.save();
            res.json({ message: 'User approved successfully', user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reject a user (Admin only)
// @route   PUT /api/users/:id/reject
// @access  Private/Admin
const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.status = 'rejected';
            const updatedUser = await user.save();
            res.json({ message: 'User rejected', user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get pending users (Admin only)
// @route   GET /api/users/pending
// @access  Private/Admin
const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
        res.json(pendingUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    approveUser,
    rejectUser,
    getPendingUsers
};

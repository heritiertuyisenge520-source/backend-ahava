const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    console.log('Auth middleware - Request path:', req.path);
    console.log('Auth middleware - Headers:', req.headers.authorization ? 'Authorization header present' : 'No Authorization header');

    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Auth middleware - No token or invalid format');
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Auth middleware - Token extracted, length:', token.length);

    try {
        // Verify token and get the payload (which contains userId)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Auth middleware - Token decoded, userId:', decoded.userId);

        // Fetch the full user from database (excluding password)
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.log('Auth middleware - User not found for id:', decoded.userId);
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach the full user object to req.user
        req.user = user;
        console.log('Auth middleware - User authenticated:', user.name, 'role:', user.role);
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const adminMiddleware = (req, res, next) => {
    console.log('Admin middleware check - User role:', req.user.role, 'User:', req.user.name || req.user.username);

    if (req.user.role !== 'Advisor' && req.user.role !== 'President' && req.user.role !== 'Accountant' && req.user.role !== 'Secretary') {
        console.log('Access denied - insufficient role:', req.user.role, 'Allowed roles: President, Advisor, Accountant, Secretary');
        return res.status(403).json({
            message: 'Access denied. Admin privileges required.',
            requiredRoles: ['President', 'Advisor', 'Accountant', 'Secretary'],
            userRole: req.user.role
        });
    }

    console.log('Admin access granted for role:', req.user.role);
    next();
};

const songManagerMiddleware = (req, res, next) => {
    console.log('Song manager middleware check - User role:', req.user.role, 'User:', req.user.name || req.user.username);

    if (req.user.role !== 'Advisor' && req.user.role !== 'President' && req.user.role !== 'Song Conductor') {
        console.log('Access denied - insufficient role for song management:', req.user.role);
        return res.status(403).json({ message: 'Access denied. Song management privileges required.' });
    }

    console.log('Song management access granted for role:', req.user.role);
    next();
};

const secretaryMiddleware = (req, res, next) => {
    console.log('Secretary middleware check - User role:', req.user.role, 'User:', req.user.name || req.user.username);

    if (req.user.role !== 'Secretary') {
        console.log('Access denied - only Secretary role allowed:', req.user.role);
        return res.status(403).json({
            message: 'Access denied. Only Secretary role can manage contributions and payments.',
            requiredRoles: ['Secretary'],
            userRole: req.user.role
        });
    }

    console.log('Secretary access granted for role:', req.user.role);
    next();
};

module.exports = { authMiddleware, adminMiddleware, songManagerMiddleware, secretaryMiddleware };

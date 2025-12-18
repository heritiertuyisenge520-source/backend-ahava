const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // Verify token and get the payload (which contains userId)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Fetch the full user from database (excluding password)
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach the full user object to req.user
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const adminMiddleware = (req, res, next) => {
    console.log('Admin middleware check - User role:', req.user.role, 'User:', req.user.name || req.user.username);

    if (req.user.role !== 'Advisor' && req.user.role !== 'President') {
        console.log('Access denied - insufficient role:', req.user.role);
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    console.log('Admin access granted for role:', req.user.role);
    next();
};

module.exports = { authMiddleware, adminMiddleware };
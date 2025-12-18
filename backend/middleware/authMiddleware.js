const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    console.log('Admin middleware check - User role:', req.user.role, 'User:', req.user.username);
    if (req.user.role !== 'Advisor' && req.user.role !== 'President') {
        console.log('Access denied - role not authorized:', req.user.role);
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    console.log('Admin access granted for role:', req.user.role);
    next();
};

module.exports = { authMiddleware, adminMiddleware };

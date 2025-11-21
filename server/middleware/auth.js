// server/middleware/auth.js
import User from '../models/User.js';

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    // Accept "Bearer <token>" or raw token in header
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    console.log('[protectAdmin] authHeader:', authHeader); // debug log
    console.log('[protectAdmin] token:', token); // debug log

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // In your simple scheme token === user._id
    const user = await User.findById(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token or user not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.user = user; // attach user
    next();
  } catch (error) {
    console.error('[protectAdmin] error:', error);
    return res.status(500).json({ success: false, message: 'Server error in auth' });
  }
};


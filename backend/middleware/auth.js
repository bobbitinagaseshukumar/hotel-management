import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * attaches user object to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_at_least_32_characters_long_default';
    const decoded = jwt.verify(token, secret);

    const { rows } = await pool.query(
      'SELECT id, name, email, phone, role, loyalty_points, avatar_url, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

/**
 * Optional auth middleware — attaches user if token present, but does not block.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_at_least_32_characters_long_default';
    const decoded = jwt.verify(token, secret);

    const { rows } = await pool.query(
      'SELECT id, name, email, phone, role, loyalty_points, avatar_url, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length > 0) {
      req.user = rows[0];
    }

    next();
  } catch {
    next();
  }
};

export { authenticate, optionalAuth };
export default authenticate;

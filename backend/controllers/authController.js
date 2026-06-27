import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendEmail } from '../config/nodemailer.js';

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, role, loyalty_points, created_at`,
      [name, email.toLowerCase(), phone || null, passwordHash]
    );

    const user = rows[0];
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/send-otp
 */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const { rows } = await pool.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await pool.query('UPDATE users SET otp = $1, otp_expires = $2 WHERE email = $3', [
      otp,
      otpExpires,
      email.toLowerCase(),
    ]);

    await sendEmail({
      to: email,
      subject: 'Your OTP - Hotel Royale',
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1f2937;">Hotel Royale</h2>
          <p>Hello ${rows[0].name || 'Guest'},</p>
          <p>Your one-time password is:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 8px; letter-spacing: 8px; color: #b45309;">${otp}</div>
          <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

/**
 * POST /api/auth/verify-otp
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const { rows } = await pool.query(
      'SELECT id, name, email, role, otp, otp_expires, loyalty_points FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    // Clear OTP after successful verification
    await pool.query('UPDATE users SET otp = NULL, otp_expires = NULL WHERE id = $1', [user.id]);

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          loyalty_points: user.loyalty_points,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const { rows } = await pool.query(
      'SELECT id, name, email, phone, role, password_hash, loyalty_points, avatar_url, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'This account uses OTP login. Please use the OTP method.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/refresh-token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const { rows } = await pool.query('SELECT id, role, refresh_token FROM users WHERE id = $1', [decoded.userId]);

    if (rows.length === 0 || rows[0].refresh_token !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const user = rows[0];
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const { rows } = await pool.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase()]);
    if (rows.length === 0) {
      // Don't reveal that user doesn't exist
      return res.json({ success: true, message: 'If an account with that email exists, a reset OTP has been sent.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query('UPDATE users SET otp = $1, otp_expires = $2 WHERE email = $3', [
      otp,
      otpExpires,
      email.toLowerCase(),
    ]);

    await sendEmail({
      to: email,
      subject: 'Password Reset OTP - Hotel Royale',
      text: `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1f2937;">Hotel Royale - Password Reset</h2>
          <p>Hello ${rows[0].name || 'Guest'},</p>
          <p>Use this OTP to reset your password:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 16px; background: #fef3c7; border-radius: 8px; letter-spacing: 8px; color: #b45309;">${otp}</div>
          <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'If an account with that email exists, a reset OTP has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Failed to process request.' });
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const { rows } = await pool.query('SELECT id, otp, otp_expires FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1, otp = NULL, otp_expires = NULL, refresh_token = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    res.json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, role, loyalty_points, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    let avatarUrl = req.user.avatar_url;

    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, name, email, phone, role, loyalty_points, avatar_url, created_at`,
      [name, phone, avatarUrl, req.user.id]
    );

    res.json({ success: true, message: 'Profile updated.', data: rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/addresses
 */
const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, postal_code, is_default } = req.body;

    if (!street) {
      return res.status(400).json({ success: false, message: 'Street address is required.' });
    }

    // If this address is default, unset other defaults
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const { rows } = await pool.query(
      `INSERT INTO addresses (user_id, label, street, city, state, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, label || 'Home', street, city, state, postal_code, is_default || false]
    );

    res.status(201).json({ success: true, message: 'Address added.', data: rows[0] });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/auth/addresses
 */
const getAddresses = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/auth/addresses/:id
 */
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, street, city, state, postal_code, is_default } = req.body;

    // Verify ownership
    const existing = await pool.query('SELECT id FROM addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const { rows } = await pool.query(
      `UPDATE addresses SET
        label = COALESCE($1, label),
        street = COALESCE($2, street),
        city = COALESCE($3, city),
        state = COALESCE($4, state),
        postal_code = COALESCE($5, postal_code),
        is_default = COALESCE($6, is_default)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [label, street, city, state, postal_code, is_default, id, req.user.id]
    );

    res.json({ success: true, message: 'Address updated.', data: rows[0] });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/auth/addresses/:id
 */
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [
      id,
      req.user.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    res.json({ success: true, message: 'Address deleted.' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export {
  register,
  sendOTP,
  verifyOTP,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};

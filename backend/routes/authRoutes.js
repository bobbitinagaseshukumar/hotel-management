import { Router } from 'express';
import {
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
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { upload, setUploadDir, handleUploadError } from '../middleware/upload.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put(
  '/profile',
  authenticate,
  setUploadDir('avatars'),
  upload.single('avatar'),
  handleUploadError,
  updateProfile
);

// Address routes (protected)
router.post('/addresses', authenticate, addAddress);
router.get('/addresses', authenticate, getAddresses);
router.put('/addresses/:id', authenticate, updateAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;

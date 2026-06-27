import { Router } from 'express';
import { createCoupon, validateCoupon, getAllCoupons, deleteCoupon } from '../controllers/couponController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/admin.js';

const router = Router();

// Customer validation (authenticated)
router.post('/validate', authenticate, validateCoupon);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('super_admin', 'manager'),
  createCoupon
);

router.get(
  '/',
  authenticate,
  authorize('super_admin', 'manager'),
  getAllCoupons
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'manager'),
  deleteCoupon
);

export default router;

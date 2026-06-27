import { Router } from 'express';
import {
  createReservation,
  getUserReservations,
  updateReservation,
  cancelReservation,
  getAllReservations,
} from '../controllers/reservationController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/admin.js';

const router = Router();

// All reservation routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', createReservation);
router.get('/my', getUserReservations);
router.put('/:id', updateReservation);
router.patch('/:id/cancel', cancelReservation);

// Admin routes
router.get(
  '/admin/all',
  authorize('super_admin', 'manager'),
  getAllReservations
);

export default router;

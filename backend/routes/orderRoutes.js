import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getKitchenOrders,
  getDashboardStats,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/admin.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', createOrder);
router.get('/my', getUserOrders);
router.get('/:id', getOrderById);

// Admin/Staff routes
router.patch(
  '/:id/status',
  authorize('super_admin', 'manager', 'cashier', 'kitchen_staff'),
  updateOrderStatus
);

router.get(
  '/admin/all',
  authorize('super_admin', 'manager', 'cashier'),
  getAllOrders
);

router.get(
  '/kitchen/queue',
  authorize('super_admin', 'manager', 'kitchen_staff'),
  getKitchenOrders
);

router.get(
  '/dashboard/stats',
  authorize('super_admin', 'manager'),
  getDashboardStats
);

export default router;

import { Router } from 'express';
import {
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getTopSellingDishes,
  getCustomerGrowth,
  getRevenueData,
  getLiveOrderCount,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/admin.js';

const router = Router();

// All analytics routes require admin access
router.use(authenticate, authorize('super_admin', 'manager'));

router.get('/daily-sales', getDailySales);
router.get('/weekly-sales', getWeeklySales);
router.get('/monthly-sales', getMonthlySales);
router.get('/top-selling', getTopSellingDishes);
router.get('/customer-growth', getCustomerGrowth);
router.get('/revenue', getRevenueData);
router.get('/live-orders', getLiveOrderCount);

export default router;

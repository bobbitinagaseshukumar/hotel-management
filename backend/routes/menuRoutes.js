import { Router } from 'express';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getCategories,
  createCategory,
  getItemsByCategory,
  getTodaysSpecials,
  getNewArrivals,
  getOffers,
  searchItems,
} from '../controllers/menuController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/admin.js';
import { upload, setUploadDir, handleUploadError } from '../middleware/upload.js';

const router = Router();

// Public routes (place specific routes before parameterized routes)
router.get('/search', searchItems);
router.get('/categories', getCategories);
router.get('/todays-specials', getTodaysSpecials);
router.get('/new-arrivals', getNewArrivals);
router.get('/offers', getOffers);
router.get('/category/:slug', getItemsByCategory);

// Public item routes
router.get('/', getAllItems);
router.get('/:id', getItemById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('super_admin', 'manager'),
  setUploadDir('menu'),
  upload.single('image'),
  handleUploadError,
  createItem
);

router.put(
  '/:id',
  authenticate,
  authorize('super_admin', 'manager'),
  setUploadDir('menu'),
  upload.single('image'),
  handleUploadError,
  updateItem
);

router.delete(
  '/:id',
  authenticate,
  authorize('super_admin', 'manager'),
  deleteItem
);

// Category admin route
router.post(
  '/categories',
  authenticate,
  authorize('super_admin', 'manager'),
  setUploadDir('categories'),
  upload.single('image'),
  handleUploadError,
  createCategory
);

export default router;

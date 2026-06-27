import { Router } from 'express';
import { addReview, getReviews, getItemReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getReviews);
router.get('/item/:menuItemId', getItemReviews);

// Protected routes
router.post('/', authenticate, addReview);

export default router;

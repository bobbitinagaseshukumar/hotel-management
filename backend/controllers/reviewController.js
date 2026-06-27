import pool from '../config/db.js';

/**
 * POST /api/reviews
 */
const addReview = async (req, res) => {
  try {
    const { menu_item_id, order_id, rating, comment } = req.body;

    if (!menu_item_id || !rating) {
      return res.status(400).json({ success: false, message: 'Menu item ID and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // Verify the menu item exists
    const menuItem = await pool.query('SELECT id FROM menu_items WHERE id = $1', [menu_item_id]);
    if (menuItem.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    // If order_id provided, verify it belongs to user and is completed
    if (order_id) {
      const order = await pool.query(
        "SELECT id FROM orders WHERE id = $1 AND user_id = $2 AND status IN ('delivered', 'completed')",
        [order_id, req.user.id]
      );
      if (order.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order not found or not yet completed. You can only review completed orders.',
        });
      }
    }

    // Check if user already reviewed this item for this order
    if (order_id) {
      const existingReview = await pool.query(
        'SELECT id FROM reviews WHERE user_id = $1 AND menu_item_id = $2 AND order_id = $3',
        [req.user.id, menu_item_id, order_id]
      );
      if (existingReview.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this item for this order.' });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, menu_item_id, order_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, menu_item_id, order_id || null, rating, comment || null]
    );

    res.status(201).json({ success: true, message: 'Review added successfully.', data: rows[0] });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/reviews
 * Get all reviews with pagination
 */
const getReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 50);
    const offset = (pageNum - 1) * limitNum;

    const { rows } = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar, mi.name as item_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN menu_items mi ON r.menu_item_id = mi.id
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limitNum, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM reviews');
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        reviews: rows,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/reviews/item/:menuItemId
 */
const getItemReviews = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { page, limit } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const offset = (pageNum - 1) * limitNum;

    const { rows } = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.menu_item_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [menuItemId, limitNum, offset]
    );

    // Get aggregate stats
    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews WHERE menu_item_id = $1`,
      [menuItemId]
    );

    const total = parseInt(statsResult.rows[0].total_reviews, 10);

    res.json({
      success: true,
      data: {
        reviews: rows,
        stats: {
          totalReviews: total,
          avgRating: parseFloat(parseFloat(statsResult.rows[0].avg_rating).toFixed(1)),
          distribution: {
            5: parseInt(statsResult.rows[0].five_star, 10),
            4: parseInt(statsResult.rows[0].four_star, 10),
            3: parseInt(statsResult.rows[0].three_star, 10),
            2: parseInt(statsResult.rows[0].two_star, 10),
            1: parseInt(statsResult.rows[0].one_star, 10),
          },
        },
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error('Get item reviews error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export { addReview, getReviews, getItemReviews };

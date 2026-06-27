import pool from '../config/db.js';

/**
 * POST /api/coupons (Admin)
 */
const createCoupon = async (req, res) => {
  try {
    const { code, discount_percentage, max_discount, min_order_amount, expiry_date, usage_limit } = req.body;

    if (!code || !discount_percentage) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and discount percentage are required.',
      });
    }

    if (discount_percentage <= 0 || discount_percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 1 and 100.',
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO coupons (code, discount_percentage, max_discount, min_order_amount, expiry_date, usage_limit)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        code.toUpperCase().trim(),
        parseFloat(discount_percentage),
        max_discount ? parseFloat(max_discount) : null,
        min_order_amount ? parseFloat(min_order_amount) : 0,
        expiry_date || null,
        usage_limit || 100,
      ]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, 'CREATE_COUPON', 'coupon', rows[0].id, JSON.stringify({ code: rows[0].code }), req.ip]
    );

    res.status(201).json({ success: true, message: 'Coupon created.', data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
    }
    console.error('Create coupon error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/coupons/validate
 */
const validateCoupon = async (req, res) => {
  try {
    const { code, order_amount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM coupons WHERE code = $1 AND is_active = true`,
      [code.toUpperCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    const coupon = rows[0];

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    // Check usage limit
    if (coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' });
    }

    // Check minimum order
    const orderAmt = parseFloat(order_amount) || 0;
    if (orderAmt < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required to use this coupon.`,
      });
    }

    // Calculate discount
    let discount = (orderAmt * parseFloat(coupon.discount_percentage)) / 100;
    if (coupon.max_discount && discount > parseFloat(coupon.max_discount)) {
      discount = parseFloat(coupon.max_discount);
    }

    res.json({
      success: true,
      message: 'Coupon is valid.',
      data: {
        code: coupon.code,
        discount_percentage: coupon.discount_percentage,
        discount_amount: discount.toFixed(2),
        max_discount: coupon.max_discount,
        min_order_amount: coupon.min_order_amount,
      },
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/coupons (Admin)
 */
const getAllCoupons = async (req, res) => {
  try {
    const { active_only } = req.query;

    let query = 'SELECT * FROM coupons';
    if (active_only === 'true') {
      query += ' WHERE is_active = true AND (expiry_date IS NULL OR expiry_date > NOW())';
    }
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/coupons/:id (Admin)
 */
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING id, code', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, 'DELETE_COUPON', 'coupon', id, JSON.stringify({ code: result.rows[0].code }), req.ip]
    );

    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export { createCoupon, validateCoupon, getAllCoupons, deleteCoupon };

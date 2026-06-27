import pool from '../config/db.js';

/**
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      order_type,
      table_number,
      delivery_address_id,
      items,
      payment_method,
      coupon_code,
      loyalty_points_used,
      special_instructions,
    } = req.body;

    if (!order_type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order type and items are required.' });
    }

    const validOrderTypes = ['dine_in', 'takeaway', 'delivery'];
    if (!validOrderTypes.includes(order_type)) {
      return res.status(400).json({ success: false, message: 'Invalid order type. Must be dine_in, takeaway, or delivery.' });
    }

    if (order_type === 'dine_in' && !table_number) {
      return res.status(400).json({ success: false, message: 'Table number is required for dine-in orders.' });
    }

    if (order_type === 'delivery' && !delivery_address_id) {
      return res.status(400).json({ success: false, message: 'Delivery address is required for delivery orders.' });
    }

    await client.query('BEGIN');

    // Fetch all menu items at once
    const itemIds = items.map((i) => i.menu_item_id);
    const menuResult = await client.query(
      `SELECT id, name, price, offer_price, is_offer_item, is_available FROM menu_items WHERE id = ANY($1)`,
      [itemIds]
    );

    const menuMap = {};
    menuResult.rows.forEach((item) => {
      menuMap[item.id] = item;
    });

    // Validate items and calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = menuMap[item.menu_item_id];
      if (!menuItem) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `Menu item ${item.menu_item_id} not found.` });
      }
      if (!menuItem.is_available) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `"${menuItem.name}" is currently unavailable.` });
      }

      const unitPrice = menuItem.is_offer_item && menuItem.offer_price
        ? parseFloat(menuItem.offer_price)
        : parseFloat(menuItem.price);
      const quantity = parseInt(item.quantity, 10) || 1;
      const lineTotal = unitPrice * quantity;
      totalAmount += lineTotal;

      orderItems.push({
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        quantity,
        price: unitPrice,
      });
    }

    // Apply coupon discount
    let discountAmount = 0;
    if (coupon_code) {
      const couponResult = await client.query(
        `SELECT * FROM coupons WHERE code = $1 AND is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()) AND times_used < usage_limit`,
        [coupon_code.toUpperCase()]
      );

      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0];
        if (totalAmount >= parseFloat(coupon.min_order_amount)) {
          discountAmount = (totalAmount * parseFloat(coupon.discount_percentage)) / 100;
          if (coupon.max_discount && discountAmount > parseFloat(coupon.max_discount)) {
            discountAmount = parseFloat(coupon.max_discount);
          }
          await client.query('UPDATE coupons SET times_used = times_used + 1 WHERE id = $1', [coupon.id]);
        }
      }
    }

    // Apply loyalty points
    let loyaltyDiscount = 0;
    const pointsUsed = parseInt(loyalty_points_used, 10) || 0;
    if (pointsUsed > 0) {
      const userResult = await client.query('SELECT loyalty_points FROM users WHERE id = $1', [req.user.id]);
      const available = userResult.rows[0].loyalty_points;
      const actualPoints = Math.min(pointsUsed, available);
      loyaltyDiscount = actualPoints * 0.5; // 1 point = ₹0.50
      discountAmount += loyaltyDiscount;
      await client.query('UPDATE users SET loyalty_points = loyalty_points - $1 WHERE id = $2', [actualPoints, req.user.id]);
    }

    // Calculate tax and final amount
    const taxRate = 0.05; // 5% GST
    const afterDiscount = Math.max(totalAmount - discountAmount, 0);
    const taxAmount = afterDiscount * taxRate;
    const finalAmount = afterDiscount + taxAmount;

    // Loyalty points earned (1 point per ₹100 spent)
    const loyaltyPointsEarned = Math.floor(finalAmount / 100);

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, order_type, table_number, delivery_address_id, status, total_amount,
        discount_amount, tax_amount, final_amount, payment_method, payment_status,
        coupon_code, loyalty_points_used, loyalty_points_earned, special_instructions)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        req.user.id,
        order_type,
        table_number || null,
        delivery_address_id || null,
        totalAmount.toFixed(2),
        discountAmount.toFixed(2),
        taxAmount.toFixed(2),
        finalAmount.toFixed(2),
        payment_method || 'online',
        payment_method === 'cod' ? 'cod' : 'pending',
        coupon_code ? coupon_code.toUpperCase() : null,
        pointsUsed,
        loyaltyPointsEarned,
        special_instructions || null,
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.menu_item_id, item.item_name, item.quantity, item.price]
      );
    }

    // Award loyalty points
    if (loyaltyPointsEarned > 0) {
      await client.query('UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2', [
        loyaltyPointsEarned,
        req.user.id,
      ]);
    }

    await client.query('COMMIT');

    // Fetch complete order with items
    const completeOrder = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'menu_item_id', oi.menu_item_id, 'item_name', oi.item_name,
        'quantity', oi.quantity, 'price', oi.price
      )) as items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [order.id]
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: completeOrder.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  } finally {
    client.release();
  }
};

/**
 * GET /api/orders/my
 */
const getUserOrders = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id, 'menu_item_id', oi.menu_item_id, 'item_name', oi.item_name,
          'quantity', oi.quantity, 'price', oi.price
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const { rows } = await pool.query(query, params);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1' + (status ? ' AND status = $2' : ''),
      status ? [req.user.id, status] : [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
        a.street, a.city, a.state, a.postal_code,
        json_agg(json_build_object(
          'id', oi.id, 'menu_item_id', oi.menu_item_id, 'item_name', oi.item_name,
          'quantity', oi.quantity, 'price', oi.price
        )) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN addresses a ON o.delivery_address_id = a.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id, u.name, u.email, u.phone, a.street, a.city, a.state, a.postal_code`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Non-admin users can only view their own orders
    if (req.user.role === 'customer' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/orders/:id/status (Admin/Staff)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid: ${validStatuses.join(', ')}` });
    }

    const { rows } = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If cancelled, refund loyalty points
    if (status === 'cancelled' && rows[0].loyalty_points_used > 0) {
      await pool.query('UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2', [
        rows[0].loyalty_points_used,
        rows[0].user_id,
      ]);
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, 'UPDATE_ORDER_STATUS', 'order', id, JSON.stringify({ status }), req.ip]
    );

    res.json({ success: true, message: `Order status updated to ${status}.`, data: rows[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/orders/admin/all (Admin)
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, order_type, page, limit, from_date, to_date } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email,
        json_agg(json_build_object(
          'id', oi.id, 'item_name', oi.item_name, 'quantity', oi.quantity, 'price', oi.price
        )) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`o.status = $${paramIndex++}`);
      params.push(status);
    }
    if (order_type) {
      conditions.push(`o.order_type = $${paramIndex++}`);
      params.push(order_type);
    }
    if (from_date) {
      conditions.push(`o.created_at >= $${paramIndex++}`);
      params.push(from_date);
    }
    if (to_date) {
      conditions.push(`o.created_at <= $${paramIndex++}`);
      params.push(to_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC';
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const { rows } = await pool.query(query, params);

    // Count query
    let countQuery = 'SELECT COUNT(*) FROM orders o';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, conditions.length);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/orders/kitchen
 */
const getKitchenOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id, o.order_type, o.table_number, o.status, o.special_instructions, o.created_at,
        json_agg(json_build_object(
          'id', oi.id, 'item_name', oi.item_name, 'quantity', oi.quantity
        ) ORDER BY oi.created_at) as items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.status IN ('confirmed', 'preparing')
       GROUP BY o.id
       ORDER BY o.created_at ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get kitchen orders error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/orders/dashboard/stats (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrdersResult,
      todayOrdersResult,
      todayRevenueResult,
      pendingOrdersResult,
      totalUsersResult,
      totalMenuResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COUNT(*) FROM orders WHERE created_at >= $1', [todayStart]),
      pool.query("SELECT COALESCE(SUM(final_amount), 0) as revenue FROM orders WHERE created_at >= $1 AND payment_status = 'paid'", [todayStart]),
      pool.query("SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'confirmed', 'preparing')"),
      pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['customer']),
      pool.query('SELECT COUNT(*) FROM menu_items WHERE is_available = true'),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders: parseInt(totalOrdersResult.rows[0].count, 10),
        todayOrders: parseInt(todayOrdersResult.rows[0].count, 10),
        todayRevenue: parseFloat(todayRevenueResult.rows[0].revenue),
        pendingOrders: parseInt(pendingOrdersResult.rows[0].count, 10),
        totalCustomers: parseInt(totalUsersResult.rows[0].count, 10),
        activeMenuItems: parseInt(totalMenuResult.rows[0].count, 10),
      },
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getKitchenOrders,
  getDashboardStats,
};

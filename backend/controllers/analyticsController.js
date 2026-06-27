import pool from '../config/db.js';

/**
 * GET /api/analytics/daily-sales
 */
const getDailySales = async (req, res) => {
  try {
    const { days } = req.query;
    const numDays = parseInt(days, 10) || 7;

    const { rows } = await pool.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(AVG(final_amount), 0) as avg_order_value
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         AND payment_status = 'paid'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [numDays]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get daily sales error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/analytics/weekly-sales
 */
const getWeeklySales = async (req, res) => {
  try {
    const { weeks } = req.query;
    const numWeeks = parseInt(weeks, 10) || 4;

    const { rows } = await pool.query(
      `SELECT
        DATE_TRUNC('week', created_at) as week_start,
        COUNT(*) as order_count,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(AVG(final_amount), 0) as avg_order_value
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '1 week' * $1
         AND payment_status = 'paid'
       GROUP BY DATE_TRUNC('week', created_at)
       ORDER BY week_start ASC`,
      [numWeeks]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get weekly sales error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/analytics/monthly-sales
 */
const getMonthlySales = async (req, res) => {
  try {
    const { months } = req.query;
    const numMonths = parseInt(months, 10) || 6;

    const { rows } = await pool.query(
      `SELECT
        DATE_TRUNC('month', created_at) as month_start,
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month_label,
        COUNT(*) as order_count,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(AVG(final_amount), 0) as avg_order_value
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '1 month' * $1
         AND payment_status = 'paid'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month_start ASC`,
      [numMonths]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get monthly sales error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/analytics/top-selling
 */
const getTopSellingDishes = async (req, res) => {
  try {
    const { limit: lim } = req.query;
    const limitNum = Math.min(parseInt(lim, 10) || 10, 50);

    const { rows } = await pool.query(
      `SELECT
        oi.menu_item_id,
        oi.item_name,
        mi.image_url,
        mi.price,
        c.name as category_name,
        SUM(oi.quantity) as total_quantity,
        COUNT(DISTINCT oi.order_id) as total_orders,
        SUM(oi.quantity * oi.price) as total_revenue
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       LEFT JOIN categories c ON mi.category_id = c.id
       JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
       GROUP BY oi.menu_item_id, oi.item_name, mi.image_url, mi.price, c.name
       ORDER BY total_quantity DESC
       LIMIT $1`,
      [limitNum]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get top selling error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/analytics/customer-growth
 */
const getCustomerGrowth = async (req, res) => {
  try {
    const { months } = req.query;
    const numMonths = parseInt(months, 10) || 6;

    const { rows } = await pool.query(
      `SELECT
        DATE_TRUNC('month', created_at) as month_start,
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month_label,
        COUNT(*) as new_customers
       FROM users
       WHERE role = 'customer'
         AND created_at >= NOW() - INTERVAL '1 month' * $1
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month_start ASC`,
      [numMonths]
    );

    // Total customers
    const totalResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'customer'");

    res.json({
      success: true,
      data: {
        growth: rows,
        totalCustomers: parseInt(totalResult.rows[0].count, 10),
      },
    });
  } catch (err) {
    console.error('Get customer growth error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/analytics/revenue
 */
const getRevenueData = async (req, res) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month', 'year'

    let interval;
    switch (period) {
      case 'today':
        interval = '1 day';
        break;
      case 'week':
        interval = '7 days';
        break;
      case 'year':
        interval = '365 days';
        break;
      case 'month':
      default:
        interval = '30 days';
        break;
    }

    const { rows } = await pool.query(
      `SELECT
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(discount_amount), 0) as total_discounts,
        COUNT(*) as total_orders,
        COALESCE(AVG(final_amount), 0) as avg_order_value,
        COALESCE(MAX(final_amount), 0) as max_order_value,
        COALESCE(MIN(final_amount), 0) as min_order_value
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '${interval}'
         AND payment_status = 'paid'`
    );

    // Revenue by payment method
    const paymentMethodResult = await pool.query(
      `SELECT
        payment_method,
        COUNT(*) as order_count,
        COALESCE(SUM(final_amount), 0) as revenue
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '${interval}'
         AND payment_status = 'paid'
       GROUP BY payment_method`
    );

    // Revenue by order type
    const orderTypeResult = await pool.query(
      `SELECT
        order_type,
        COUNT(*) as order_count,
        COALESCE(SUM(final_amount), 0) as revenue
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '${interval}'
         AND payment_status = 'paid'
       GROUP BY order_type`
    );

    res.json({
      success: true,
      data: {
        summary: rows[0],
        byPaymentMethod: paymentMethodResult.rows,
        byOrderType: orderTypeResult.rows,
      },
    });
  } catch (err) {
    console.error('Get revenue data error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/analytics/live-orders
 */
const getLiveOrderCount = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        status,
        COUNT(*) as count
       FROM orders
       WHERE status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery')
       GROUP BY status`
    );

    const statusCounts = {};
    let totalActive = 0;
    rows.forEach((row) => {
      statusCounts[row.status] = parseInt(row.count, 10);
      totalActive += parseInt(row.count, 10);
    });

    res.json({
      success: true,
      data: {
        totalActive,
        byStatus: statusCounts,
      },
    });
  } catch (err) {
    console.error('Get live order count error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export {
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getTopSellingDishes,
  getCustomerGrowth,
  getRevenueData,
  getLiveOrderCount,
};

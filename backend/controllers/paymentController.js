import crypto from 'crypto';
import pool from '../config/db.js';
import razorpayInstance from '../config/razorpay.js';

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for an existing order
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    // Fetch the order
    const { rows } = await pool.query(
      'SELECT id, user_id, final_amount, payment_status FROM orders WHERE id = $1',
      [order_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = rows[0];

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    // Amount in paise (INR smallest unit)
    const amountInPaise = Math.round(parseFloat(order.final_amount) * 100);

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.id,
      notes: {
        order_id: order.id,
        user_id: req.user.id,
      },
    });

    // Save Razorpay order ID
    await pool.query('UPDATE orders SET razorpay_order_id = $1 WHERE id = $2', [razorpayOrder.id, order.id]);

    res.json({
      success: true,
      data: {
        razorpay_order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
};

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'All payment fields are required.' });
    }

    // Verify the signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await pool.query(
        "UPDATE orders SET payment_status = 'failed' WHERE razorpay_order_id = $1",
        [razorpay_order_id]
      );

      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update order with payment details
    const { rows } = await pool.query(
      `UPDATE orders SET
        razorpay_payment_id = $1,
        payment_status = 'paid',
        status = 'confirmed'
       WHERE razorpay_order_id = $2
       RETURNING *`,
      [razorpay_payment_id, razorpay_order_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found for this payment.' });
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        rows[0].user_id,
        'PAYMENT_VERIFIED',
        'order',
        rows[0].id,
        JSON.stringify({ razorpay_payment_id, amount: rows[0].final_amount }),
        req.ip,
      ]
    );

    res.json({
      success: true,
      message: 'Payment verified successfully.',
      data: rows[0],
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

export { createRazorpayOrder, verifyPayment };

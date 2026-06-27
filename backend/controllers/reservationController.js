import pool from '../config/db.js';

/**
 * POST /api/reservations
 */
const createReservation = async (req, res) => {
  try {
    const {
      reservation_type,
      table_number,
      room_type,
      guest_count,
      check_in,
      check_out,
      special_requests,
    } = req.body;

    if (!reservation_type || !check_in) {
      return res.status(400).json({
        success: false,
        message: 'Reservation type and check-in date/time are required.',
      });
    }

    const validTypes = ['table', 'room', 'event'];
    if (!validTypes.includes(reservation_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservation type. Must be table, room, or event.',
      });
    }

    const checkInDate = new Date(check_in);
    if (checkInDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be in the future.',
      });
    }

    if (reservation_type === 'room' && !check_out) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date is required for room reservations.',
      });
    }

    if (check_out && new Date(check_out) <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date.',
      });
    }

    // Check for table conflicts (same table, overlapping time, within 2-hour window)
    if (reservation_type === 'table' && table_number) {
      const conflictWindow = new Date(checkInDate);
      conflictWindow.setHours(conflictWindow.getHours() + 2);

      const conflicts = await pool.query(
        `SELECT id FROM reservations
         WHERE reservation_type = 'table'
           AND table_number = $1
           AND status NOT IN ('cancelled')
           AND check_in < $2
           AND check_in >= $3`,
        [table_number, conflictWindow.toISOString(), checkInDate.toISOString()]
      );

      if (conflicts.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This table is already reserved for the selected time slot.',
        });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO reservations (user_id, reservation_type, table_number, room_type, guest_count, check_in, check_out, special_requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        reservation_type,
        table_number || null,
        room_type || null,
        guest_count || 1,
        check_in,
        check_out || null,
        special_requests || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully.',
      data: rows[0],
    });
  } catch (err) {
    console.error('Create reservation error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/reservations/my
 */
const getUserReservations = async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM reservations WHERE user_id = $1';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY check_in DESC';

    const { rows } = await pool.query(query, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get user reservations error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/reservations/:id
 */
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, room_type, guest_count, check_in, check_out, special_requests } = req.body;

    const existing = await pool.query(
      'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    if (['confirmed', 'cancelled'].includes(existing.rows[0].status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${existing.rows[0].status} reservation.`,
      });
    }

    const { rows } = await pool.query(
      `UPDATE reservations SET
        table_number = COALESCE($1, table_number),
        room_type = COALESCE($2, room_type),
        guest_count = COALESCE($3, guest_count),
        check_in = COALESCE($4, check_in),
        check_out = COALESCE($5, check_out),
        special_requests = COALESCE($6, special_requests)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        table_number || null,
        room_type || null,
        guest_count || null,
        check_in || null,
        check_out || null,
        special_requests !== undefined ? special_requests : null,
        id,
        req.user.id,
      ]
    );

    res.json({ success: true, message: 'Reservation updated.', data: rows[0] });
  } catch (err) {
    console.error('Update reservation error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/reservations/:id/cancel
 */
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Customers can only cancel their own; admins can cancel any
    let query, params;
    if (req.user.role === 'customer') {
      query = "UPDATE reservations SET status = 'cancelled' WHERE id = $1 AND user_id = $2 AND status != 'cancelled' RETURNING *";
      params = [id, req.user.id];
    } else {
      query = "UPDATE reservations SET status = 'cancelled' WHERE id = $1 AND status != 'cancelled' RETURNING *";
      params = [id];
    }

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found or already cancelled.' });
    }

    res.json({ success: true, message: 'Reservation cancelled.', data: rows[0] });
  } catch (err) {
    console.error('Cancel reservation error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/reservations/admin/all (Admin)
 */
const getAllReservations = async (req, res) => {
  try {
    const { status, type, page, limit, from_date, to_date } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM reservations r
      JOIN users u ON r.user_id = u.id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`r.status = $${paramIndex++}`);
      params.push(status);
    }
    if (type) {
      conditions.push(`r.reservation_type = $${paramIndex++}`);
      params.push(type);
    }
    if (from_date) {
      conditions.push(`r.check_in >= $${paramIndex++}`);
      params.push(from_date);
    }
    if (to_date) {
      conditions.push(`r.check_in <= $${paramIndex++}`);
      params.push(to_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY r.check_in DESC';
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const { rows } = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM reservations r';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, conditions.length);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        reservations: rows,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error('Get all reservations error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export {
  createReservation,
  getUserReservations,
  updateReservation,
  cancelReservation,
  getAllReservations,
};

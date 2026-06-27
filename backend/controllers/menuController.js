import pool from '../config/db.js';

/**
 * GET /api/menu
 * Get all menu items with optional filters
 */
const getAllItems = async (req, res) => {
  try {
    const { category, is_veg, is_available, sort_by, order, page, limit } = req.query;

    let query = `
      SELECT mi.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      LEFT JOIN reviews r ON mi.id = r.menu_item_id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`c.slug = $${paramIndex++}`);
      params.push(category);
    }

    if (is_veg !== undefined) {
      conditions.push(`mi.is_veg = $${paramIndex++}`);
      params.push(is_veg === 'true');
    }

    if (is_available !== undefined) {
      conditions.push(`mi.is_available = $${paramIndex++}`);
      params.push(is_available === 'true');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY mi.id, c.name, c.slug';

    // Sorting
    const validSorts = ['price', 'name', 'created_at', 'avg_rating'];
    const sortField = validSorts.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    if (sortField === 'avg_rating') {
      query += ` ORDER BY avg_rating ${sortOrder}`;
    } else {
      query += ` ORDER BY mi.${sortField} ${sortOrder}`;
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const { rows } = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT mi.id) FROM menu_items mi LEFT JOIN categories c ON mi.category_id = c.id';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, params.slice(0, conditions.length));
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        items: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    console.error('Get all items error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/menu/:id
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT mi.*, c.name as category_name, c.slug as category_slug,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(r.id) as review_count
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       LEFT JOIN reviews r ON mi.id = r.menu_item_id
       WHERE mi.id = $1
       GROUP BY mi.id, c.name, c.slug`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/menu (Admin)
 */
const createItem = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      is_todays_special,
      is_new_arrival,
      is_offer_item,
      offer_price,
      is_available,
      is_veg,
      preparation_time,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      `INSERT INTO menu_items (category_id, name, description, price, image_url,
        is_todays_special, is_new_arrival, is_offer_item, offer_price, is_available, is_veg, preparation_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        category_id || null,
        name,
        description || null,
        parseFloat(price),
        imageUrl,
        is_todays_special === 'true' || is_todays_special === true || false,
        is_new_arrival === 'true' || is_new_arrival === true || false,
        is_offer_item === 'true' || is_offer_item === true || false,
        offer_price ? parseFloat(offer_price) : null,
        is_available !== 'false' && is_available !== false,
        is_veg !== 'false' && is_veg !== false,
        parseInt(preparation_time, 10) || 15,
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, 'CREATE_MENU_ITEM', 'menu_item', rows[0].id, JSON.stringify({ name, price }), req.ip]
    );

    res.status(201).json({ success: true, message: 'Menu item created.', data: rows[0] });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/menu/:id (Admin)
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      is_todays_special,
      is_new_arrival,
      is_offer_item,
      offer_price,
      is_available,
      is_veg,
      preparation_time,
    } = req.body;

    const existing = await pool.query('SELECT id FROM menu_items WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    let imageUrl = undefined;
    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      `UPDATE menu_items SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        image_url = COALESCE($5, image_url),
        is_todays_special = COALESCE($6, is_todays_special),
        is_new_arrival = COALESCE($7, is_new_arrival),
        is_offer_item = COALESCE($8, is_offer_item),
        offer_price = COALESCE($9, offer_price),
        is_available = COALESCE($10, is_available),
        is_veg = COALESCE($11, is_veg),
        preparation_time = COALESCE($12, preparation_time)
       WHERE id = $13
       RETURNING *`,
      [
        category_id || null,
        name || null,
        description !== undefined ? description : null,
        price ? parseFloat(price) : null,
        imageUrl || null,
        is_todays_special !== undefined ? (is_todays_special === 'true' || is_todays_special === true) : null,
        is_new_arrival !== undefined ? (is_new_arrival === 'true' || is_new_arrival === true) : null,
        is_offer_item !== undefined ? (is_offer_item === 'true' || is_offer_item === true) : null,
        offer_price ? parseFloat(offer_price) : null,
        is_available !== undefined ? (is_available === 'true' || is_available === true) : null,
        is_veg !== undefined ? (is_veg === 'true' || is_veg === true) : null,
        preparation_time ? parseInt(preparation_time, 10) : null,
        id,
      ]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, 'UPDATE_MENU_ITEM', 'menu_item', id, JSON.stringify({ name }), req.ip]
    );

    res.json({ success: true, message: 'Menu item updated.', data: rows[0] });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/menu/:id (Admin)
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING id, name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, 'DELETE_MENU_ITEM', 'menu_item', id, JSON.stringify({ name: result.rows[0].name }), req.ip]
    );

    res.json({ success: true, message: 'Menu item deleted.' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/menu/categories
 */
const getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(mi.id) as item_count
       FROM categories c
       LEFT JOIN menu_items mi ON c.id = mi.category_id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/menu/categories (Admin)
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, description, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, slug, description || null, imageUrl]
    );

    res.status(201).json({ success: true, message: 'Category created.', data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Category with this name already exists.' });
    }
    console.error('Create category error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/menu/category/:slug
 */
const getItemsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await pool.query('SELECT * FROM categories WHERE slug = $1', [slug]);
    if (category.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { rows } = await pool.query(
      `SELECT mi.*, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
       FROM menu_items mi
       LEFT JOIN reviews r ON mi.id = r.menu_item_id
       WHERE mi.category_id = $1 AND mi.is_available = true
       GROUP BY mi.id
       ORDER BY mi.created_at DESC`,
      [category.rows[0].id]
    );

    res.json({
      success: true,
      data: {
        category: category.rows[0],
        items: rows,
      },
    });
  } catch (err) {
    console.error('Get items by category error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/menu/todays-specials
 */
const getTodaysSpecials = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mi.*, c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       LEFT JOIN reviews r ON mi.id = r.menu_item_id
       WHERE mi.is_todays_special = true AND mi.is_available = true
       GROUP BY mi.id, c.name
       ORDER BY mi.created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get todays specials error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/menu/new-arrivals
 */
const getNewArrivals = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mi.*, c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       LEFT JOIN reviews r ON mi.id = r.menu_item_id
       WHERE mi.is_new_arrival = true AND mi.is_available = true
       GROUP BY mi.id, c.name
       ORDER BY mi.created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get new arrivals error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/menu/offers
 */
const getOffers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mi.*, c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       LEFT JOIN reviews r ON mi.id = r.menu_item_id
       WHERE mi.is_offer_item = true AND mi.is_available = true
       GROUP BY mi.id, c.name
       ORDER BY mi.created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get offers error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/menu/search?q=query
 */
const searchItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }

    const searchTerm = `%${q.trim()}%`;

    const { rows } = await pool.query(
      `SELECT mi.*, c.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       LEFT JOIN reviews r ON mi.id = r.menu_item_id
       WHERE (mi.name ILIKE $1 OR mi.description ILIKE $1 OR c.name ILIKE $1)
         AND mi.is_available = true
       GROUP BY mi.id, c.name
       ORDER BY mi.name ASC
       LIMIT 50`,
      [searchTerm]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Search items error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export {
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
};

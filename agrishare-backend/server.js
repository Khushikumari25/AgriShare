// =======================================================
// AgriShare Backend — server.js (FIXED & COMPLETE)
// =======================================================

'use strict';

const express    = require('express');
const mysql      = require('mysql2/promise');
const bcrypt     = require('bcrypt');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const { body, param, validationResult } = require('express-validator');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// =======================================================
// DATABASE
// =======================================================
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASS     || '',
  database:           process.env.DB_NAME     || 'agrishare',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
  timezone:           '+05:30',
});

// =======================================================
// MIDDLEWARE
// =======================================================
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://127.0.0.1:5500,http://localhost:5500,http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, cb) => cb(null, true), // Development mein sab allow
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
});

// =======================================================
// MULTER — Photo Upload
// =======================================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `user_${req.user?.id || Date.now()}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

app.use('/uploads', express.static(uploadDir));

// =======================================================
// HELPERS
// =======================================================
function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
}

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'access_secret_CHANGE_ME',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret_CHANGE_ME',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });
}

// =======================================================
// AUTH MIDDLEWARE
// =======================================================
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token missing.' });
  }
  try {
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_CHANGE_ME');
    req.user      = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token.' });
  }
}

// Admin auth middleware
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_CHANGE_ME');
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Not admin' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// Admin credentials
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@agrishare.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@AgriShare2024';

// =======================================================
// HEALTH CHECK
// =======================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ success: true, message: 'AgriShare API is running 🌾', db: 'MySQL connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database unreachable', error: err.message });
  }
});

// =======================================================
// AUTH ROUTES
// =======================================================
app.post('/api/auth/signup', authLimiter, [
  body('full_name').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('mobile').trim().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['farmer', 'owner', 'driver']).withMessage('Role must be: farmer, owner, or driver'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('lang_pref').optional().isIn(['en', 'hi', 'gu', 'bh', 'bn', 'mr', 'hr', 'uk']),
], async (req, res) => {
  if (!validate(req, res)) return;
  const { full_name, mobile, email, password, role, location, lang_pref = 'en' } = req.body;
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE mobile = ? OR email = ? LIMIT 1', [mobile, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this mobile number or email already exists.' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, mobile, email, password_hash, role, location, lang_pref) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, mobile, email, password_hash, role, location, lang_pref]
    );
    const userId       = result.insertId;
    const tokenPayload = { id: userId, role, email };
    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [userId, refreshToken, expiresAt]);
    return res.status(201).json({
      success: true, message: 'Account created successfully! Welcome to AgriShare 🌾',
      accessToken, refreshToken,
      user: { id: userId, full_name, mobile, email, role, location, lang_pref },
    });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

app.post('/api/auth/login', authLimiter, [
  body('credential').trim().notEmpty().withMessage('Mobile number or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  if (!validate(req, res)) return;
  const { credential, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE (mobile = ? OR email = ?) AND is_active = 1 LIMIT 1', [credential, credential]
    );
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const tokenPayload = { id: user.id, role: user.role, email: user.email };
    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt]);
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, message: `Welcome back, ${user.full_name}! 🌾`, accessToken, refreshToken, user: safeUser });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token is required.' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_CHANGE_ME');
    const [rows]  = await pool.execute('SELECT id FROM refresh_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1', [refreshToken]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Refresh token is invalid or expired.' });
    const newAccessToken = signAccessToken({ id: decoded.id, role: decoded.role, email: decoded.email });
    return res.json({ success: true, accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// =======================================================
// USER ROUTES
// =======================================================
app.get('/api/users/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, full_name, mobile, email, role, location, lang_pref, profile_photo, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('[users/me]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/users/me', requireAuth, [
  body('full_name').optional().trim().isLength({ min: 3 }),
  body('location').optional().trim().notEmpty(),
  body('lang_pref').optional().isIn(['en', 'hi', 'gu', 'bh', 'bn', 'mr', 'hr', 'uk']),
], async (req, res) => {
  if (!validate(req, res)) return;
  const { full_name, location, lang_pref } = req.body;
  try {
    await pool.execute(
      `UPDATE users SET full_name = COALESCE(?, full_name), location = COALESCE(?, location), lang_pref = COALESCE(?, lang_pref) WHERE id = ?`,
      [full_name || null, location || null, lang_pref || null, req.user.id]
    );
    return res.json({ success: true, message: 'Profile updated.' });
  } catch (err) {
    console.error('[users/me PUT]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Profile photo upload
app.post('/api/users/photo', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await pool.execute('UPDATE users SET profile_photo = ? WHERE id = ?', [photoUrl, req.user.id]);
    res.json({ success: true, photo_url: photoUrl, message: 'Photo updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================
// EQUIPMENT ROUTES
// =======================================================
app.get('/api/equipment', async (req, res) => {
  const { category, location, available = '1', page = '1', limit = '12' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let   sql    = 'SELECT * FROM vw_equipment_details WHERE 1=1';
  const args   = [];

  if (available !== '') { sql += ' AND is_available = ?'; args.push(parseInt(available)); }
  if (category)         { sql += ' AND category = ?';     args.push(category); }
  if (location)         { sql += ' AND location LIKE ?';  args.push(`%${location}%`); }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(parseInt(limit), offset);

  try {
    const [rows] = await pool.execute(sql, args);
    return res.json({ success: true, data: rows, page: parseInt(page), limit: parseInt(limit), count: rows.length });
  } catch (err) {
    console.error('[equipment GET]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.get('/api/equipment/:id', [param('id').isInt({ min: 1 })], async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const [rows] = await pool.execute('SELECT * FROM vw_equipment_details WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Equipment not found.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[equipment/:id]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/equipment', requireAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').isIn(['tractor', 'rotavator', 'sprayer', 'harvester', 'vehicle', 'other']),
  body('price_per_day').isFloat({ min: 1 }),
  body('location').trim().notEmpty(),
  body('price_per_hour').optional().isFloat({ min: 1 }),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
], async (req, res) => {
  if (!validate(req, res)) return;
  if (req.user.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Only equipment owners can list equipment.' });
  }
  const { title, category, description, price_per_day, price_per_hour, location, latitude, longitude, image_url } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO equipment (owner_id, title, category, description, price_per_day, price_per_hour, location, latitude, longitude, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, category, description || null, price_per_day, price_per_hour || null, location, latitude || null, longitude || null, image_url || null]
    );
    return res.status(201).json({ success: true, message: 'Equipment listed successfully!', id: result.insertId });
  } catch (err) {
    console.error('[equipment POST]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.put('/api/equipment/:id', requireAuth, [param('id').isInt({ min: 1 })], async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const [rows] = await pool.execute('SELECT owner_id FROM equipment WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Equipment not found.' });
    if (rows[0].owner_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const { title, description, price_per_day, price_per_hour, location, is_available, image_url } = req.body;
    await pool.execute(
      `UPDATE equipment SET title=COALESCE(?,title), description=COALESCE(?,description), price_per_day=COALESCE(?,price_per_day), price_per_hour=COALESCE(?,price_per_hour), location=COALESCE(?,location), is_available=COALESCE(?,is_available), image_url=COALESCE(?,image_url) WHERE id=?`,
      [title||null, description||null, price_per_day||null, price_per_hour||null, location||null, is_available!==undefined?is_available:null, image_url||null, req.params.id]
    );
    return res.json({ success: true, message: 'Equipment updated.' });
  } catch (err) {
    console.error('[equipment PUT]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.delete('/api/equipment/:id', requireAuth, [param('id').isInt({ min: 1 })], async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const [rows] = await pool.execute('SELECT owner_id FROM equipment WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Equipment not found.' });
    if (rows[0].owner_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden.' });
    await pool.execute('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Equipment deleted.' });
  } catch (err) {
    console.error('[equipment DELETE]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =======================================================
// BOOKING ROUTES
// =======================================================
app.post('/api/bookings', requireAuth, [
  body('equipment_id').isInt({ min: 1 }),
  body('start_date').isDate(),
  body('end_date').isDate(),
  body('payment_method').optional().isIn(['upi', 'cash', 'wallet']),
  body('notes').optional().trim(),
], async (req, res) => {
  if (!validate(req, res)) return;
  const { equipment_id, start_date, end_date, payment_method = 'cash', notes } = req.body;
  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ success: false, message: 'End date must be on or after start date.' });
  }
  try {
    const [equip] = await pool.execute('SELECT id, owner_id, price_per_day, is_available, title FROM equipment WHERE id = ? LIMIT 1', [equipment_id]);
    if (!equip.length)           return res.status(404).json({ success: false, message: 'Equipment not found.' });
    if (!equip[0].is_available)  return res.status(409).json({ success: false, message: 'Equipment is currently not available.' });
    if (equip[0].owner_id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot book your own equipment.' });

    const total_days   = Math.max(1, Math.ceil((new Date(end_date) - new Date(start_date)) / (1000*60*60*24)) + 1);
    const total_amount = (total_days * parseFloat(equip[0].price_per_day)).toFixed(2);

    const [conflicts] = await pool.execute(
      `SELECT id FROM bookings WHERE equipment_id=? AND status NOT IN ('cancelled','completed') AND NOT (end_date < ? OR start_date > ?)`,
      [equipment_id, start_date, end_date]
    );
    if (conflicts.length > 0) return res.status(409).json({ success: false, message: 'Equipment is already booked for the selected dates.' });

    const [result] = await pool.execute(
      `INSERT INTO bookings (equipment_id, renter_id, owner_id, start_date, end_date, total_days, total_amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [equipment_id, req.user.id, equip[0].owner_id, start_date, end_date, total_days, total_amount, payment_method, notes || null]
    );
    return res.status(201).json({
      success: true, message: 'Booking created successfully!',
      booking: { id: result.insertId, equipment_id, equipment_title: equip[0].title, start_date, end_date, total_days, total_amount, payment_method, status: 'pending' },
    });
  } catch (err) {
    console.error('[bookings POST]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.get('/api/bookings/my', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM vw_booking_summary WHERE renter_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.get('/api/bookings/incoming', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM vw_booking_summary WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.patch('/api/bookings/:id/status', requireAuth, [
  param('id').isInt({ min: 1 }),
  body('status').isIn(['confirmed', 'cancelled', 'completed']),
], async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const [rows] = await pool.execute('SELECT renter_id, owner_id FROM bookings WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (rows[0].owner_id !== req.user.id && rows[0].renter_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed.' });
    }
    await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    return res.json({ success: true, message: `Booking marked as ${req.body.status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =======================================================
// REVIEW ROUTES
// =======================================================
app.post('/api/reviews', requireAuth, [
  body('booking_id').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim(),
], async (req, res) => {
  if (!validate(req, res)) return;
  const { booking_id, rating, comment } = req.body;
  try {
    const [bk] = await pool.execute(
      `SELECT * FROM bookings WHERE id=? AND status='completed' AND (renter_id=? OR owner_id=?) LIMIT 1`,
      [booking_id, req.user.id, req.user.id]
    );
    if (!bk.length) return res.status(400).json({ success: false, message: 'You can only review after a booking is completed.' });
    const reviewee_id = bk[0].renter_id === req.user.id ? bk[0].owner_id : bk[0].renter_id;
    await pool.execute(
      'INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [booking_id, req.user.id, reviewee_id, rating, comment || null]
    );
    return res.status(201).json({ success: true, message: 'Review submitted! Thank you 🌾' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'You have already reviewed this booking.' });
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.get('/api/reviews/user/:id', [param('id').isInt({ min: 1 })], async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const [rows] = await pool.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS reviewer_name, u.role AS reviewer_role FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.reviewee_id = ? ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : null;
    return res.json({ success: true, data: rows, avg_rating: avg, count: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// =======================================================
// WISHLIST ROUTES
// =======================================================
app.get('/api/wishlist', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT w.id as wishlist_id, w.created_at as saved_at,
             e.id, e.title, e.category, e.price_per_day, e.price_per_hour,
             e.location, e.image_url, e.is_available, u.full_name as owner_name
      FROM wishlist w
      JOIN equipment e ON e.id = w.equipment_id
      JOIN users     u ON u.id = e.owner_id
      WHERE w.user_id = ? ORDER BY w.created_at DESC`, [req.user.id]);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/wishlist/:equipment_id', requireAuth, async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT id FROM wishlist WHERE user_id=? AND equipment_id=?', [req.user.id, req.params.equipment_id]);
    if (existing.length) return res.json({ success: true, message: 'Already in wishlist', already: true });
    await pool.execute('INSERT INTO wishlist (user_id, equipment_id) VALUES (?, ?)', [req.user.id, req.params.equipment_id]);
    res.json({ success: true, message: 'Added to wishlist! ❤️' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/wishlist/:equipment_id', requireAuth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM wishlist WHERE user_id=? AND equipment_id=?', [req.user.id, req.params.equipment_id]);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// =======================================================
// WHATSAPP ROUTES
// =======================================================
app.get('/api/whatsapp/booking/:booking_id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT b.*, e.title as equipment_title, e.location,
             u.full_name as renter_name, u.mobile as renter_mobile,
             o.full_name as owner_name, o.mobile as owner_mobile
      FROM bookings b
      JOIN equipment e ON e.id = b.equipment_id
      JOIN users u ON u.id = b.renter_id
      JOIN users o ON o.id = b.owner_id
      WHERE b.id=? AND (b.renter_id=? OR b.owner_id=?)`, [req.params.booking_id, req.user.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Booking not found' });
    const b = rows[0];
    const ownerMsg  = encodeURIComponent(`🌾 *AgriShare — New Booking!*\n\n📋 Equipment: ${b.equipment_title}\n👤 Renter: ${b.renter_name}\n📱 Mobile: ${b.renter_mobile}\n📅 Dates: ${b.start_date} → ${b.end_date}\n💰 Amount: ₹${parseFloat(b.total_amount).toLocaleString('en-IN')}\n💳 Payment: ${b.payment_method?.toUpperCase()}\n\nPlease confirm on AgriShare dashboard.`);
    const farmerMsg = encodeURIComponent(`✅ *AgriShare — Booking Confirmed!*\n\n📋 Equipment: ${b.equipment_title}\n👤 Owner: ${b.owner_name}\n📱 Contact: ${b.owner_mobile}\n📍 Location: ${b.location}\n📅 Dates: ${b.start_date} → ${b.end_date}\n💰 Total: ₹${parseFloat(b.total_amount).toLocaleString('en-IN')}\n\nThank you for using AgriShare! 🌾`);
    res.json({
      success: true,
      owner_whatsapp:  b.owner_mobile  ? `https://wa.me/91${b.owner_mobile.replace(/\D/g,'')}?text=${ownerMsg}`  : null,
      farmer_whatsapp: b.renter_mobile ? `https://wa.me/91${b.renter_mobile.replace(/\D/g,'')}?text=${farmerMsg}` : null,
      booking: b
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// =======================================================
// ADMIN ROUTES
// =======================================================
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', email }, process.env.JWT_ACCESS_SECRET || 'access_secret_CHANGE_ME', { expiresIn: '8h' });
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid admin credentials' });
});

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const [[users]]     = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [[equipment]] = await pool.execute('SELECT COUNT(*) as count FROM equipment');
    const [[bookings]]  = await pool.execute('SELECT COUNT(*) as count FROM bookings');
    const [[revenue]]   = await pool.execute("SELECT COALESCE(SUM(total_amount),0) as total FROM bookings WHERE status='completed'");
    const [[pending]]   = await pool.execute("SELECT COUNT(*) as count FROM bookings WHERE status='pending'");
    const [[confirmed]] = await pool.execute("SELECT COUNT(*) as count FROM bookings WHERE status='confirmed'");
    const [[completed]] = await pool.execute("SELECT COUNT(*) as count FROM bookings WHERE status='completed'");
    const [[cancelled]] = await pool.execute("SELECT COUNT(*) as count FROM bookings WHERE status='cancelled'");
    const [monthly]     = await pool.execute(`SELECT DATE_FORMAT(created_at,'%b %Y') as month, COUNT(*) as bookings, COALESCE(SUM(total_amount),0) as revenue FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at,'%Y-%m') ORDER BY MIN(created_at)`);
    const [roles]       = await pool.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    res.json({ success: true, stats: { users: users.count, equipment: equipment.count, bookings: bookings.count, revenue: parseFloat(revenue.total), pending: pending.count, confirmed: confirmed.count, completed: completed.count, cancelled: cancelled.count }, monthly, roles });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT u.id, u.full_name, u.email, u.mobile, u.role, u.location, u.is_active, u.created_at, COUNT(DISTINCT e.id) as equipment_count, COUNT(DISTINCT b.id) as booking_count FROM users u LEFT JOIN equipment e ON e.owner_id=u.id LEFT JOIN bookings b ON b.renter_id=u.id GROUP BY u.id ORDER BY u.created_at DESC`);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/admin/users/:id/toggle', adminAuth, async (req, res) => {
  try {
    const [user] = await pool.execute('SELECT is_active FROM users WHERE id=?', [req.params.id]);
    if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });
    const newStatus = user[0].is_active ? 0 : 1;
    await pool.execute('UPDATE users SET is_active=? WHERE id=?', [newStatus, req.params.id]);
    res.json({ success: true, is_active: newStatus });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/bookings', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT b.*, u.full_name as renter_name, u.mobile as renter_mobile, e.title as equipment_title, e.category as equipment_category, o.full_name as owner_name FROM bookings b JOIN users u ON u.id=b.renter_id JOIN equipment e ON e.id=b.equipment_id JOIN users o ON o.id=b.owner_id ORDER BY b.created_at DESC LIMIT 200`);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/admin/bookings/:id', adminAuth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM bookings WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/admin/equipment', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT e.*, u.full_name as owner_name, u.mobile as owner_mobile FROM equipment e JOIN users u ON u.id=e.owner_id ORDER BY e.created_at DESC`);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// =======================================================
// 404 + ERROR HANDLERS
// =======================================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});
// ============================================
// PUSH NOTIFICATIONS + REVIEWS AI ROUTES
// server.js mein app.listen se PEHLE paste karo
// ============================================

// MySQL table:
// CREATE TABLE IF NOT EXISTS push_subscriptions (
//   id         INT AUTO_INCREMENT PRIMARY KEY,
//   user_id    INT NOT NULL,
//   endpoint   TEXT NOT NULL,
//   p256dh     TEXT NOT NULL,
//   auth       TEXT NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// );

// Save push subscription
app.post('/api/notifications/subscribe', requireAuth, async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys) return res.status(400).json({ success: false, message: 'Invalid subscription' });
  try {
    // Delete old subscription for this user
    await pool.execute('DELETE FROM push_subscriptions WHERE user_id = ?', [req.user.id]);
    // Save new
    await pool.execute(
      'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
      [req.user.id, endpoint, keys.p256dh, keys.auth]
    );
    res.json({ success: true, message: 'Push notifications enabled!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Unsubscribe
app.delete('/api/notifications/unsubscribe', requireAuth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM push_subscriptions WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Unsubscribed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── FAKE REVIEW DETECTOR ──
// GET /api/reviews/analyze/:equipment_id
app.get('/api/reviews/analyze/:equipment_id', async (req, res) => {
  try {
    const [reviews] = await pool.execute(`
      SELECT r.*, u.full_name, u.created_at as user_joined,
             COUNT(b.id) as user_bookings
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      LEFT JOIN bookings b ON b.renter_id = r.reviewer_id
      WHERE r.reviewee_id IN (
        SELECT owner_id FROM equipment WHERE id = ?
      )
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `, [req.params.equipment_id]);

    const analyzed = reviews.map(r => {
      let suspicionScore = 0;
      const flags = [];

      // Flag 1: New user with extreme rating
      const daysSinceJoin = Math.floor((Date.now() - new Date(r.user_joined)) / (1000*60*60*24));
      if (daysSinceJoin < 7 && (r.rating === 5 || r.rating === 1)) {
        suspicionScore += 30;
        flags.push('Naya account, extreme rating');
      }

      // Flag 2: No bookings but gave review
      if (r.user_bookings === 0) {
        suspicionScore += 40;
        flags.push('Kabhi booking nahi ki');
      }

      // Flag 3: Very short comment
      if (!r.comment || r.comment.length < 10) {
        suspicionScore += 15;
        flags.push('Bahut chhota review');
      }

      // Flag 4: Only 5 star reviews (suspiciously positive)
      if (r.rating === 5 && r.comment && r.comment.length < 20) {
        suspicionScore += 10;
        flags.push('Generic 5-star');
      }

      return {
        ...r,
        suspicion_score: Math.min(suspicionScore, 100),
        is_suspicious: suspicionScore >= 40,
        flags
      };
    });

    const suspicious = analyzed.filter(r => r.is_suspicious).length;
    const avg = reviews.length ? (reviews.reduce((s,r) => s+r.rating, 0) / reviews.length).toFixed(1) : null;
    const adjustedAvg = reviews.length > suspicious
      ? (analyzed.filter(r=>!r.is_suspicious).reduce((s,r)=>s+r.rating,0) / Math.max(1,analyzed.filter(r=>!r.is_suspicious).length)).toFixed(1)
      : avg;

    res.json({
      success: true,
      total_reviews: reviews.length,
      suspicious_count: suspicious,
      avg_rating: avg,
      adjusted_avg: adjustedAvg,
      trust_score: Math.max(0, 100 - Math.round((suspicious / Math.max(1, reviews.length)) * 100)),
      reviews: analyzed
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/reviews/equipment/:id — all reviews for equipment
app.get('/api/reviews/equipment/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*, u.full_name as reviewer_name, u.role as reviewer_role,
             u.profile_photo, u.created_at as reviewer_joined
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      JOIN bookings b ON b.id = r.booking_id
      WHERE b.equipment_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);

    const avg = rows.length
      ? (rows.reduce((s,r) => s+r.rating, 0) / rows.length).toFixed(1)
      : null;

    // Rating distribution
    const dist = {1:0, 2:0, 3:0, 4:0, 5:0};
    rows.forEach(r => dist[r.rating]++);

    res.json({ success: true, data: rows, avg_rating: avg, count: rows.length, distribution: dist });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── DEMAND PREDICTION ──
// GET /api/analytics/demand
app.get('/api/analytics/demand', async (req, res) => {
  try {
    // Bookings per category
    const [categoryDemand] = await pool.execute(`
      SELECT e.category,
             COUNT(b.id) as total_bookings,
             COUNT(CASE WHEN b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_bookings,
             AVG(e.price_per_day) as avg_price
      FROM bookings b
      JOIN equipment e ON e.id = b.equipment_id
      GROUP BY e.category
      ORDER BY total_bookings DESC
    `);

    // Bookings by month (last 6 months)
    const [monthlyTrend] = await pool.execute(`
      SELECT DATE_FORMAT(created_at, '%b') as month,
             DATE_FORMAT(created_at, '%Y-%m') as sort_key,
             COUNT(*) as bookings
      FROM bookings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY sort_key
    `);

    // Peak days
    const [peakDays] = await pool.execute(`
      SELECT DAYNAME(created_at) as day_name, COUNT(*) as bookings
      FROM bookings
      GROUP BY DAYNAME(created_at)
      ORDER BY bookings DESC
      LIMIT 3
    `);

    // Location demand
    const [locationDemand] = await pool.execute(`
      SELECT e.location, COUNT(b.id) as bookings
      FROM bookings b
      JOIN equipment e ON e.id = b.equipment_id
      GROUP BY e.location
      ORDER BY bookings DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      category_demand: categoryDemand,
      monthly_trend: monthlyTrend,
      peak_days: peakDays,
      location_demand: locationDemand
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ============================================
// END PUSH + REVIEWS + ANALYTICS ROUTES
// ============================================

// =======================================================
// START SERVER
// =======================================================
pool.getConnection()
  .then(conn => {
    conn.release();
    app.listen(PORT, () => {
      console.log('');
      console.log('🌾 ================================');
      console.log(`   AgriShare API started!`);
      console.log(`   URL   : http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log('🌾 ================================');
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ Cannot connect to MySQL:', err.message);
    process.exit(1);
  });
// ============================================
// WHATSAPP + WISHLIST + PROFILE PHOTO ROUTES
// server.js mein app.listen se PEHLE paste karo
// ============================================

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ── Upload folder banana ──
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Multer config ──
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

// ── Serve uploaded files ──
app.use('/uploads', express.static(uploadDir));

// ============================================
// PROFILE PHOTO UPLOAD
// POST /api/users/photo
// ============================================
app.post('/api/users/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const photoUrl = `/uploads/${req.file.filename}`;
    await db.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photoUrl, req.user.id]);

    res.json({ success: true, photo_url: photoUrl, message: 'Photo updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Update profile (name, location, lang) ──
app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const { full_name, location, lang_pref } = req.body;
    await db.query(
      'UPDATE users SET full_name = ?, location = ?, lang_pref = ? WHERE id = ?',
      [full_name, location, lang_pref, req.user.id]
    );
    const [[user]] = await db.query(
      'SELECT id, full_name, email, mobile, role, location, lang_pref, profile_photo FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Get my profile ──
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, full_name, email, mobile, role, location, lang_pref, profile_photo, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// WISHLIST / FAVORITES
// ============================================

// GET  /api/wishlist          — meri wishlist
// POST /api/wishlist/:id      — add to wishlist
// DELETE /api/wishlist/:id    — remove from wishlist

app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT w.id as wishlist_id, w.created_at as saved_at,
             e.id, e.title, e.category, e.price_per_day, e.price_per_hour,
             e.location, e.image_url, e.is_available,
             u.full_name as owner_name
      FROM wishlist w
      JOIN equipment e ON e.id = w.equipment_id
      JOIN users     u ON u.id = e.owner_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/wishlist/:equipment_id', authenticateToken, async (req, res) => {
  try {
    // Check already in wishlist
    const [[exists]] = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND equipment_id = ?',
      [req.user.id, req.params.equipment_id]
    );
    if (exists) return res.json({ success: true, message: 'Already in wishlist', already: true });

    await db.query(
      'INSERT INTO wishlist (user_id, equipment_id) VALUES (?, ?)',
      [req.user.id, req.params.equipment_id]
    );
    res.json({ success: true, message: 'Added to wishlist! ❤️' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/wishlist/:equipment_id', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM wishlist WHERE user_id = ? AND equipment_id = ?',
      [req.user.id, req.params.equipment_id]
    );
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// WHATSAPP NOTIFICATION HELPER
// Backend se WhatsApp message links generate karta hai
// ============================================

// Booking create hone pe WhatsApp data return karo
// (equipment-detail.html pe booking success ke baad use karo)
app.get('/api/whatsapp/booking/:booking_id', authenticateToken, async (req, res) => {
  try {
    const [[b]] = await db.query(`
      SELECT b.*, e.title as equipment_title, e.location,
             u.full_name as renter_name, u.mobile as renter_mobile,
             o.full_name as owner_name,  o.mobile as owner_mobile
      FROM bookings b
      JOIN equipment e ON e.id = b.equipment_id
      JOIN users     u ON u.id = b.user_id
      JOIN users     o ON o.id = e.owner_id
      WHERE b.id = ? AND (b.user_id = ? OR e.owner_id = ?)
    `, [req.params.booking_id, req.user.id, req.user.id]);

    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Message for Owner (jab farmer book kare)
    const ownerMsg = encodeURIComponent(
      `🌾 *AgriShare — New Booking!*\n\n` +
      `📋 Equipment: ${b.equipment_title}\n` +
      `👤 Renter: ${b.renter_name}\n` +
      `📱 Mobile: ${b.renter_mobile}\n` +
      `📅 Dates: ${b.start_date} → ${b.end_date}\n` +
      `📆 Days: ${b.total_days}\n` +
      `💰 Amount: ₹${parseFloat(b.total_amount).toLocaleString('en-IN')}\n` +
      `💳 Payment: ${b.payment_method?.toUpperCase()}\n\n` +
      `Please confirm or reject on AgriShare dashboard.`
    );

    // Message for Farmer (jab owner confirm kare)
    const farmerMsg = encodeURIComponent(
      `✅ *AgriShare — Booking Confirmed!*\n\n` +
      `📋 Equipment: ${b.equipment_title}\n` +
      `👤 Owner: ${b.owner_name}\n` +
      `📱 Contact: ${b.owner_mobile}\n` +
      `📍 Location: ${b.location}\n` +
      `📅 Your dates: ${b.start_date} → ${b.end_date}\n` +
      `💰 Total: ₹${parseFloat(b.total_amount).toLocaleString('en-IN')}\n\n` +
      `Thank you for using AgriShare! 🌾`
    );

    res.json({
      success: true,
      owner_whatsapp:  b.owner_mobile  ? `https://wa.me/91${b.owner_mobile.replace(/\D/g,'')}?text=${ownerMsg}`  : null,
      farmer_whatsapp: b.renter_mobile ? `https://wa.me/91${b.renter_mobile.replace(/\D/g,'')}?text=${farmerMsg}` : null,
      booking: b
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// END NEW ROUTES
// ============================================
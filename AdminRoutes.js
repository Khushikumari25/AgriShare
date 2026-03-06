// ============================================
// ADMIN ROUTES — Paste these before app.listen
// ============================================

// Admin credentials (change these!)
const ADMIN_EMAIL    = 'admin@agrishare.com';   // ← apna admin email
const ADMIN_PASSWORD = 'Admin@AgriShare2024';   // ← apna admin password

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', email }, process.env.JWT_ACCESS_SECRET, { expiresIn: '8h' });
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid admin credentials' });
});

// Admin auth middleware
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Not admin' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// Admin — Get all stats
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const [[users]]     = await db.query('SELECT COUNT(*) as count FROM users');
    const [[equipment]] = await db.query('SELECT COUNT(*) as count FROM equipment');
    const [[bookings]]  = await db.query('SELECT COUNT(*) as count FROM bookings');
    const [[revenue]]   = await db.query("SELECT COALESCE(SUM(total_amount),0) as total FROM bookings WHERE status='completed'");
    const [[pending]]   = await db.query("SELECT COUNT(*) as count FROM bookings WHERE status='pending'");
    const [[confirmed]] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE status='confirmed'");
    const [[completed]] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE status='completed'");
    const [[cancelled]] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE status='cancelled'");

    // Monthly bookings (last 6 months)
    const [monthly] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%b %Y') as month,
             COUNT(*) as bookings,
             COALESCE(SUM(total_amount),0) as revenue
      FROM bookings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY MIN(created_at)
    `);

    // Role breakdown
    const [roles] = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');

    res.json({
      success: true,
      stats: {
        users: users.count, equipment: equipment.count,
        bookings: bookings.count, revenue: parseFloat(revenue.total),
        pending: pending.count, confirmed: confirmed.count,
        completed: completed.count, cancelled: cancelled.count,
      },
      monthly, roles
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin — Get all users
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.mobile, u.role, u.location,
             u.is_active, u.created_at,
             COUNT(DISTINCT e.id) as equipment_count,
             COUNT(DISTINCT b.id) as booking_count
      FROM users u
      LEFT JOIN equipment e ON e.owner_id = u.id
      LEFT JOIN bookings  b ON b.user_id  = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin — Block/Unblock user
app.patch('/api/admin/users/:id/toggle', adminAuth, async (req, res) => {
  try {
    const [user] = await db.query('SELECT is_active FROM users WHERE id = ?', [req.params.id]);
    if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });
    const newStatus = user[0].is_active ? 0 : 1;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, is_active: newStatus });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin — Get all bookings
app.get('/api/admin/bookings', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, u.full_name as renter_name, u.mobile as renter_mobile,
             e.title as equipment_title, e.category as equipment_category,
             o.full_name as owner_name
      FROM bookings b
      JOIN users     u ON u.id = b.user_id
      JOIN equipment e ON e.id = b.equipment_id
      JOIN users     o ON o.id = e.owner_id
      ORDER BY b.created_at DESC
      LIMIT 200
    `);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin — Delete any booking
app.delete('/api/admin/bookings/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin — Get all equipment
app.get('/api/admin/equipment', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, u.full_name as owner_name, u.mobile as owner_mobile
      FROM equipment e
      JOIN users u ON u.id = e.owner_id
      ORDER BY e.created_at DESC
    `);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ============================================
// END ADMIN ROUTES
// ============================================
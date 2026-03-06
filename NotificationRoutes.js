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
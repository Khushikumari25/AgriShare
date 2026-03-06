// ============================================
// CHAT SYSTEM + REFERRAL SYSTEM ROUTES
// server.js mein app.listen se PEHLE paste karo
// ============================================

// ============================================
// CHAT SYSTEM
// ============================================

// MySQL mein yeh table banao pehle:
// CREATE TABLE IF NOT EXISTS messages (
//   id           INT AUTO_INCREMENT PRIMARY KEY,
//   sender_id    INT NOT NULL,
//   receiver_id  INT NOT NULL,
//   booking_id   INT DEFAULT NULL,
//   message      TEXT NOT NULL,
//   is_read      TINYINT DEFAULT 0,
//   created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
//   FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
// );

// GET /api/chat/conversations — meri saari conversations
app.get('/api/chat/conversations', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id as user_id, u.full_name, u.profile_photo, u.role,
        m.message as last_message, m.created_at as last_time,
        m.sender_id as last_sender,
        SUM(CASE WHEN m2.is_read=0 AND m2.receiver_id=? THEN 1 ELSE 0 END) as unread_count
      FROM (
        SELECT 
          CASE WHEN sender_id=? THEN receiver_id ELSE sender_id END as other_user,
          MAX(id) as last_msg_id
        FROM messages 
        WHERE sender_id=? OR receiver_id=?
        GROUP BY other_user
      ) conv
      JOIN messages m ON m.id = conv.last_msg_id
      JOIN users u ON u.id = conv.other_user
      LEFT JOIN messages m2 ON (m2.sender_id=conv.other_user AND m2.receiver_id=? AND m2.is_read=0)
      GROUP BY u.id, m.id
      ORDER BY m.created_at DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/chat/:user_id — conversation with specific user
app.get('/api/chat/:user_id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT m.*, 
             s.full_name as sender_name, s.profile_photo as sender_photo
      FROM messages m
      JOIN users s ON s.id = m.sender_id
      WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)
      ORDER BY m.created_at ASC
      LIMIT 100
    `, [req.user.id, req.params.user_id, req.params.user_id, req.user.id]);

    // Mark as read
    await pool.execute(
      'UPDATE messages SET is_read=1 WHERE sender_id=? AND receiver_id=? AND is_read=0',
      [req.params.user_id, req.user.id]
    );

    // Get other user info
    const [userInfo] = await pool.execute(
      'SELECT id, full_name, role, profile_photo, mobile FROM users WHERE id=?',
      [req.params.user_id]
    );

    res.json({ success: true, data: rows, other_user: userInfo[0] || null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/chat/:user_id — send message
app.post('/api/chat/:user_id', requireAuth, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message empty hai' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [req.user.id, req.params.user_id, message.trim()]
    );
    res.json({ success: true, message_id: result.insertId, message: 'Message sent!' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/chat/unread/count — unread message count
app.get('/api/chat/unread/count', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id=? AND is_read=0',
      [req.user.id]
    );
    res.json({ success: true, count: row.count });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ============================================
// REFERRAL SYSTEM
// ============================================

// MySQL mein yeh tables banao:
// CREATE TABLE IF NOT EXISTS referrals (
//   id              INT AUTO_INCREMENT PRIMARY KEY,
//   referrer_id     INT NOT NULL,
//   referred_id     INT DEFAULT NULL,
//   referral_code   VARCHAR(20) NOT NULL UNIQUE,
//   status          ENUM('pending','completed') DEFAULT 'pending',
//   reward_given    TINYINT DEFAULT 0,
//   created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE
// );
//
// ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) DEFAULT NULL;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_points INT DEFAULT 0;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INT DEFAULT NULL;

// GET /api/referral/my — mera referral code aur stats
app.get('/api/referral/my', requireAuth, async (req, res) => {
  try {
    // Generate code if not exists
    const [user] = await pool.execute('SELECT referral_code, referral_points, full_name FROM users WHERE id=?', [req.user.id]);
    let code = user[0]?.referral_code;

    if (!code) {
      code = 'AGR' + req.user.id + Math.random().toString(36).substring(2,6).toUpperCase();
      await pool.execute('UPDATE users SET referral_code=? WHERE id=?', [code, req.user.id]);
    }

    // Referral stats
    const [refs] = await pool.execute(
      'SELECT COUNT(*) as total FROM referrals WHERE referrer_id=?', [req.user.id]
    );
    const [completed] = await pool.execute(
      "SELECT COUNT(*) as total FROM referrals WHERE referrer_id=? AND status='completed'", [req.user.id]
    );

    res.json({
      success: true,
      referral_code: code,
      points: user[0]?.referral_points || 0,
      total_referrals: refs[0].total,
      completed_referrals: completed[0].total,
      share_link: `http://localhost:5500/signup.html?ref=${code}`,
      whatsapp_msg: encodeURIComponent(`🌾 AgriShare pe join karo! Kisan bhaion ke liye best equipment rental platform.\n\nMera referral code use karo: *${code}*\nSign up karo: http://localhost:5500/signup.html?ref=${code}\n\nDono ko bonus milega! 🎁`)
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/referral/apply — referral code apply karo (signup pe)
app.post('/api/referral/apply', requireAuth, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Code required' });
  try {
    // Find referrer
    const [referrer] = await pool.execute(
      'SELECT id, full_name FROM users WHERE referral_code=? AND id!=?', [code, req.user.id]
    );
    if (!referrer.length) return res.status(404).json({ success: false, message: 'Invalid referral code' });

    // Check already referred
    const [already] = await pool.execute('SELECT id FROM referrals WHERE referred_id=?', [req.user.id]);
    if (already.length) return res.status(409).json({ success: false, message: 'Already referred' });

    // Save referral
    await pool.execute(
      'INSERT INTO referrals (referrer_id, referred_id, referral_code, status) VALUES (?, ?, ?, ?)',
      [referrer[0].id, req.user.id, code, 'completed']
    );

    // Give points to referrer (50 points)
    await pool.execute('UPDATE users SET referral_points = referral_points + 50 WHERE id=?', [referrer[0].id]);
    // Give points to new user (25 points)
    await pool.execute('UPDATE users SET referral_points = referral_points + 25, referred_by=? WHERE id=?', [referrer[0].id, req.user.id]);

    res.json({ success: true, message: `Referral applied! ${referrer[0].full_name} ne tumhe refer kiya. Tumhe 25 bonus points mile! 🎁` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/referral/leaderboard — top referrers
app.get('/api/referral/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.full_name, u.referral_points, u.role, u.location,
             COUNT(r.id) as total_referrals
      FROM users u
      LEFT JOIN referrals r ON r.referrer_id = u.id AND r.status='completed'
      WHERE u.referral_points > 0
      GROUP BY u.id
      ORDER BY u.referral_points DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ============================================
// END CHAT + REFERRAL ROUTES
// ============================================
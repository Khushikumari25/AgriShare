-- ============================================
-- MySQL Workbench mein run karo (USE agrishare pehle!)
-- ============================================

USE agrishare;

-- Chat messages table
CREATE TABLE IF NOT EXISTS messages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  sender_id    INT NOT NULL,
  receiver_id  INT NOT NULL,
  message      TEXT NOT NULL,
  is_read      TINYINT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id   INT NOT NULL,
  referred_id   INT DEFAULT NULL,
  referral_code VARCHAR(20) NOT NULL,
  status        ENUM('pending','completed') DEFAULT 'pending',
  reward_given  TINYINT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add columns to users table
ALTER TABLE users ADD COLUMN referral_code   VARCHAR(20)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN referral_points INT          DEFAULT 0;
ALTER TABLE users ADD COLUMN referred_by     INT          DEFAULT NULL;

-- Verify
SELECT 'messages table OK' as status;
SELECT 'referrals table OK' as status;
SELECT 'users columns OK' as status;
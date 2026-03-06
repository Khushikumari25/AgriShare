-- ============================================
-- MySQL Workbench mein yeh run karo
-- ============================================

-- 1. Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  equipment_id INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wish (user_id, equipment_id),
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)  ON DELETE CASCADE
);

-- 2. Profile photo column
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(300) DEFAULT NULL;

-- 3. Verify
SELECT 'wishlist table OK' as status;
SELECT 'profile_photo column OK' as status;
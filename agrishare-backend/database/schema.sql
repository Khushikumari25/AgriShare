-- ============================================
-- AGRISHARE — MySQL Schema
-- Run once:  mysql -u root -p < database/schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS agrishare
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrishare;

-- -----------------------------------------------
-- users
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)  NOT NULL,
  mobile        VARCHAR(15)   NOT NULL UNIQUE,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,           -- bcrypt hash
  role          ENUM('farmer','owner','driver')   NOT NULL DEFAULT 'farmer',
  location      VARCHAR(200)  NOT NULL,
  lang_pref     VARCHAR(5)    NOT NULL DEFAULT 'en',
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mobile (mobile),
  INDEX idx_email  (email)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- equipment
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  owner_id       INT           NOT NULL,
  title          VARCHAR(150)  NOT NULL,
  category       ENUM('tractor','rotavator','sprayer','harvester','vehicle','other') NOT NULL,
  description    TEXT,
  price_per_day  DECIMAL(10,2) NOT NULL,
  price_per_hour DECIMAL(10,2),
  location       VARCHAR(200)  NOT NULL,
  latitude       DECIMAL(10,7),
  longitude      DECIMAL(10,7),
  is_available   TINYINT(1)    NOT NULL DEFAULT 1,
  image_url      VARCHAR(500),
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner     (owner_id),
  INDEX idx_category  (category),
  INDEX idx_available (is_available)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- bookings
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id   INT           NOT NULL,
  renter_id      INT           NOT NULL,
  owner_id       INT           NOT NULL,
  start_date     DATE          NOT NULL,
  end_date       DATE          NOT NULL,
  total_days     INT           NOT NULL DEFAULT 1,
  total_amount   DECIMAL(10,2) NOT NULL,
  status         ENUM('pending','confirmed','active','completed','cancelled') NOT NULL DEFAULT 'pending',
  payment_method ENUM('upi','cash','wallet') DEFAULT 'cash',
  payment_status ENUM('pending','paid','failed','refunded')                  DEFAULT 'pending',
  notes          TEXT,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (renter_id)    REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (owner_id)     REFERENCES users(id)     ON DELETE CASCADE,
  INDEX idx_renter    (renter_id),
  INDEX idx_equipment (equipment_id),
  INDEX idx_status    (status)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- reviews
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  booking_id  INT      NOT NULL UNIQUE,
  reviewer_id INT      NOT NULL,
  reviewee_id INT      NOT NULL,
  rating      TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id)  REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_reviewee (reviewee_id)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- refresh_tokens  (JWT rotation)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB;

-- -----------------------------------------------
-- SEED DATA  (password = "Test@1234")
-- -----------------------------------------------
INSERT IGNORE INTO users
  (full_name, mobile, email, password_hash, role, location, lang_pref)
VALUES
  ('Ramesh Kumar Yadav','9876543210','ramesh@test.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','farmer','Varanasi, UP','hi'),
  ('Suresh Mondal','9876543211','suresh@test.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','owner','Murshidabad, WB','bn'),
  ('Priya Deshmukh','9876543212','priya@test.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','driver','Nashik, MH','mr');

INSERT IGNORE INTO equipment
  (owner_id, title, category, description, price_per_day, price_per_hour, location)
VALUES
  (2,'Mahindra 575 DI Tractor','tractor','47 HP well-maintained tractor.',1500.00,200.00,'Murshidabad, WB'),
  (2,'Fieldking Rotavator','rotavator','5.5 ft, 35-55 HP compatible.',600.00,NULL,'Murshidabad, WB'),
  (2,'Aspee Spray Pump','sprayer','16L battery-operated spray pump.',200.00,NULL,'Murshidabad, WB');

-- -----------------------------------------------
-- VIEWS
-- -----------------------------------------------
CREATE OR REPLACE VIEW vw_equipment_details AS
SELECT
  e.*,
  u.full_name AS owner_name, u.mobile AS owner_mobile,
  COALESCE(AVG(r.rating),0) AS avg_rating,
  COUNT(r.id)               AS review_count
FROM equipment e
JOIN  users    u  ON e.owner_id    = u.id
LEFT JOIN bookings b ON b.equipment_id = e.id
LEFT JOIN reviews  r ON r.booking_id   = b.id
GROUP BY e.id;

CREATE OR REPLACE VIEW vw_booking_summary AS
SELECT
  b.*,
  e.title    AS equipment_title, e.category AS equipment_category,
  rn.full_name AS renter_name,  rn.mobile   AS renter_mobile,
  ow.full_name AS owner_name,   ow.mobile   AS owner_mobile
FROM bookings b
JOIN equipment e  ON b.equipment_id = e.id
JOIN users     rn ON b.renter_id    = rn.id
JOIN users     ow ON b.owner_id     = ow.id;
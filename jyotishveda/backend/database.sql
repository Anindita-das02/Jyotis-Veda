-- ============================================================
-- JyotishVeda — Phase 1 Database Schema
-- Users, Auth, Profiles + core reference data
-- Later phases (birth charts, numerology, matchmaking, AI,
-- reports, payments, admin, knowledge graph) will extend this
-- file with additional tables and stored procedures.
-- ============================================================

CREATE DATABASE IF NOT EXISTS jyotishveda
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jyotishveda;

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  full_name     VARCHAR(150)  NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_profiles (
  id                CHAR(36)      NOT NULL PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  full_name         VARCHAR(150)  NOT NULL,
  gender            ENUM('male','female','other') NOT NULL,
  birth_date        DATE          NOT NULL,
  birth_time        TIME          NOT NULL,
  birth_place       VARCHAR(255)  NOT NULL,
  latitude          DECIMAL(9,6)  NOT NULL,
  longitude         DECIMAL(9,6)  NOT NULL,
  timezone_offset   DECIMAL(4,2)  NOT NULL,
  focus_areas       JSON          NULL,
  notes             TEXT          NULL,
  horoscope_system  ENUM('vedic','western') NOT NULL DEFAULT 'vedic',
  is_premium        TINYINT(1)    NOT NULL DEFAULT 0,
  relation_label    VARCHAR(50)   NOT NULL DEFAULT 'Self',
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_profiles_user (user_id)
) ENGINE=InnoDB;

-- Reference data used across chart/numerology features (Phase 2+)
CREATE TABLE IF NOT EXISTS zodiac_signs (
  id          INT           NOT NULL PRIMARY KEY,
  name        VARCHAR(30)   NOT NULL,
  sanskrit    VARCHAR(30)   NOT NULL,
  symbol      VARCHAR(10)   NOT NULL,
  element     VARCHAR(20)   NOT NULL,
  modality    VARCHAR(20)   NOT NULL,
  ruling_planet VARCHAR(20) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS nakshatras (
  id          INT           NOT NULL PRIMARY KEY,
  name        VARCHAR(30)   NOT NULL,
  ruling_lord VARCHAR(20)   NOT NULL,
  deity       VARCHAR(50)   NULL,
  symbol      VARCHAR(100)  NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS houses (
  house_number  INT           NOT NULL PRIMARY KEY,
  sanskrit_name VARCHAR(30)   NOT NULL,
  significance  VARCHAR(255)  NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Phase 2 — Numerology & Matchmaking report persistence
-- Calculation itself happens in the proven client-side engine
-- (astroEngine.ts); these tables store the *result* so a user's
-- reports survive across sessions/devices and can be listed later.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS numerology_reports (
  id                CHAR(36)      NOT NULL PRIMARY KEY,
  profile_id        CHAR(36)      NOT NULL,
  user_id           CHAR(36)      NOT NULL,
  mulank            INT           NOT NULL,
  bhagyank          INT           NOT NULL,
  namank_chaldean   INT           NOT NULL,
  namank_pythagorean INT          NOT NULL,
  report_json       JSON          NOT NULL,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_numerology_profile FOREIGN KEY (profile_id)
    REFERENCES user_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_numerology_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_numerology_profile (profile_id),
  INDEX idx_numerology_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS matchmaking_reports (
  id                  CHAR(36)      NOT NULL PRIMARY KEY,
  user_id             CHAR(36)      NOT NULL,
  partner1_name       VARCHAR(150)  NOT NULL,
  partner1_birth_date DATE          NOT NULL,
  partner2_name       VARCHAR(150)  NOT NULL,
  partner2_birth_date DATE          NOT NULL,
  total_score         DECIMAL(4,1)  NOT NULL,
  max_score           DECIMAL(4,1)  NOT NULL DEFAULT 36.0,
  manglik_status      VARCHAR(50)   NULL,
  report_json         JSON          NOT NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_match_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_match_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Phase 3 — AI Astrological Counsellor sessions
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_sessions (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  profile_id    CHAR(36)      NOT NULL,
  tradition     VARCHAR(30)   NOT NULL DEFAULT 'parashari',
  title         VARCHAR(150)  NOT NULL DEFAULT 'New Consultation',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_session_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_session_profile FOREIGN KEY (profile_id)
    REFERENCES user_profiles(id) ON DELETE CASCADE,
  INDEX idx_ai_session_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_messages (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  seq           BIGINT        NOT NULL AUTO_INCREMENT,
  session_id    CHAR(36)      NOT NULL,
  role          ENUM('user','assistant') NOT NULL,
  content       TEXT          NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ai_message_seq (seq),
  CONSTRAINT fk_ai_message_session FOREIGN KEY (session_id)
    REFERENCES ai_sessions(id) ON DELETE CASCADE,
  INDEX idx_ai_message_session (session_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Seed data (reference tables only — never user-specific data)
-- ------------------------------------------------------------

INSERT INTO zodiac_signs (id, name, sanskrit, symbol, element, modality, ruling_planet) VALUES
(1,'Aries','Mesha','♈','Fire','Cardinal','Mars'),
(2,'Taurus','Vrishabha','♉','Earth','Fixed','Venus'),
(3,'Gemini','Mithuna','♊','Air','Mutable','Mercury'),
(4,'Cancer','Karka','♋','Water','Cardinal','Moon'),
(5,'Leo','Simha','♌','Fire','Fixed','Sun'),
(6,'Virgo','Kanya','♍','Earth','Mutable','Mercury'),
(7,'Libra','Tula','♎','Air','Cardinal','Venus'),
(8,'Scorpio','Vrishchika','♏','Water','Fixed','Mars'),
(9,'Sagittarius','Dhanu','♐','Fire','Mutable','Jupiter'),
(10,'Capricorn','Makara','♑','Earth','Cardinal','Saturn'),
(11,'Aquarius','Kumbha','♒','Air','Fixed','Saturn'),
(12,'Pisces','Meena','♓','Water','Mutable','Jupiter')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO houses (house_number, sanskrit_name, significance) VALUES
(1,'Tanu Bhava','Self, personality, physical body'),
(2,'Dhana Bhava','Wealth, family, speech'),
(3,'Sahaja Bhava','Courage, siblings, communication'),
(4,'Sukha Bhava','Home, mother, emotional foundation'),
(5,'Putra Bhava','Children, creativity, intelligence'),
(6,'Ripu Bhava','Enemies, disease, service, debt'),
(7,'Yuvati Bhava','Marriage, partnerships, business'),
(8,'Randhra Bhava','Transformation, longevity, occult'),
(9,'Dharma Bhava','Fortune, higher learning, spirituality'),
(10,'Karma Bhava','Career, status, public life'),
(11,'Labha Bhava','Gains, income, aspirations'),
(12,'Vyaya Bhava','Loss, expenditure, liberation')
ON DUPLICATE KEY UPDATE sanskrit_name = VALUES(sanskrit_name);

INSERT INTO nakshatras (id, name, ruling_lord) VALUES
(1,'Ashwini','Ketu'),(2,'Bharani','Venus'),(3,'Krittika','Sun'),
(4,'Rohini','Moon'),(5,'Mrigashira','Mars'),(6,'Ardra','Rahu'),
(7,'Punarvasu','Jupiter'),(8,'Pushya','Saturn'),(9,'Ashlesha','Mercury'),
(10,'Magha','Ketu'),(11,'Purva Phalguni','Venus'),(12,'Uttara Phalguni','Sun'),
(13,'Hasta','Moon'),(14,'Chitra','Mars'),(15,'Swati','Rahu'),
(16,'Vishakha','Jupiter'),(17,'Anuradha','Saturn'),(18,'Jyeshtha','Mercury'),
(19,'Mula','Ketu'),(20,'Purva Ashadha','Venus'),(21,'Uttara Ashadha','Sun'),
(22,'Shravana','Moon'),(23,'Dhanishta','Mars'),(24,'Shatabhisha','Rahu'),
(25,'Purva Bhadrapada','Jupiter'),(26,'Uttara Bhadrapada','Saturn'),(27,'Revati','Mercury')
ON DUPLICATE KEY UPDATE ruling_lord = VALUES(ruling_lord);

-- ------------------------------------------------------------
-- Stored Procedures — Users / Auth
-- ------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_create_user;
DELIMITER //
CREATE PROCEDURE sp_create_user (
  IN p_id CHAR(36),
  IN p_email VARCHAR(255),
  IN p_password_hash VARCHAR(255),
  IN p_full_name VARCHAR(150)
)
BEGIN
  INSERT INTO users (id, email, password_hash, full_name)
  VALUES (p_id, p_email, p_password_hash, p_full_name);

  SELECT id, email, full_name, role, created_at
  FROM users WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_user_by_email;
DELIMITER //
CREATE PROCEDURE sp_get_user_by_email (
  IN p_email VARCHAR(255)
)
BEGIN
  SELECT id, email, password_hash, full_name, role, is_active
  FROM users WHERE email = p_email;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_user;
DELIMITER //
CREATE PROCEDURE sp_get_user (
  IN p_id CHAR(36)
)
BEGIN
  SELECT id, email, full_name, role, is_active, created_at
  FROM users WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_user;
DELIMITER //
CREATE PROCEDURE sp_update_user (
  IN p_id CHAR(36),
  IN p_full_name VARCHAR(150)
)
BEGIN
  UPDATE users SET full_name = p_full_name WHERE id = p_id;
  SELECT id, email, full_name, role, created_at FROM users WHERE id = p_id;
END //
DELIMITER ;

-- ------------------------------------------------------------
-- Stored Procedures — Profiles
-- ------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_create_profile;
DELIMITER //
CREATE PROCEDURE sp_create_profile (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_full_name VARCHAR(150),
  IN p_gender VARCHAR(10),
  IN p_birth_date DATE,
  IN p_birth_time TIME,
  IN p_birth_place VARCHAR(255),
  IN p_latitude DECIMAL(9,6),
  IN p_longitude DECIMAL(9,6),
  IN p_timezone_offset DECIMAL(4,2),
  IN p_focus_areas JSON,
  IN p_notes TEXT,
  IN p_horoscope_system VARCHAR(10),
  IN p_relation_label VARCHAR(50)
)
BEGIN
  INSERT INTO user_profiles (
    id, user_id, full_name, gender, birth_date, birth_time, birth_place,
    latitude, longitude, timezone_offset, focus_areas, notes,
    horoscope_system, relation_label
  ) VALUES (
    p_id, p_user_id, p_full_name, p_gender, p_birth_date, p_birth_time, p_birth_place,
    p_latitude, p_longitude, p_timezone_offset, p_focus_areas, p_notes,
    p_horoscope_system, p_relation_label
  );

  SELECT * FROM user_profiles WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_profiles;
DELIMITER //
CREATE PROCEDURE sp_get_profiles (
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT * FROM user_profiles
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_profile;
DELIMITER //
CREATE PROCEDURE sp_get_profile (
  IN p_profile_id CHAR(36),
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT * FROM user_profiles
  WHERE id = p_profile_id AND user_id = p_user_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_profile;
DELIMITER //
CREATE PROCEDURE sp_update_profile (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_full_name VARCHAR(150),
  IN p_gender VARCHAR(10),
  IN p_birth_date DATE,
  IN p_birth_time TIME,
  IN p_birth_place VARCHAR(255),
  IN p_latitude DECIMAL(9,6),
  IN p_longitude DECIMAL(9,6),
  IN p_timezone_offset DECIMAL(4,2),
  IN p_focus_areas JSON,
  IN p_notes TEXT,
  IN p_horoscope_system VARCHAR(10),
  IN p_relation_label VARCHAR(50)
)
BEGIN
  UPDATE user_profiles SET
    full_name = p_full_name,
    gender = p_gender,
    birth_date = p_birth_date,
    birth_time = p_birth_time,
    birth_place = p_birth_place,
    latitude = p_latitude,
    longitude = p_longitude,
    timezone_offset = p_timezone_offset,
    focus_areas = p_focus_areas,
    notes = p_notes,
    horoscope_system = p_horoscope_system,
    relation_label = p_relation_label
  WHERE id = p_id AND user_id = p_user_id;

  SELECT * FROM user_profiles WHERE id = p_id AND user_id = p_user_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_profile;
DELIMITER //
CREATE PROCEDURE sp_delete_profile (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36)
)
BEGIN
  DELETE FROM user_profiles WHERE id = p_id AND user_id = p_user_id;
  SELECT ROW_COUNT() AS deleted_count;
END //
DELIMITER ;

-- ------------------------------------------------------------
-- Stored Procedures — Numerology Reports (Phase 2)
-- ------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_save_numerology;
DELIMITER //
CREATE PROCEDURE sp_save_numerology (
  IN p_id CHAR(36),
  IN p_profile_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_mulank INT,
  IN p_bhagyank INT,
  IN p_namank_chaldean INT,
  IN p_namank_pythagorean INT,
  IN p_report_json JSON
)
BEGIN
  INSERT INTO numerology_reports (
    id, profile_id, user_id, mulank, bhagyank,
    namank_chaldean, namank_pythagorean, report_json
  ) VALUES (
    p_id, p_profile_id, p_user_id, p_mulank, p_bhagyank,
    p_namank_chaldean, p_namank_pythagorean, p_report_json
  );

  SELECT * FROM numerology_reports WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_numerology;
DELIMITER //
CREATE PROCEDURE sp_get_numerology (
  IN p_profile_id CHAR(36),
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT * FROM numerology_reports
  WHERE profile_id = p_profile_id AND user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
END //
DELIMITER ;

-- ------------------------------------------------------------
-- Stored Procedures — Matchmaking Reports (Phase 2)
-- ------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_create_match_report;
DELIMITER //
CREATE PROCEDURE sp_create_match_report (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_partner1_name VARCHAR(150),
  IN p_partner1_birth_date DATE,
  IN p_partner2_name VARCHAR(150),
  IN p_partner2_birth_date DATE,
  IN p_total_score DECIMAL(4,1),
  IN p_max_score DECIMAL(4,1),
  IN p_manglik_status VARCHAR(50),
  IN p_report_json JSON
)
BEGIN
  INSERT INTO matchmaking_reports (
    id, user_id, partner1_name, partner1_birth_date,
    partner2_name, partner2_birth_date, total_score, max_score,
    manglik_status, report_json
  ) VALUES (
    p_id, p_user_id, p_partner1_name, p_partner1_birth_date,
    p_partner2_name, p_partner2_birth_date, p_total_score, p_max_score,
    p_manglik_status, p_report_json
  );

  SELECT * FROM matchmaking_reports WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_match_reports;
DELIMITER //
CREATE PROCEDURE sp_get_match_reports (
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT id, user_id, partner1_name, partner1_birth_date, partner2_name,
         partner2_birth_date, total_score, max_score, manglik_status, created_at
  FROM matchmaking_reports
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_match_report;
DELIMITER //
CREATE PROCEDURE sp_get_match_report (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT * FROM matchmaking_reports
  WHERE id = p_id AND user_id = p_user_id;
END //
DELIMITER ;

-- ------------------------------------------------------------
-- Stored Procedures — AI Counsellor Sessions (Phase 3)
-- ------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_create_ai_session;
DELIMITER //
CREATE PROCEDURE sp_create_ai_session (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_profile_id CHAR(36),
  IN p_tradition VARCHAR(30),
  IN p_title VARCHAR(150)
)
BEGIN
  INSERT INTO ai_sessions (id, user_id, profile_id, tradition, title)
  VALUES (p_id, p_user_id, p_profile_id, p_tradition, p_title);

  SELECT * FROM ai_sessions WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_ai_sessions;
DELIMITER //
CREATE PROCEDURE sp_get_ai_sessions (
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT s.*,
    (SELECT COUNT(*) FROM ai_messages m WHERE m.session_id = s.id) AS message_count
  FROM ai_sessions s
  WHERE s.user_id = p_user_id
  ORDER BY s.updated_at DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_ai_session;
DELIMITER //
CREATE PROCEDURE sp_get_ai_session (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT * FROM ai_sessions WHERE id = p_id AND user_id = p_user_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_rename_ai_session;
DELIMITER //
CREATE PROCEDURE sp_rename_ai_session (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_title VARCHAR(150)
)
BEGIN
  UPDATE ai_sessions SET title = p_title
  WHERE id = p_id AND user_id = p_user_id;

  SELECT * FROM ai_sessions WHERE id = p_id AND user_id = p_user_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_touch_ai_session;
DELIMITER //
CREATE PROCEDURE sp_touch_ai_session (
  IN p_id CHAR(36)
)
BEGIN
  UPDATE ai_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_ai_session;
DELIMITER //
CREATE PROCEDURE sp_delete_ai_session (
  IN p_id CHAR(36),
  IN p_user_id CHAR(36)
)
BEGIN
  DELETE FROM ai_sessions WHERE id = p_id AND user_id = p_user_id;
  SELECT ROW_COUNT() AS deleted_count;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_ai_message;
DELIMITER //
CREATE PROCEDURE sp_create_ai_message (
  IN p_id CHAR(36),
  IN p_session_id CHAR(36),
  IN p_role VARCHAR(10),
  IN p_content TEXT
)
BEGIN
  INSERT INTO ai_messages (id, session_id, role, content)
  VALUES (p_id, p_session_id, p_role, p_content);

  SELECT * FROM ai_messages WHERE id = p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_ai_messages;
DELIMITER //
CREATE PROCEDURE sp_get_ai_messages (
  IN p_session_id CHAR(36)
)
BEGIN
  SELECT * FROM ai_messages
  WHERE session_id = p_session_id
  ORDER BY seq ASC;
END //
DELIMITER ;



-- Migration 2 : connexion (session par jeton, verrouillage après 5 échecs)
USE nikah_db;
ALTER TABLE members
  ADD COLUMN session_hash CHAR(64) NULL,
  ADD COLUMN session_expires DATETIME NULL,
  ADD COLUMN login_failures INT NOT NULL DEFAULT 0,
  ADD COLUMN locked_until DATETIME NULL,
  ADD INDEX idx_session_hash (session_hash);

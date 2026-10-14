-- Migration 3 : mot de passe oublié (jeton de réinitialisation, valable 30 minutes)
USE nikah_db;
ALTER TABLE members
  ADD COLUMN reset_hash CHAR(64) NULL,
  ADD COLUMN reset_expires DATETIME NULL,
  ADD INDEX idx_reset_hash (reset_hash);

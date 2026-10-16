-- Migration 13 : contestation des sanctions (lien dans l'e-mail) et suivi de leur état
USE nikah_db;
ALTER TABLE member_sanctions
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active',
  ADD COLUMN contest_hash CHAR(64) NULL,
  ADD COLUMN contest_text VARCHAR(2000) NULL,
  ADD COLUMN contested_at DATETIME NULL,
  ADD INDEX idx_contest (contest_hash);

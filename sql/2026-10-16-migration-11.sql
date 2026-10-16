-- Migration 11 : blocage entre membres (temporaire ou définitif) et signalements à l'administration
USE nikah_db;
CREATE TABLE IF NOT EXISTS member_blocks (
  blocker_id INT NOT NULL,
  blocked_id INT NOT NULL,
  until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  INDEX idx_blocked (blocked_id),
  CONSTRAINT fk_blk_a FOREIGN KEY (blocker_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_blk_b FOREIGN KEY (blocked_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS member_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  reported_id INT NOT NULL,
  conversation_id INT NULL,
  reason VARCHAR(40) NOT NULL,
  details VARCHAR(1000) NOT NULL DEFAULT '',
  status ENUM('nouveau','traite') NOT NULL DEFAULT 'nouveau',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conv (conversation_id),
  CONSTRAINT fk_rep_a FOREIGN KEY (reporter_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_b FOREIGN KEY (reported_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_c FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.member_blocks TO 'nikah_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.member_reports TO 'nikah_user'@'%';

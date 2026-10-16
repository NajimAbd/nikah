-- Migration 12 : sanctions des membres (avertissement, suspension, exclusion)
USE nikah_db;
ALTER TABLE members MODIFY status VARCHAR(20) NOT NULL DEFAULT 'actif';
ALTER TABLE members ADD COLUMN suspended_until DATETIME NULL;
CREATE TABLE IF NOT EXISTS member_sanctions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  kind VARCHAR(20) NOT NULL,
  days INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_member (member_id),
  CONSTRAINT fk_sanc_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.member_sanctions TO 'nikah_user'@'%';

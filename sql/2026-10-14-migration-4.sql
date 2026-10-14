-- Migration 4 : photos des membres (stockage privé dans la base, jamais servies publiquement)
USE nikah_db;
CREATE TABLE IF NOT EXISTS member_photos (
  member_id INT NOT NULL PRIMARY KEY,
  mime VARCHAR(50) NOT NULL,
  data MEDIUMBLOB NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photo_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.member_photos TO 'nikah_user'@'%';

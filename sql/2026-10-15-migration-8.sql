-- Migration 8 : messagerie (demande de contact, acceptation, conversation)
USE nikah_db;
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_a INT NOT NULL,
  member_b INT NOT NULL,
  pair_lo INT NOT NULL,
  pair_hi INT NOT NULL,
  status ENUM('demande','acceptee','refusee') NOT NULL DEFAULT 'demande',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pair (pair_lo, pair_hi),
  CONSTRAINT fk_conv_a FOREIGN KEY (member_a) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_b FOREIGN KEY (member_b) REFERENCES members(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  body VARCHAR(1000) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  INDEX idx_conv (conversation_id, id),
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.conversations TO 'nikah_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON nikah_db.messages TO 'nikah_user'@'%';
